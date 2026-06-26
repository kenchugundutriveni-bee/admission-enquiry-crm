import React, { useState, useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { 
  FolderOpen, 
  Search, 
  XCircle, 
  User, 
  BookOpen, 
  MapPin, 
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function MyEnquiries() {
  const { enquiries, updateEnquiry, currentUser, dashboardFilter, setDashboardFilter } = useContext(CRMContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedFollowUpDate, setUpdatedFollowUpDate] = useState('');
  const [updatedAllowRemarks, setUpdatedAllowRemarks] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter only enquiries: assigned to this counsellor (if counsellor/admin) or submitted by this student (if student)
  const myAssignedEnquiries = enquiries.filter(enq => {
    const isMatched = enq.assignedCounsellor === currentUser?.email;

    if (!isMatched) return false;

    // Apply dashboard filter
    if (dashboardFilter && dashboardFilter.status) {
      if (enq.admissionStatus !== dashboardFilter.status) return false;
    }

    // Search filter
    const studentName = enq.studentName || '';
    const parentName = enq.parentName || '';
    const phone = enq.phone || '';
    const id = enq.id || '';

    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleOpenDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setUpdatedStatus(enquiry.admissionStatus);
    setUpdatedFollowUpDate(enquiry.followUpDate || '');
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

    if (updatedStatus === 'Follow-up' && !updatedFollowUpDate) {
      alert('Please select a follow-up date.');
      return;
    }

    updateEnquiry(selectedEnquiry.id, {
      admissionStatus: updatedStatus,
      followUpDate: updatedStatus === 'Follow-up' ? updatedFollowUpDate : '',
      counsellorNotes: finalNotes,
      allowStudentRemarks: updatedAllowRemarks
    });

    alert('Enquiry updated successfully.');
    
    // Refresh local state view
    const updatedRecord = enquiries.find(e => e.id === selectedEnquiry.id);
    if (updatedRecord) {
      setSelectedEnquiry({
        ...updatedRecord,
        admissionStatus: updatedStatus,
        followUpDate: updatedStatus === 'Follow-up' ? updatedFollowUpDate : '',
        counsellorNotes: finalNotes,
        allowStudentRemarks: updatedAllowRemarks
      });
    }
    
    setNewNote('');
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
      
      {/* List Container */}
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

        {/* Search */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
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
              placeholder="Search assigned enquiries by name, parent, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="custom-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>Enquiry ID</th>
                <th>Student / Parent</th>
                <th>Contact</th>
                <th>Course / Campus</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myAssignedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    No assigned enquiries matching criteria.
                  </td>
                </tr>
              ) : (
                myAssignedEnquiries.map(enq => (
                  <tr 
                    key={enq.id}
                    onClick={() => handleOpenDetail(enq)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedEnquiry?.id === enq.id ? 'var(--primary-light)' : ''
                    }}
                  >
                    <td style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>
                      {enq.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{enq.studentName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Parent/Guardian: {enq.parentName}</div>
                    </td>
                    <td>+91 {enq.phone}</td>
                    <td>
                      <div>{enq.courseInterest}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{enq.campusPreference}</div>
                    </td>
                    <td>{getStatusBadge(enq.admissionStatus)}</td>
                    <td>
                      <button 
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(enq);
                        }}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Details Drawer */}
      {drawerOpen && selectedEnquiry && (
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
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-app)'
          }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)' }}>
                ASSIGNED ENQUIRY
              </span>
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>{selectedEnquiry.id}</h3>
            </div>
            <button className="btn-icon" onClick={handleCloseDrawer}>
              <XCircle size={20} />
            </button>
          </div>

          {/* Details Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{selectedEnquiry.studentName}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '26px' }}>
                <p>Parent/Guardian: <strong>{selectedEnquiry.parentName}</strong></p>
                <p>Contact No: <strong>+91 {selectedEnquiry.phone}</strong></p>
                {selectedEnquiry.email && <p>Email: {selectedEnquiry.email}</p>}
              </div>
            </div>

            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <BookOpen size={15} />
                <span>Course: <strong>{selectedEnquiry.courseInterest}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <MapPin size={15} />
                <span>Campus: <strong>{selectedEnquiry.campusPreference}</strong></span>
              </div>
            </div>

            {selectedEnquiry.messageDetails && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Message / Enquiry Details</label>
                <div style={{
                  marginTop: '6px',
                  backgroundColor: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border)',
                  lineHeight: 1.4
                }}>
                  {selectedEnquiry.messageDetails}
                </div>
              </div>
            )}

            {/* Notes history */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Interaction History / Notes</label>
              <div style={{
                marginTop: '6px',
                backgroundColor: 'var(--bg-app)',
                padding: '12px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                maxHeight: '160px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                border: '1px solid var(--border)',
                lineHeight: 1.4
              }}>
                {selectedEnquiry.counsellorNotes || "No counsellor notes logged yet."}
              </div>
            </div>

            {/* Interaction Form Panel */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'counsellor') && (
              <form onSubmit={handleSaveInteraction} style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Add New Interaction Note</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Log details of parent discussion..."
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

                {updatedStatus === 'Follow-up' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Next Follow-up Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={updatedFollowUpDate}
                      onChange={(e) => setUpdatedFollowUpDate(e.target.value)}
                    />
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

          </div>
        </div>
      )}

    </div>
  );
}
