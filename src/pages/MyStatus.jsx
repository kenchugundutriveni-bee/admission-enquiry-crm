import React, { useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { ClipboardCheck, School, Calendar, MapPin, BookOpen, Clock, UserCheck } from 'lucide-react';

export default function MyStatus() {
  const { enquiries, currentUser } = useContext(CRMContext);

  // Filter enquiries matching logged-in student's email or submittedBy email
  const myEnquiries = enquiries.filter(enq => 
    enq.email?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase() ||
    enq.submittedBy?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase()
  );

  const getStatusBadge = (status) => {
    let cls = 'badge-enquired';
    if (status === 'Follow-up') cls = 'badge-followup';
    if (status === 'Admitted') cls = 'badge-admitted';
    if (status === 'Not Interested') cls = 'badge-closed';
    return <span className={`badge ${cls}`} style={{ padding: '6px 12px', fontSize: '13px' }}>{status}</span>;
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'New Enquiry':
        return 'We have successfully received your admission enquiry! An academic counsellor from Sri Gowthami will review your details and contact you shortly.';
      case 'Follow-up':
        return 'Your application is currently under review / active consultation. A counsellor is actively coordinating details with you.';
      case 'Interested':
        return 'Your application has been reviewed and marked as an interested lead. A counsellor is coordinating your next steps.';
      case 'Admitted':
        return 'Congratulations! Your admission is officially confirmed at Sri Gowthami Educational Institutions. We look forward to welcoming you to our campus.';
      case 'Not Interested':
        return 'Your admission enquiry has been closed. If you wish to re-open your request, please contact our administrative desk.';
      default:
        return 'Enquiry status is being processed.';
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="card" style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        borderLeft: '4px solid var(--primary)'
      }}>
        <ClipboardCheck size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Student Admission Status Portal</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time tracking of registration enquiries submitted for account: <strong>{currentUser?.email}</strong>
          </p>
        </div>
      </div>

      {myEnquiries.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '40px 30px',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <School size={40} style={{ color: 'var(--border)' }} />
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 700 }}>No Enquiries Found</h3>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              No admissions enquiries have been linked to your email address yet. 
            </p>
          </div>
          <p style={{ fontSize: '12px', fontStyle: 'italic', backgroundColor: 'var(--bg-app)', padding: '10px 15px', borderRadius: '8px' }}>
            Tip: Click "New Enquiry Form" on the sidebar to submit your application details using this email.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {myEnquiries.map(enq => (
            <div key={enq.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Ref Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700 }}>REFERENCE ID</span>
                  <h3 style={{ fontSize: '15px', color: 'var(--text-main)' }}>{enq.id}</h3>
                </div>
                {getStatusBadge(enq.admissionStatus)}
              </div>

              {/* Status explanation */}
              <div style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--border)',
                padding: '16px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                color: 'var(--text-main)',
                lineHeight: 1.5
              }}>
                <strong>Status Update:</strong> {getStatusDescription(enq.admissionStatus)}
              </div>

              {/* Details details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} style={{ color: 'var(--text-light)' }} />
                  <span>Course interest: <strong>{enq.courseInterest}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} style={{ color: 'var(--text-light)' }} />
                  <span>Campus preference: <strong>{enq.campusPreference}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: 'var(--text-light)' }} />
                  <span>Submitted on: {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: 'var(--text-light)' }} />
                  <span>Last update: {new Date(enq.updatedAt || enq.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>

              {/* Basic Candidate details */}
              <div style={{
                borderTop: '1px dashed var(--border)',
                paddingTop: '12px',
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}>
                <p>Candidate Name: <strong>{enq.studentName}</strong></p>
                <p>Parent/Guardian: {enq.parentName}</p>
                <p>Registered Phone: +91 {enq.phone}</p>
                {enq.messageDetails && <p style={{ marginTop: '8px' }}>Your message: <em>"{enq.messageDetails}"</em></p>}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
