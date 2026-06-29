# Admission Enquiry CRM - Setup and Running Guide

This project is a Sri Gowthami Educational Institutions Admission Enquiry CRM. It consists of a React + Vite frontend and a Node.js + Express backend connected to a MySQL database.

---

## 1. Database Setup

### A. How to Create the Database
The backend is configured to **automatically create** the database (`admission_crm`) on startup if it does not exist, using the credentials provided in the `.env` file. 

However, if you wish to create it manually, execute the following SQL command in your MySQL client:
```sql
CREATE DATABASE IF NOT EXISTS admission_crm;
```

### B. SQL Commands to Create Tables
The backend also automatically creates the required tables and seeds the default admin user on startup. For reference or manual verification, here are the table schemas and seeding commands:

```sql
USE admission_crm;

-- 1. Users table (Admin & Counsellors)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'counsellor') NOT NULL,
  phone VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enquiries table
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
);

-- 3. Notes table (Progress Notes audit trail)
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enquiry_id VARCHAR(50) NOT NULL,
  note_text TEXT NOT NULL,
  added_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Seed Default Admin User
INSERT INTO users (name, email, password, role, phone)
SELECT 'System Admin', 'admin@gmail.com', 'admin123', 'admin', '9876543210'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gmail.com');
```

---

## 2. How to Run the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file:
   Open `backend/.env` and adjust the database credentials if necessary:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=admission_crm
   ```
4. Start the server:
   - For production / standard start:
     ```bash
     npm start
     ```
   - For development with auto-reload (nodemon):
     ```bash
     npm run dev
     ```

---

## 3. How to Run the Frontend

1. Return to the project root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend dev server will start (usually on `http://localhost:5173`).*

---

## 4. How the Frontend Connects to the Backend

Vite is configured to proxy API requests to avoid CORS issues and keep endpoints clean. 
Inside `vite.config.js`:
- Any request prefixed with `/api` is intercepted and forwarded to the backend running at `http://localhost:5000`.
- For example, when the React frontend calls `fetch('/api/dashboard')`, it is proxied to `http://localhost:5000/api/dashboard` automatically.

When deploying to production, compile the frontend using `npm run build` and serve the static `dist/` directory or run a reverse proxy (like Nginx) to route requests matching `/api` to the running Node.js service.

---

## 5. How to Test the APIs

You can test the backend endpoints using cURL or API testing clients (such as Postman).

### A. Staff Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin123"
  }
  ```

### B. Submit Public Enquiry
- **Method**: `POST`
- **URL**: `/api/enquiries`
- **Body** (JSON):
  ```json
  {
    "studentName": "Kiran Kumar",
    "parentName": "K. Satyam",
    "phone": "9876543210",
    "email": "kiran@gmail.com",
    "courseInterest": "MPC (Maths, Physics, Chemistry)",
    "campusPreference": "Main Campus - Rajahmundry",
    "messageDetails": "Looking for hostel accommodation."
  }
  ```

### C. Get Dashboard Counts
- **Method**: `GET`
- **URL**: `/api/dashboard`
- **Headers**:
  ```http
  X-User-Email: admin@gmail.com
  X-User-Role: admin
  ```
