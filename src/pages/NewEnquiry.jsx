import React, { useState, useContext, useEffect } from 'react';
import { CRMContext } from '../context/CRMContext';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function NewEnquiry({ setCurrentPage }) {
  const { addEnquiry, users, currentUser } = useContext(CRMContext);
  
  // Form Fields
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('');
  const [campusPreference, setCampusPreference] = useState('');
  const [messageDetails, setMessageDetails] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState('');

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

  const handlePhoneChange = (val) => {
    // Strip non-digits and cap at 10
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }
    if (!parentName.trim()) {
      newErrors.parentName = 'Parent/Guardian name is required';
    }
    
    // Strict Indian phone validation: 10 digits starting with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length !== 10 || !phoneRegex.test(phone)) {
      newErrors.phone = 'Please enter a valid Indian mobile number.';
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!courseInterest) {
      newErrors.courseInterest = 'Please select a course';
    }

    if (!campusPreference) {
      newErrors.campusPreference = 'Please select a campus';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      phone,
      email: email.trim(),
      courseInterest,
      campusPreference,
      followUpDate: '',
      admissionStatus: 'New Enquiry',
      assignedCounsellor: '',
      messageDetails: messageDetails.trim(),
      counsellorNotes: '',
      submittedBy: currentUser?.role === 'student' ? currentUser.email : ''
    };

    const newEnquiry = addEnquiry(data);
    setLastSubmittedId(newEnquiry.id);
    setSuccess(true);
    resetForm();
  };

  const resetForm = () => {
    setStudentName('');
    setParentName('');
    setEmail('');
    setPhone('');
    setCourseInterest('');
    setCampusPreference('');
    setMessageDetails('');
    setErrors({});
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {success ? (
        <div className="card" style={{
          padding: '40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-admitted-bg)',
            color: 'var(--status-admitted-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={40} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
              Enquiry submitted successfully.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
              Reference ID: <strong>{lastSubmittedId}</strong> has been logged.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button 
              onClick={() => setSuccess(false)}
              className="btn btn-primary"
            >
              Submit Another Enquiry
            </button>
            <button 
              onClick={() => setCurrentPage(currentUser?.role === 'student' ? 'my-status' : 'dashboard')}
              className="btn btn-secondary"
            >
              {currentUser?.role === 'student' ? 'View My Status' : 'Go to Dashboard'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '15px'
          }}>
            <UserPlus size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Register New Student Enquiry</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Please fill in the candidate information accurately. All enquiries are saved locally.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* Student & Parent Name */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              <div className="form-group">
                <label>Student Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Student Full Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ borderColor: errors.studentName ? 'var(--status-closed-text)' : '' }}
                />
                {errors.studentName && (
                  <span style={{ fontSize: '12px', color: 'var(--status-closed-text)', marginTop: '4px', display: 'block' }}>
                    {errors.studentName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Parent / Guardian Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Parent / Guardian Name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  style={{ borderColor: errors.parentName ? 'var(--status-closed-text)' : '' }}
                />
                {errors.parentName && (
                  <span style={{ fontSize: '12px', color: 'var(--status-closed-text)', marginTop: '4px', display: 'block' }}>
                    {errors.parentName}
                  </span>
                )}
              </div>
            </div>

            {/* Phone & Email */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              <div className="form-group">
                <label>Indian Mobile Number *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    borderRight: '1px solid var(--border)',
                    paddingRight: '10px'
                  }}>
                    +91
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Indian Mobile Number"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    style={{ 
                      paddingLeft: '65px',
                      borderColor: errors.phone ? 'var(--status-closed-text)' : ''
                    }}
                  />
                </div>
                {errors.phone && (
                  <span style={{ fontSize: '12px', color: 'var(--status-closed-text)', marginTop: '4px', display: 'block' }}>
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderColor: errors.email ? 'var(--status-closed-text)' : '' }}
                />
                {errors.email && (
                  <span style={{ fontSize: '12px', color: 'var(--status-closed-text)', marginTop: '4px', display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            {/* Course Interest & Campus Preference */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              <div className="form-group">
                <label>Course interested *</label>
                <select 
                  className="form-control"
                  value={courseInterest}
                  onChange={(e) => setCourseInterest(e.target.value)}
                  style={{ borderColor: errors.courseInterest ? 'var(--status-closed-text)' : '' }}
                >
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.courseInterest && (
                  <span style={{ fontSize: '12px', color: 'var(--status-closed-text)', marginTop: '4px', display: 'block' }}>
                    {errors.courseInterest}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Campus preference *</label>
                <select
                  className="form-control"
                  value={campusPreference}
                  onChange={(e) => setCampusPreference(e.target.value)}
                  style={{ borderColor: errors.campusPreference ? 'var(--status-closed-text)' : '' }}
                >
                  <option value="">Select Campus</option>
                  {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.campusPreference && (
                  <span style={{ fontSize: '12px', color: 'var(--status-closed-text)', marginTop: '4px', display: 'block' }}>
                    {errors.campusPreference}
                  </span>
                )}
              </div>
            </div>

            {/* Message / Enquiry Details */}
            <div className="form-group">
              <label>Message / Enquiry Details</label>
              <textarea
                rows="4"
                className="form-control"
                placeholder="Message / Enquiry Details"
                value={messageDetails}
                onChange={(e) => setMessageDetails(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border)',
              paddingTop: '20px',
              marginTop: '10px'
            }}>
              <button 
                type="button" 
                onClick={() => setCurrentPage(currentUser?.role === 'student' ? 'my-status' : 'dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Submit Enquiry
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
