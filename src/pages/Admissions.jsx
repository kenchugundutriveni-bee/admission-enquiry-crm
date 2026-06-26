import React, { useState, useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { GraduationCap, Search, Calendar, Phone, Mail, BookOpen, MapPin, XCircle, Trash2, User } from 'lucide-react';

export default function Admissions() {
  const { enquiries, currentUser, updateEnquiry, deleteEnquiry, users } = useContext(CRMContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');

  // Drawer / Editing state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedCounsellor, setUpdatedCounsellor] = useState('');
  const [updatedAllowRemarks, setUpdatedAllowRemarks] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter only admitted students (status === 'Admitted')
  const admittedStudents = enquiries.filter(enq => {
    if (enq.admissionStatus !== 'Admitted') return false;

    // Role filtering
    if (currentUser?.role === 'counsellor' && enq.assignedCounsellor?.toLowerCase() !== currentUser?.email?.toLowerCase()) {
      return false;
    }

    // Search query matches
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

    // Campus filter matches
    if (campusFilter !== 'all' && enq.campusPreference !== campusFilter) return false;

    return true;
  });

  const uniqueCampuses = [
    'Main Campus - Rajahmundry',
    'City Campus - Kakinada',
    'Elite Campus - Amalapuram'
  ];

  const counsellors = users ? users.filter(user => user.role === "counsellor") : [];

  const handleOpenDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setUpdatedStatus(enquiry.admissionStatus);
    setUpdatedCounsellor(enquiry.assignedCounsellor || '');
    setUpdatedAllowRemarks(enquiry.allowStudentRemarks || false);
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

    let finalNotes = selectedEnquiry.counsellorNotes;
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      const noteHeader = `\n[${timestamp} by ${currentUser.name}]: `;
      finalNotes = finalNotes 
        ? `${finalNotes}\n${noteHeader}${newNote.trim()}`
        : `${noteHeader}${newNote.trim()}`;
    }

    const updateData = {
      admissionStatus: updatedStatus,
      counsellorNotes: finalNotes,
      allowStudentRemarks: updatedAllowRemarks
    };

    if (currentUser?.role === 'admin') {
      updateData.assignedCounsellor = updatedCounsellor;
    }

    updateEnquiry(selectedEnquiry.id, updateData);
    alert('Record updated successfully.');
    handleCloseDrawer();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to permanently delete this student record?')) {
      deleteEnquiry(id);
      handleCloseDrawer();
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      gap: '20px',
      height: 'calc(100vh - var(--topbar-height) - 60px)',
      position: 'relative'
    }}>
      
      {/* LEFT: Cards view */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        
        {/* Search and Campus Filters Card */}
        <div className="card" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Search Input */}
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
              placeholder="Search admitted students by name, parent, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </div>

          {/* Campus Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Filter by Campus:
            </label>
            <select
              className="form-control"
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="all">All Campuses</option>
              {uniqueCampuses.map(campus => (
                <option key={campus} value={campus}>{campus}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Counter Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: 'var(--text-muted)',
          fontWeight: 500,
          paddingLeft: '5px',
          flexShrink: 0
        }}>
          <GraduationCap size={18} style={{ color: 'var(--status-admitted-text)' }} />
          <span>Found <strong>{admittedStudents.length}</strong> confirmed admission records.</span>
        </div>

        {/* Grid List of Admitted Students */}
        {admittedStudents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <GraduationCap size={48} style={{ margin: '0 auto 15px', color: 'var(--border)' }} />
            <h3>No Confirmed Admissions</h3>
            <p style={{ fontSize: '14px', marginTop: '5px' }}>
              {currentUser?.role === 'counsellor' 
                ? 'No admitted students have been assigned to your profile.' 
                : 'There are no admitted students matching your filters.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px'
          }}>
            {admittedStudents.map(student => (
              <div key={student.id} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                borderLeft: '4px solid var(--status-admitted-text)',
                position: 'relative'
              }}>
                {/* Card Title & Ref */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 700 }}>
                      {student.studentName}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Parent/Guardian: {student.parentName}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--status-admitted-text)',
                    backgroundColor: 'var(--status-admitted-bg)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {student.id}
                  </span>
                </div>

                {/* Course & Campus info badges */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--border-radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                    <BookOpen size={14} style={{ color: 'var(--primary)' }} />
                    <span>Course: <strong>{student.courseInterest}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                    <MapPin size={14} style={{ color: 'var(--secondary)' }} />
                    <span>Campus: <strong>{student.campusPreference}</strong></span>
                  </div>
                </div>

                {/* Contact Information */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--text-light)' }} />
                    <span>Phone: <strong style={{ color: 'var(--text-main)' }}>+91 {student.phone}</strong></span>
                  </div>
                  {student.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} style={{ color: 'var(--text-light)' }} />
                      <span>Email: {student.email}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                    <span>Admitted on: {new Date(student.updatedAt || student.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>

                {/* Actions & Notes */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleOpenDetail(student)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Manage Admission
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Detail Side Drawer */}
      {drawerOpen && (
        selectedEnquiry ? (
          <div style={{
            width: '380px',
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
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-app)'
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)' }}>ADMISSION STATUS</span>
                <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>{selectedEnquiry.id}</h3>
              </div>
              <button className="btn-icon" onClick={handleCloseDrawer}>
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{selectedEnquiry.studentName}</span>
                <p>Parent/Guardian: <strong>{selectedEnquiry.parentName}</strong></p>
                <p>Contact No: <strong>+91 {selectedEnquiry.phone}</strong></p>
                {selectedEnquiry.email && <p>Email: {selectedEnquiry.email}</p>}
                <p>Counsellor: <strong>
                  {users.find(u => u.email === selectedEnquiry.assignedCounsellor)?.name || 'Unassigned'}
                </strong></p>
              </div>

              {selectedEnquiry.messageDetails && (
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Original Message</label>
                  <p style={{
                    marginTop: '4px',
                    backgroundColor: 'var(--bg-app)',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-main)',
                    lineHeight: 1.4
                  }}>
                    {selectedEnquiry.messageDetails}
                  </p>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Counsellor Action Log</label>
                <div style={{
                  marginTop: '6px',
                  backgroundColor: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border)',
                  lineHeight: 1.4
                }}>
                  {selectedEnquiry.counsellorNotes || "No notes logged."}
                </div>
              </div>

              {(currentUser?.role === 'admin' || currentUser?.role === 'counsellor') && (
                <form onSubmit={handleSaveInteraction} style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Add Progress Note</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Type updates here..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Update Admission Status</label>
                    <select
                      className="form-control"
                      value={updatedStatus}
                      onChange={(e) => setUpdatedStatus(e.target.value)}
                    >
                      <option value="New Enquiry">New Enquiry</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Interested">Interested</option>
                      <option value="Admitted">Admitted</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
                  </div>

                  {currentUser?.role === 'admin' && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Re-assign Counsellor</label>
                      <select
                        className="form-control"
                        value={updatedCounsellor}
                        onChange={(e) => setUpdatedCounsellor(e.target.value)}
                      >
                        <option value="">-- Unassigned --</option>
                        {(counsellors || []).map(c => (
                          <option key={c.email} value={c.email}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Allow Student to see remarks */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', marginBottom: '5px' }}>
                    <input
                      type="checkbox"
                      id="allowStudentRemarks"
                      checked={updatedAllowRemarks}
                      onChange={(e) => setUpdatedAllowRemarks(e.target.checked)}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="allowStudentRemarks" style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', margin: 0 }}>
                      Allow student/parent to view remarks
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Save Updates
                  </button>
                </form>
              )}

              {currentUser && currentUser.role === 'admin' && (
                <button
                  onClick={() => handleDelete(selectedEnquiry.id)}
                  className="btn btn-danger"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}
                >
                  <Trash2 size={16} />
                  <span>Delete Admission (Admin)</span>
                </button>
              )}

            </div>
          </div>
        ) : (
          <div style={{
            width: '380px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            zIndex: 10,
            animation: 'fadeIn 0.2s ease forwards'
          }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600 }}>Admission record not found.</p>
              <button 
                onClick={handleCloseDrawer} 
                className="btn btn-secondary" 
                style={{ marginTop: '15px', padding: '8px 16px' }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        )
      )}

    </div>
  );
}
