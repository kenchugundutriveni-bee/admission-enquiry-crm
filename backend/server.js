const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection pool reference
let db;

// Database and tables setup on server start
async function initializeDatabase() {
  try {
    // 1. First connect without database to ensure it exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'admission_crm';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();
    console.log(`Database "${dbName}" verified/created successfully.`);

    // 2. Initialize connection pool
    db = require('./db');

    // 3. Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'counsellor') NOT NULL,
        phone VARCHAR(20) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        enquiry_id VARCHAR(50) UNIQUE NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        parent_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        course VARCHAR(255) NOT NULL,
        campus VARCHAR(255) NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'New Enquiry',
        assigned_counsellor_id INT NULL,
        source VARCHAR(100) NOT NULL,
        follow_up_date VARCHAR(20) NULL,
        allow_student_remarks BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_counsellor_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        enquiry_id VARCHAR(50) NOT NULL,
        note_text TEXT NOT NULL,
        added_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Seed default admin user
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@gmail.com']);
    if (rows.length === 0) {
      await db.query(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        ['System Admin', 'admin@gmail.com', 'admin123', 'admin', '9876543210']
      );
      console.log('Seeded default admin user: admin@gmail.com');
    }

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Validation helper for enquiry fields
function validateEnquiry(data) {
  const { studentName, parentName, phone, email, courseInterest, campusPreference } = data;
  if (!studentName || !studentName.trim()) return 'Student Full Name is required';
  if (!parentName || !parentName.trim()) return 'Parent / Guardian Name is required';
  if (!phone) return 'Indian Mobile Number is required';
  
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  if (cleanPhone.length !== 10 || !phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid Indian mobile number.';
  }
  
  if (!email || !email.trim()) return 'Email Address is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  
  if (!courseInterest) return 'Course Interest must be selected';
  if (!campusPreference) return 'Campus Preference must be selected';
  
  return null;
}

// Map db row to frontend-friendly camelCase object
function mapEnquiryToFrontend(row, notesMap = {}) {
  return {
    id: row.enquiry_id,
    studentName: row.student_name,
    parentName: row.parent_name,
    phone: row.phone,
    email: row.email,
    courseInterest: row.course,
    campusPreference: row.campus,
    messageDetails: row.message || '',
    admissionStatus: row.status,
    assignedCounsellor: row.assigned_counsellor_email || 'Unassigned',
    followUpDate: row.follow_up_date || '',
    allowStudentRemarks: !!row.allow_student_remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: row.source,
    counsellorNotes: notesMap[row.enquiry_id] || ''
  };
}

// ------------------- API ROUTES -------------------

// 1. POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found. Please contact admin.' });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 2. GET /api/counsellors (Admin gets all counsellors)
app.get('/api/counsellors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE role = "counsellor"');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 3. POST /api/counsellors (Admin creates counsellor account)
app.post('/api/counsellors', async (req, res) => {
  const { name, email, password, phone } = req.body;
  const userRole = req.headers['x-user-role'];

  if (userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }

  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required.' });
  if (!email || !email.trim()) return res.status(400).json({ success: false, message: 'Email is required.' });
  if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  if (!phone) return res.status(400).json({ success: false, message: 'Phone is required.' });

  const phoneRegex = /^[6-9]\d{9}$/;
  if (phone.length !== 10 || !phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid Indian mobile number.' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "counsellor", ?)',
      [name.trim(), email.trim().toLowerCase(), password, phone]
    );

    res.status(201).json({ success: true, message: 'Counsellor created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Helper: load all notes mapped by enquiry_id
async function getNotesMap() {
  const [notesRows] = await db.query('SELECT * FROM notes ORDER BY created_at ASC');
  const notesMap = {};
  notesRows.forEach(n => {
    const timestamp = new Date(n.created_at).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    const noteLine = `\n[${timestamp} by ${n.added_by}]: ${n.note_text}`;
    if (!notesMap[n.enquiry_id]) {
      notesMap[n.enquiry_id] = '';
    }
    notesMap[n.enquiry_id] += notesMap[n.enquiry_id] ? noteLine : noteLine.trim();
  });
  return notesMap;
}

// 4. GET /api/enquiries (Fetch list of enquiries, role-aware)
app.get('/api/enquiries', async (req, res) => {
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];

  if (!userRole || !userEmail) {
    return res.status(401).json({ success: false, message: 'Authentication headers missing.' });
  }

  try {
    let query = `
      SELECT e.*, u.email as assigned_counsellor_email, u.name as assigned_counsellor_name
      FROM enquiries e
      LEFT JOIN users u ON e.assigned_counsellor_id = u.id
    `;
    let params = [];

    if (userRole === 'counsellor') {
      query += ' WHERE u.email = ?';
      params.push(userEmail.trim().toLowerCase());
    }

    query += ' ORDER BY e.created_at DESC';

    const [rows] = await db.query(query, params);
    const notesMap = await getNotesMap();

    const frontendList = rows.map(r => mapEnquiryToFrontend(r, notesMap));
    res.json(frontendList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 5. GET /api/enquiries/:id (Fetch single enquiry details)
app.get('/api/enquiries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.email as assigned_counsellor_email, u.name as assigned_counsellor_name
       FROM enquiries e
       LEFT JOIN users u ON e.assigned_counsellor_id = u.id
       WHERE e.id = ? OR e.enquiry_id = ?`,
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    const notesMap = await getNotesMap();
    res.json(mapEnquiryToFrontend(rows[0], notesMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 6. POST /api/enquiries (Create new enquiry - handles public/admin/counsellor entries)
app.post('/api/enquiries', async (req, res) => {
  const validationError = validateEnquiry(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const { studentName, parentName, phone, email, courseInterest, campusPreference, messageDetails } = req.body;
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];

  try {
    // Duplicate check
    const [duplicates] = await db.query(
      'SELECT * FROM enquiries WHERE phone = ? OR email = ?',
      [phone.trim(), email.trim().toLowerCase()]
    );
    if (duplicates.length > 0) {
      return res.status(400).json({ success: false, message: 'An enquiry already exists with this phone number or email.' });
    }

    // Role-dependent fields setup
    let assignedCounsellorId = null;
    let source = 'Public Web Form';

    if (userRole === 'counsellor' && userEmail) {
      const [userRows] = await db.query('SELECT id FROM users WHERE email = ? AND role = "counsellor"', [userEmail.trim().toLowerCase()]);
      if (userRows.length > 0) {
        assignedCounsellorId = userRows[0].id;
      }
      source = 'Counsellor Entry';
    } else if (userRole === 'admin') {
      source = 'Manual Entry';
    }

    const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 1000);
    const enquiryId = `ENQ-${uniqueSuffix}`;

    await db.query(
      `INSERT INTO enquiries (
        enquiry_id, student_name, parent_name, phone, email, course, campus, message, status, assigned_counsellor_id, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "New Enquiry", ?, ?)`,
      [
        enquiryId,
        studentName.trim(),
        parentName.trim(),
        phone.trim(),
        email.trim().toLowerCase(),
        courseInterest,
        campusPreference,
        (messageDetails || '').trim(),
        assignedCounsellorId,
        source
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully.',
      id: enquiryId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 7. PUT /api/enquiries/:id/status (Update status)
app.put('/api/enquiries/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, followUpDate } = req.body;

  const validStatuses = ['New Enquiry', 'Follow-up', 'Follow-Up', 'Interested', 'Admitted', 'Not Interested'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    await db.query(
      'UPDATE enquiries SET status = ?, follow_up_date = ? WHERE id = ? OR enquiry_id = ?',
      [status, followUpDate || '', id, id]
    );
    res.json({ success: true, message: 'Status updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 8. PUT /api/enquiries/:id/assign (Admin assigns to counsellor)
app.put('/api/enquiries/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assignedCounsellor } = req.body; // Can be email or 'Unassigned'
  const userRole = req.headers['x-user-role'];

  if (userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }

  try {
    let counsellorId = null;
    if (assignedCounsellor && assignedCounsellor !== 'Unassigned') {
      const [rows] = await db.query('SELECT id FROM users WHERE email = ? AND role = "counsellor"', [assignedCounsellor.trim().toLowerCase()]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Counsellor email not found.' });
      }
      counsellorId = rows[0].id;
    }

    await db.query(
      'UPDATE enquiries SET assigned_counsellor_id = ? WHERE id = ? OR enquiry_id = ?',
      [counsellorId, id, id]
    );
    res.json({ success: true, message: 'Enquiry assigned successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 9. DELETE /api/enquiries/:id (Only admin can delete)
app.delete('/api/enquiries/:id', async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers['x-user-role'];

  if (userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }

  try {
    const [result] = await db.query('DELETE FROM enquiries WHERE id = ? OR enquiry_id = ?', [id, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 10. GET /api/enquiries/:id/notes (Get notes history)
app.get('/api/enquiries/:id/notes', async (req, res) => {
  const { id } = req.params;
  try {
    // Resolve true enquiry_id if database ID is passed
    const [rows] = await db.query('SELECT enquiry_id FROM enquiries WHERE id = ? OR enquiry_id = ?', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    const realEnquiryId = rows[0].enquiry_id;

    const [notes] = await db.query('SELECT * FROM notes WHERE enquiry_id = ? ORDER BY created_at ASC', [realEnquiryId]);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 11. POST /api/enquiries/:id/notes (Add progress note)
app.post('/api/enquiries/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { note_text, added_by } = req.body;

  if (!note_text || !note_text.trim()) {
    return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
  }

  try {
    const [rows] = await db.query('SELECT enquiry_id FROM enquiries WHERE id = ? OR enquiry_id = ?', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    const realEnquiryId = rows[0].enquiry_id;

    await db.query(
      'INSERT INTO notes (enquiry_id, note_text, added_by) VALUES (?, ?, ?)',
      [realEnquiryId, note_text.trim(), added_by || 'Staff']
    );

    res.status(201).json({ success: true, message: 'Note added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 12. PUT /api/enquiries/:id (General update route to support all fields update)
app.put('/api/enquiries/:id', async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  try {
    // 1. Find existing record
    const [existing] = await db.query('SELECT * FROM enquiries WHERE id = ? OR enquiry_id = ?', [id, id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    const enquiry = existing[0];
    const realEnquiryId = enquiry.enquiry_id;

    // 2. Destructure inputs
    const {
      studentName,
      parentName,
      phone,
      email,
      courseInterest,
      campusPreference,
      admissionStatus,
      assignedCounsellor, // Email
      followUpDate,
      counsellorNotes,
      allowStudentRemarks
    } = req.body;

    // 3. Status/Date validations
    if (admissionStatus === 'Follow-up' && !followUpDate) {
      return res.status(400).json({ success: false, message: 'Please select a follow-up date.' });
    }

    // 4. Resolve counsellor ID if admin is updating assignment
    let counsellorId = enquiry.assigned_counsellor_id;
    if (userRole === 'admin' && assignedCounsellor !== undefined) {
      if (assignedCounsellor && assignedCounsellor !== 'Unassigned') {
        const [counsellorRows] = await db.query('SELECT id FROM users WHERE email = ? AND role = "counsellor"', [assignedCounsellor.trim().toLowerCase()]);
        if (counsellorRows.length > 0) {
          counsellorId = counsellorRows[0].id;
        }
      } else if (assignedCounsellor === 'Unassigned' || assignedCounsellor === '') {
        counsellorId = null;
      }
    }

    // 5. Build dynamic update query
    let fields = [];
    let params = [];

    if (studentName !== undefined) { fields.push('student_name = ?'); params.push(studentName.trim()); }
    if (parentName !== undefined) { fields.push('parent_name = ?'); params.push(parentName.trim()); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone.trim()); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email.trim().toLowerCase()); }
    if (courseInterest !== undefined) { fields.push('course = ?'); params.push(courseInterest); }
    if (campusPreference !== undefined) { fields.push('campus = ?'); params.push(campusPreference); }
    if (admissionStatus !== undefined) { fields.push('status = ?'); params.push(admissionStatus); }
    if (followUpDate !== undefined) { fields.push('follow_up_date = ?'); params.push(followUpDate || ''); }
    if (allowStudentRemarks !== undefined) { fields.push('allow_student_remarks = ?'); params.push(!!allowStudentRemarks); }
    
    // Set resolved counsellor ID
    fields.push('assigned_counsellor_id = ?');
    params.push(counsellorId);

    // Apply database updates
    if (fields.length > 0) {
      params.push(realEnquiryId);
      await db.query(`UPDATE enquiries SET ${fields.join(', ')} WHERE enquiry_id = ?`, params);
    }

    // 6. Handle Notes audit logging (comparison logic)
    if (counsellorNotes !== undefined) {
      // Fetch currently formatted notes history to see if there is any new additions
      const notesMap = await getNotesMap();
      const oldNotesStr = notesMap[realEnquiryId] || '';
      const newNotesStr = counsellorNotes || '';

      if (newNotesStr !== oldNotesStr) {
        let newNoteText = '';
        if (newNotesStr.startsWith(oldNotesStr)) {
          newNoteText = newNotesStr.slice(oldNotesStr.length).trim();
        } else {
          newNoteText = newNotesStr.trim();
        }

        if (newNoteText) {
          // Parse timestamp header line: e.g. "[timestamp by Name]: note content"
          const headerMatch = newNoteText.match(/^\[([^\]]+) by ([^\]]+)\]:\s*([\s\S]*)$/);
          let finalNoteText = newNoteText;
          let addedBy = userEmail || 'Staff';

          if (headerMatch) {
            addedBy = headerMatch[2];
            finalNoteText = headerMatch[3];
          }

          if (finalNoteText.trim()) {
            await db.query(
              'INSERT INTO notes (enquiry_id, note_text, added_by) VALUES (?, ?, ?)',
              [realEnquiryId, finalNoteText.trim(), addedBy]
            );
          }
        }
      }
    }

    res.json({ success: true, message: 'Enquiry updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 13. GET /api/dashboard (Dashboard counts, role-aware)
app.get('/api/dashboard', async (req, res) => {
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];

  if (!userRole || !userEmail) {
    return res.status(401).json({ success: false, message: 'Authentication headers missing.' });
  }

  // Get current date in India format YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayDateString();

  try {
    let sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'New Enquiry' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'Follow-up' AND follow_up_date = ? THEN 1 ELSE 0 END) as follow_ups_today,
        SUM(CASE WHEN status = 'Interested' THEN 1 ELSE 0 END) as interested,
        SUM(CASE WHEN status = 'Admitted' THEN 1 ELSE 0 END) as admitted,
        SUM(CASE WHEN status = 'Not Interested' THEN 1 ELSE 0 END) as not_interested
      FROM enquiries e
    `;
    let params = [todayStr];

    if (userRole === 'counsellor') {
      sql += `
        LEFT JOIN users u ON e.assigned_counsellor_id = u.id
        WHERE u.email = ?
      `;
      params.push(userEmail.trim().toLowerCase());
    }

    const [rows] = await db.query(sql, params);
    const result = rows[0];

    res.json({
      total: result.total || 0,
      new_count: result.new_count || 0,
      follow_ups_today: result.follow_ups_today || 0,
      interested: result.interested || 0,
      admitted: result.admitted || 0,
      not_interested: result.not_interested || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Initialize database and start HTTP Server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend Server is running on port ${PORT}`);
  });
});
