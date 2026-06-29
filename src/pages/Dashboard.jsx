import React, { useContext, useState, useEffect } from 'react';
import { CRMContext } from '../context/CRMContext';
import StatCard from '../components/StatCard';
import { 
  Users, 
  PhoneCall, 
  GraduationCap, 
  TrendingUp, 
  MapPin, 
  BookOpen, 
  ArrowRight,
  Calendar,
  UserPlus,
  XCircle,
  User,
  Trash2,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function Dashboard({ setCurrentPage, setSelectedEnquiryId }) {
  const { enquiries, currentUser, setDashboardFilter, users, updateEnquiry, deleteEnquiry } = useContext(CRMContext);

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedFollowUpDate, setUpdatedFollowUpDate] = useState('');
  const [updatedCounsellor, setUpdatedCounsellor] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enquiryNotFoundError, setEnquiryNotFoundError] = useState(false);
  const [updatedAllowRemarks, setUpdatedAllowRemarks] = useState(false);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/dashboard', {
          headers: {
            'X-User-Email': currentUser ? currentUser.email : '',
            'X-User-Role': currentUser ? currentUser.role : ''
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      }
    };
    fetchCounts();
  }, [currentUser, enquiries]);

  const councellors = (users || []).filter(u => u.role === 'counsellor');

  // 1. Filter Enquiries based on Role
  // Admin sees all enquiries, Counsellor sees only their assigned enquiries
  const visibleEnquiries = currentUser?.role === 'admin'
    ? enquiries
    : enquiries.filter(e => e.assignedCounsellor?.toLowerCase() === currentUser?.email?.toLowerCase());

  const handleCardClick = (status, date, targetPageForAdmin, targetPageForCounsellor) => {
    if (currentUser?.role === 'student') return; // Students cannot access

    const targetPage = currentUser?.role === 'admin' ? targetPageForAdmin : targetPageForCounsellor;
    
    if (status || date) {
      setDashboardFilter({ status, date });
    } else {
      setDashboardFilter(null);
    }
    setCurrentPage(targetPage);
  };

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();

  // 2. Calculate Metrics on visible subset
  const totalEnquiries = counts ? counts.total : visibleEnquiries.length;
  const newEnquiriesCount = counts ? counts.new_count : visibleEnquiries.filter(e => e.admissionStatus === 'New Enquiry').length;
  const followUpsTodayCount = counts ? counts.follow_ups_today : visibleEnquiries.filter(e => e.admissionStatus === 'Follow-up' && e.followUpDate === todayStr).length;
  const interestedLeadsCount = counts ? counts.interested : visibleEnquiries.filter(e => e.admissionStatus === 'Interested').length;
  const admittedCount = counts ? counts.admitted : visibleEnquiries.filter(e => e.admissionStatus === 'Admitted').length;
  const notInterestedLeadsCount = counts ? counts.not_interested : visibleEnquiries.filter(e => e.admissionStatus === 'Not Interested').length;
  const followUpCount = visibleEnquiries.filter(e => e.admissionStatus === 'Follow-up').length;

  // 3. Course-wise interest calculation
  const courseCounts = visibleEnquiries.reduce((acc, curr) => {
    const course = curr.courseInterest || 'Unspecified';
    acc[course] = (acc[course] || 0) + 1;
    return acc;
  }, {});

  const sortedCourses = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 4. Campus preferences calculation
  const campusCounts = visibleEnquiries.reduce((acc, curr) => {
    const campus = curr.campusPreference || 'Unspecified';
    acc[campus] = (acc[campus] || 0) + 1;
    return acc;
  }, {});

  const sortedCampuses = Object.entries(campusCounts)
    .sort((a, b) => b[1] - a[1]);

  // 5. Get 5 most recent enquiries
  const recentEnquiries = [...visibleEnquiries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const handleEditEnquiry = (id) => {
    if (!id) {
      setSelectedEnquiry(null);
      setEnquiryNotFoundError(true);
      setDrawerOpen(true);
      return;
    }
    const found = (enquiries || []).find(e => e.id === id);
    if (found) {
      setSelectedEnquiry(found);
      setUpdatedStatus(found.admissionStatus);
      setUpdatedFollowUpDate(found.followUpDate || '');
      setUpdatedCounsellor(found.assignedCounsellor || '');
      setUpdatedAllowRemarks(found.allowStudentRemarks || false);
      setNewNote('');
      setEnquiryNotFoundError(false);
      setDrawerOpen(true);
    } else {
      setSelectedEnquiry(null);
      setEnquiryNotFoundError(true);
      setDrawerOpen(true);
    }
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
      counsellorNotes: finalNotes,
      allowStudentRemarks: updatedAllowRemarks
    };

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
        counsellorNotes: finalNotes,
        allowStudentRemarks: updatedAllowRemarks
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
    <div className="animate-fade-in" style={{ display: 'flex', gap: '20px', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* 1. Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          <StatCard 
            title="Total Enquiries" 
            value={totalEnquiries} 
            icon={Users} 
            trend={currentUser?.role === 'counsellor' ? "Your assigned enquiries" : "Overall base reach"}
            trendType="neutral"
            color="#2563eb"
            onClick={() => handleCardClick(null, null, 'students', 'my-enquiries')}
          />
          <StatCard 
            title="New Enquiries" 
            value={newEnquiriesCount} 
            icon={UserPlus} 
            trend="Unprocessed enquiries"
            trendType="neutral"
            color="#0284c7"
            onClick={() => handleCardClick('New Enquiry', null, 'students', 'my-enquiries')}
          />
          <StatCard 
            title="Follow-ups Today" 
            value={followUpsTodayCount} 
            icon={PhoneCall} 
            trend="Scheduled calls for today"
            trendType="neutral"
            color="#d97706"
            onClick={() => handleCardClick('Follow-up', 'today', 'follow-ups', 'follow-ups')}
          />
          <StatCard 
            title="Interested Leads" 
            value={interestedLeadsCount} 
            icon={TrendingUp} 
            trend="Actively interested"
            trendType="positive"
            color="#8b5cf6"
            onClick={() => handleCardClick('Interested', null, 'students', 'my-enquiries')}
          />
          <StatCard 
            title="Confirmed Admissions" 
            value={admittedCount} 
            icon={GraduationCap} 
            trend="Officially joined"
            trendType="positive"
            color="#16a34a"
            onClick={() => handleCardClick('Admitted', null, 'admissions', 'admissions')}
          />
          <StatCard 
            title="Not Interested Leads" 
            value={notInterestedLeadsCount} 
            icon={XCircle} 
            trend="Closed enquiries"
            trendType="negative"
            color="#dc2626"
            onClick={() => handleCardClick('Not Interested', null, 'students', 'my-enquiries')}
          />
        </div>

        {/* 2. Visual Analytics Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {/* Course Interests */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Course-wise Interests</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {sortedCourses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No records found</p>
              ) : (
                sortedCourses.map(([course, count]) => {
                  const percentage = totalEnquiries > 0 ? Math.round((count / totalEnquiries) * 100) : 0;
                  return (
                    <div key={course} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                          {course}
                        </span>
                        <span style={{ color: 'var(--primary)' }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          backgroundColor: 'var(--primary)',
                          borderRadius: '4px',
                          transition: 'width 1s ease-out'
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Campus Preference */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <MapPin size={20} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Campus Preferences</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {sortedCampuses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No records found</p>
              ) : (
                sortedCampuses.map(([campus, count]) => {
                  const percentage = totalEnquiries > 0 ? Math.round((count / totalEnquiries) * 100) : 0;
                  return (
                    <div key={campus} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-main)' }}>{campus}</span>
                        <span style={{ color: 'var(--secondary)' }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          backgroundColor: 'var(--secondary)',
                          borderRadius: '4px',
                          transition: 'width 1s ease-out'
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 3. Recent Enquiries Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 700 }}>
              Recent Admission Enquiries
            </h3>
            <button 
              onClick={() => setCurrentPage(currentUser?.role === 'counsellor' ? 'my-enquiries' : 'follow-ups')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student / Parent</th>
                  <th>Contact</th>
                  <th>Course Interest</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  {(currentUser?.role === 'admin' || currentUser?.role === 'counsellor') && <th className="actions-column">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No recent enquiries.
                    </td>
                  </tr>
                ) : (
                  recentEnquiries.map((enq) => {
                    return (
                      <tr key={enq.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{enq.studentName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Parent/Guardian: {enq.parentName}</div>
                        </td>
                        <td>
                          <div>+91 {enq.phone}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{enq.email}</div>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div>{enq.courseInterest}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{enq.campusPreference}</div>
                        </td>
                        <td>
                          {getStatusBadge(enq.admissionStatus)}
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} />
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'counsellor') && (
                          <td className="actions-column">
                            <button
                              onClick={() => handleEditEnquiry(enq.id)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Manage
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
          alignSelf: 'flex-start',
          position: 'sticky',
          top: '20px',
          maxHeight: 'calc(100vh - var(--topbar-height) - 40px)',
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
                      {(users || []).find(u => u.email === selectedEnquiry.assignedCounsellor)?.name || 'Unassigned'}
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
