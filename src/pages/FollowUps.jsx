import React, { useState, useContext, useEffect } from 'react';
import { CRMContext } from '../context/CRMContext';
import { 
  Search, 
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  XCircle,
  User,
  MapPin,
  BookOpen
} from 'lucide-react';

export default function FollowUps({ selectedEnquiryId, setSelectedEnquiryId }) {
  const { enquiries, updateEnquiry, deleteEnquiry, currentUser, users, dashboardFilter, setDashboardFilter } = useContext(CRMContext);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, today, overdue, upcoming, unscheduled, completed
  
  useEffect(() => {
    if (dashboardFilter && dashboardFilter.date === 'today') {
      setActiveTab('today');
    }
  }, [dashboardFilter]);

  // Drawer / Editing state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedFollowUpDate, setUpdatedFollowUpDate] = useState('');
  const [updatedCounsellor, setUpdatedCounsellor] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enquiryNotFoundError, setEnquiryNotFoundError] = useState(false);

  // Sync selectedEnquiryId from prop (e.g. if navigated from Dashboard link)
  useEffect(() => {
    if (selectedEnquiryId) {
      const found = (enquiries || []).find(e => e.id === selectedEnquiryId);
      if (found) {
        handleOpenDetail(found);
      } else {
        setSelectedEnquiry(null);
        setEnquiryNotFoundError(true);
        setDrawerOpen(true);
      }
      setSelectedEnquiryId(null);
    }
  }, [selectedEnquiryId, enquiries]);

  // Normalize date comparison
  const getLocalDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());
  
  // Filter counsellors list for dropdown (Admin only)
  const councellors = (users || []).filter(u => u.role === 'counsellor');

  // Filter Enquiries based on Role and Filter Criteria
  const filteredEnquiries = (enquiries || []).filter(enq => {
    if (!enq) return false;
    // 1. Role Check: Counsellors only see their own assigned follow ups. Admins see all.
    if (currentUser?.role === 'counsellor' && (enq.assignedCounsellor || '').toLowerCase() !== (currentUser?.email || '').toLowerCase()) {
      return false;
    }

    // 2. Search Term Match
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

    // 3. Tab Filter Match
    const hasFollowUpDate = enq.followUpDate;
    const isJoined = enq.admissionStatus === 'Admitted';
    const isNotInterested = enq.admissionStatus === 'Not Interested';

    switch (activeTab) {
      case 'today':
        return enq.admissionStatus === 'Follow-up' && hasFollowUpDate && enq.followUpDate === todayStr;
      case 'overdue':
        return enq.admissionStatus === 'Follow-up' && hasFollowUpDate && enq.followUpDate < todayStr;
      case 'upcoming':
        return enq.admissionStatus === 'Follow-up' && hasFollowUpDate && enq.followUpDate > todayStr;
      case 'unscheduled':
        return enq.admissionStatus === 'Interested' || enq.admissionStatus === 'New Enquiry' || (enq.admissionStatus === 'Follow-up' && !hasFollowUpDate);
      case 'completed':
        return isJoined || isNotInterested;
      case 'all':
      default:
        return true;
    }
  });

  const handleOpenDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setUpdatedStatus(enquiry.admissionStatus);
    setUpdatedFollowUpDate(enquiry.followUpDate || '');
    setUpdatedCounsellor(enquiry.assignedCounsellor || '');
    setNewNote('');
    setEnquiryNotFoundError(false);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEnquiry(null);
    setEnquiryNotFoundError(false);
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

    const updateData = {
      admissionStatus: updatedStatus,
      followUpDate: updatedStatus === 'Follow-up' ? updatedFollowUpDate : '',
      counsellorNotes: finalNotes
    };

    // Admins can update the assigned counsellor
    if (currentUser?.role === 'admin') {
      updateData.assignedCounsellor = updatedCounsellor;
    }

    updateEnquiry(selectedEnquiry.id, updateData);

    alert('Enquiry updated successfully.');
    
    // Refresh local selected info
    const updatedRecord = enquiries.find(e => e.id === selectedEnquiry.id);
    if (updatedRecord) {
      setSelectedEnquiry({
        ...updatedRecord,
        admissionStatus: updatedStatus,
        followUpDate: updatedStatus === 'Follow-up' ? updatedFollowUpDate : '',
        counsellorNotes: finalNotes
      });
    }
    
    setNewNote('');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to permanently delete this enquiry? This action cannot be undone.')) {
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
      {/* LEFT: Filters and Data Table */}
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
        {/* Table Header Controls */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* Search bar */}
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
              placeholder="Search follow ups by name, phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </div>

          {/* Quick Filter Tabs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '10px'
          }}>
            {[
              { id: 'all', label: 'All Registrations', count: filteredEnquiries.length },
              { 
                id: 'today', 
                label: 'Due Today', 
                count: enquiries.filter(e => {
                  const roleMatch = currentUser?.role === 'admin' || e.assignedCounsellor?.toLowerCase() === currentUser?.email?.toLowerCase();
                  return roleMatch && e.admissionStatus === 'Follow-up' && e.followUpDate === todayStr;
                }).length 
              },
              { 
                id: 'overdue', 
                label: 'Overdue', 
                count: enquiries.filter(e => {
                  const roleMatch = currentUser?.role === 'admin' || e.assignedCounsellor?.toLowerCase() === currentUser?.email?.toLowerCase();
                  return roleMatch && e.admissionStatus === 'Follow-up' && e.followUpDate && e.followUpDate < todayStr;
                }).length 
              },
              { 
                id: 'upcoming', 
                label: 'Upcoming', 
                count: enquiries.filter(e => {
                  const roleMatch = currentUser?.role === 'admin' || e.assignedCounsellor?.toLowerCase() === currentUser?.email?.toLowerCase();
                  return roleMatch && e.admissionStatus === 'Follow-up' && e.followUpDate && e.followUpDate > todayStr;
                }).length 
              },
              { 
                id: 'unscheduled', 
                label: 'Unscheduled', 
                count: enquiries.filter(e => {
                  const roleMatch = currentUser?.role === 'admin' || e.assignedCounsellor?.toLowerCase() === currentUser?.email?.toLowerCase();
                  return roleMatch && (e.admissionStatus === 'Interested' || e.admissionStatus === 'New Enquiry' || (e.admissionStatus === 'Follow-up' && !e.followUpDate));
                }).length 
              },
              { 
                id: 'completed', 
                label: 'Completed', 
                count: enquiries.filter(e => {
                  const roleMatch = currentUser?.role === 'admin' || e.assignedCounsellor?.toLowerCase() === currentUser?.email?.toLowerCase();
                  return roleMatch && (e.admissionStatus === 'Admitted' || e.admissionStatus === 'Not Interested');
                }).length 
              }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (dashboardFilter) setDashboardFilter(null);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                  border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data List Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="custom-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>Enquiry ID</th>
                <th>Student / Phone</th>
                <th>Course / Campus</th>
                <th>Follow-up Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    No follow up enquiries found.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map(enq => {
                  let dateLabelColor = 'inherit';
                  let dateIcon = <Calendar size={14} />;
                  
                  if (enq.admissionStatus === 'Follow-up' && enq.followUpDate) {
                    if (enq.followUpDate < todayStr) {
                      dateLabelColor = 'var(--status-closed-text)';
                      dateIcon = <AlertCircle size={14} style={{ color: 'var(--status-closed-text)' }} />;
                    } else if (enq.followUpDate === todayStr) {
                      dateLabelColor = 'var(--status-followup-text)';
                      dateIcon = <Clock size={14} style={{ color: 'var(--status-followup-text)' }} />;
                    }
                  }

                  return (
                    <tr 
                      key={enq.id} 
                      onClick={() => handleOpenDetail(enq)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedEnquiry && selectedEnquiry.id === enq.id ? 'var(--primary-light)' : ''
                      }}
                    >
                      <td style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>
                        {enq.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{enq.studentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+91 {enq.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{enq.courseInterest}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{enq.campusPreference}</div>
                      </td>
                      <td>
                        {enq.followUpDate ? (
                          <div style={{ 
                            fontSize: '13px', 
                            color: dateLabelColor, 
                            fontWeight: enq.followUpDate <= todayStr ? 600 : 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {dateIcon}
                            {new Date(enq.followUpDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(enq.admissionStatus)}
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(enq);
                          }}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Detail Side Drawer */}
      {drawerOpen && (selectedEnquiry || enquiryNotFoundError) && (
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
          {/* Drawer Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-app)'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)' }}>ENQUIRY DETAILS</span>
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>{enquiryNotFoundError ? 'Not Found' : selectedEnquiry?.id}</h3>
            </div>
            <button className="btn-icon" onClick={handleCloseDrawer}>
              <XCircle size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {enquiryNotFoundError ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--status-closed-text)' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 15px', color: 'var(--status-closed-text)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Enquiry not found</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  The requested enquiry could not be found or the ID is invalid.
                </p>
              </div>
            ) : (
              <>
                {/* Student Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{selectedEnquiry.studentName}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '26px' }}>
                <p>Parent/Guardian: <strong>{selectedEnquiry.parentName}</strong></p>
                <p>Phone: <strong>+91 {selectedEnquiry.phone}</strong></p>
                {selectedEnquiry.email && <p>Email: {selectedEnquiry.email}</p>}
                <p>Assigned Counsellor: <strong style={{ color: 'var(--primary)' }}>
                  {users.find(u => u.email === selectedEnquiry.assignedCounsellor)?.name || 'Unassigned'}
                </strong></p>
              </div>
            </div>

            {/* Interest details */}
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <BookOpen size={16} />
                <span>Interested in: <strong>{selectedEnquiry.courseInterest}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <MapPin size={16} />
                <span>Preferred Campus: <strong>{selectedEnquiry.campusPreference}</strong></span>
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
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Counsellor Remarks / Notes</label>
              <div style={{
                marginTop: '6px',
                backgroundColor: 'var(--bg-app)',
                padding: '12px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                maxHeight: '180px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                border: '1px solid var(--border)',
                lineHeight: 1.4
              }}>
                {selectedEnquiry.counsellorNotes || "No notes logged."}
              </div>
            </div>

            {/* Interaction Form Panel */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'counsellor') && (
              <form onSubmit={handleSaveInteraction} style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Add Progress Note</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Log details of call..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Update Status</label>
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

                {/* Assign Counsellor (Admin Only) */}
                {currentUser?.role === 'admin' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Re-assign Counsellor</label>
                    <select
                      className="form-control"
                      value={updatedCounsellor}
                      onChange={(e) => setUpdatedCounsellor(e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {councellors.map(c => (
                        <option key={c.email} value={c.email}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Save Updates
                </button>
              </form>
            )}

            {/* Admin Delete Action */}
            {currentUser && currentUser.role === 'admin' && (
              <button
                onClick={() => handleDelete(selectedEnquiry.id)}
                className="btn btn-danger"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}
              >
                <Trash2 size={16} />
                <span>Delete Enquiry (Admin)</span>
              </button>
            )}

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
