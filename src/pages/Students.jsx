import React, { useState, useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { Users, Search, Filter, Calendar, XCircle, Trash2, User, BookOpen, MapPin } from 'lucide-react';

export default function Students() {
  const { enquiries, updateEnquiry, deleteEnquiry, users, dashboardFilter, setDashboardFilter } = useContext(CRMContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drawer / Editing state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('');
  const [campusPreference, setCampusPreference] = useState('');
  const [admissionStatus, setAdmissionStatus] = useState('');
  const [assignedCounsellor, setAssignedCounsellor] = useState('');
  const [counsellorNotes, setCounsellorNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const councellors = (users || []).filter(u => u.role === 'counsellor');

  const filteredStudents = enquiries.filter(enq => {
    // Apply dashboard filter
    if (dashboardFilter && dashboardFilter.status) {
      if (enq.admissionStatus !== dashboardFilter.status) return false;
    }

    const studentName = enq.studentName || '';
    const parentName = enq.parentName || '';
    const phone = enq.phone || '';
    const id = enq.id || '';

    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== 'all' && enq.admissionStatus !== statusFilter) return false;

    return true;
  });

  const statuses = ['New Enquiry', 'Follow-up', 'Interested', 'Admitted', 'Not Interested'];
  const courses = [
    'MPC (Maths, Physics, Chemistry)',
    'BiPC (Biology, Physics, Chemistry)',
    'CEC (Civics, Economics, Commerce)',
    'MEC (Maths, Economics, Commerce)',
    'Polytechnic (Diploma)',
    'General Degree (B.Sc / B.Com / B.A)'
  ];
  const campuses = [
    'Main Campus - Rajahmundry',
    'City Campus - Kakinada',
    'Elite Campus - Amalapuram'
  ];

  const handleOpenDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setStudentName(enquiry.studentName);
    setParentName(enquiry.parentName);
    setPhone(enquiry.phone);
    setEmail(enquiry.email || '');
    setCourseInterest(enquiry.courseInterest);
    setCampusPreference(enquiry.campusPreference);
    setAdmissionStatus(enquiry.admissionStatus);
    setAssignedCounsellor(enquiry.assignedCounsellor || '');
    setCounsellorNotes(enquiry.counsellorNotes || '');
    setFollowUpDate(enquiry.followUpDate || '');
    setNewNote('');
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEnquiry(null);
  };

  const handleSaveInteraction = (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    if (!studentName.trim() || !parentName.trim() || !phone.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length !== 10 || !phoneRegex.test(cleanPhone)) {
      alert('Please enter a valid Indian mobile number.');
      return;
    }

    let finalNotes = counsellorNotes;
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      const noteHeader = `\n[${timestamp} by Admin]: `;
      finalNotes = finalNotes 
        ? `${finalNotes}\n${noteHeader}${newNote.trim()}`
        : `${noteHeader}${newNote.trim()}`;
    }

    if (admissionStatus === 'Follow-up' && !followUpDate) {
      alert('Please select a follow-up date.');
      return;
    }

    const updatedData = {
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      phone: cleanPhone,
      email: email.trim(),
      courseInterest,
      campusPreference,
      admissionStatus,
      assignedCounsellor,
      followUpDate: admissionStatus === 'Follow-up' ? followUpDate : '',
      counsellorNotes: finalNotes
    };

    updateEnquiry(selectedEnquiry.id, updatedData);
    alert('Student record updated successfully.');
    handleCloseDrawer();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to permanently delete this student record? This action cannot be undone.')) {
      deleteEnquiry(id);
      handleCloseDrawer();
    }
  };

  const getStatusBadge = (status) => {
    let cls = 'badge-enquired';
    if (status === 'Follow-up') cls = 'badge-followup';
    if (status === 'Admitted') cls = 'badge-admitted';
    if (status === 'Not Interested') cls = 'badge-closed';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      gap: '20px',
      height: 'calc(100vh - var(--topbar-height) - 60px)',
      position: 'relative'
    }}>
      
      {/* LEFT: Table List */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Active Filter Banner */}
        {dashboardFilter && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: 'var(--primary-light)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: 'var(--primary)',
            fontWeight: 600
          }}>
            <span>Active Filter: {dashboardFilter.status === 'New Enquiry' ? 'New Enquiries' : dashboardFilter.status === 'Interested' ? 'Interested Leads' : dashboardFilter.status === 'Not Interested' ? 'Not Interested Leads' : dashboardFilter.status}</span>
            <button 
              onClick={() => setDashboardFilter(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 700
              }}
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Controls */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)'
            }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search students registry by name, parent, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Status:
            </label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="all">All Registrations</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="custom-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student / Parent</th>
                <th>Contact</th>
                <th>Course / Campus</th>
                <th>Status</th>
                <th>Counsellor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} onClick={() => handleOpenDetail(student)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '13px' }}>
                      {student.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{student.studentName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Parent/Guardian: {student.parentName}</div>
                    </td>
                    <td>
                      <div>+91 {student.phone}</div>
                      {student.email && <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{student.email}</div>}
                    </td>
                    <td>
                      <div>{student.courseInterest}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{student.campusPreference}</div>
                    </td>
                    <td>{getStatusBadge(student.admissionStatus)}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {users.find(u => u.email === student.assignedCounsellor)?.name || 'Unassigned'}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(student);
                        }}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Detail Slide Drawer */}
      {drawerOpen && selectedEnquiry && (
        <div style={{
          width: '390px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 10,
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-app)'
          }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)' }}>EDIT STUDENT RECORD</span>
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>{selectedEnquiry.id}</h3>
            </div>
            <button className="btn-icon" onClick={handleCloseDrawer}>
              <XCircle size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <form onSubmit={handleSaveInteraction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Student Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Parent / Guardian Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Indian Mobile Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Course *</label>
                <select
                  className="form-control"
                  value={courseInterest}
                  onChange={(e) => setCourseInterest(e.target.value)}
                >
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Campus preference *</label>
                <select
                  className="form-control"
                  value={campusPreference}
                  onChange={(e) => setCampusPreference(e.target.value)}
                >
                  {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Assigned Counsellor</label>
                <select
                  className="form-control"
                  value={assignedCounsellor}
                  onChange={(e) => setAssignedCounsellor(e.target.value)}
                >
                  <option value="">-- Unassigned --</option>
                  {(councellors || []).map(c => (
                    <option key={c.email} value={c.email}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Admission Status</label>
                <select
                  className="form-control"
                  value={admissionStatus}
                  onChange={(e) => setAdmissionStatus(e.target.value)}
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {admissionStatus === 'Follow-up' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Next Follow-up Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              )}

              {selectedEnquiry.messageDetails && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Message / Enquiry Details</label>
                  <div style={{
                    marginTop: '4px',
                    backgroundColor: 'var(--bg-app)',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid var(--border)',
                    lineHeight: 1.4
                  }}>
                    {selectedEnquiry.messageDetails}
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Notes History</label>
                <div style={{
                  marginTop: '4px',
                  backgroundColor: 'var(--bg-app)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border)',
                  lineHeight: 1.4
                }}>
                  {counsellorNotes || "No notes logged."}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Add Progress Note</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="Type updates here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Save Updates
              </button>
            </form>

            <button
              onClick={() => handleDelete(selectedEnquiry.id)}
              className="btn btn-danger"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}
            >
              <Trash2 size={16} />
              <span>Delete Record (Admin)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
