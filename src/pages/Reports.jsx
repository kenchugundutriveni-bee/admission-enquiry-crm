import React, { useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { Printer, TrendingUp, BarChart3, FileText, School } from 'lucide-react';

export default function Reports() {
  const { enquiries } = useContext(CRMContext);

  // 1. Core aggregates
  const total = enquiries.length;
  const admitted = enquiries.filter(e => e.admissionStatus === 'Admitted').length;
  const followUp = enquiries.filter(e => e.admissionStatus === 'Follow-up').length;
  const interested = enquiries.filter(e => e.admissionStatus === 'Interested').length;
  const newEnquiry = enquiries.filter(e => e.admissionStatus === 'New Enquiry').length;
  const notInterested = enquiries.filter(e => e.admissionStatus === 'Not Interested').length;
  
  const overallConversion = total > 0 ? Math.round((admitted / total) * 100) : 0;

  // 2. Campus Analytics
  const campuses = [
    'Main Campus - Rajahmundry',
    'City Campus - Kakinada',
    'Elite Campus - Amalapuram'
  ];

  const campusReport = campuses.map(campus => {
    const campusEnquiries = enquiries.filter(e => e.campusPreference === campus);
    const campusTotal = campusEnquiries.length;
    const campusJoined = campusEnquiries.filter(e => e.admissionStatus === 'Admitted').length;
    const campusConversion = campusTotal > 0 ? Math.round((campusJoined / campusTotal) * 100) : 0;

    return {
      name: campus,
      total: campusTotal,
      joined: campusJoined,
      conversion: campusConversion
    };
  });

  // 3. Course Analytics
  const courses = [
    'MPC (Maths, Physics, Chemistry)',
    'BiPC (Biology, Physics, Chemistry)',
    'CEC (Civics, Economics, Commerce)',
    'MEC (Maths, Economics, Commerce)',
    'Polytechnic (Diploma)',
    'General Degree (B.Sc / B.Com / B.A)'
  ];

  const courseReport = courses.map(course => {
    const courseEnquiries = enquiries.filter(e => e.courseInterest === course);
    const courseTotal = courseEnquiries.length;
    const courseJoined = courseEnquiries.filter(e => e.admissionStatus === 'Admitted').length;
    const courseConversion = courseTotal > 0 ? Math.round((courseJoined / courseTotal) * 100) : 0;

    return {
      name: course,
      total: courseTotal,
      joined: courseJoined,
      conversion: courseConversion
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const getPercentage = (count) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Printable Heading Block */}
      <div style={{ display: 'none' }} className="visible-print-block">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          paddingBottom: '20px',
          borderBottom: '2px solid #000',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <School size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800 }}>SRI GOWTHAMI EDUCATIONAL INSTITUTIONS</h1>
            <p style={{ fontSize: '12px', color: '#475569' }}>Admissions Enquiry CRM - Performance & Conversion Report</p>
          </div>
        </div>
      </div>

      {/* Title & Actions Row */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', color: 'var(--text-main)' }}>CRM Registration Reports</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Analytical insights into admission conversions across courses and campus lines.
          </p>
        </div>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} />
          <span>Print Summary Report</span>
        </button>
      </div>

      {/* 1. General Stats Table Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '15px', color: 'var(--text-main)' }}>Overall Registry Summary</h3>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Registration Metric</th>
                <th>Count / Records</th>
                <th>Proportion (%)</th>
                <th>Target Conversion Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Total Enquiries Logged</strong></td>
                <td>{total}</td>
                <td>100%</td>
                <td>Overall Base Reach</td>
              </tr>
              <tr>
                <td>Confirmed Admissions (Admitted)</td>
                <td style={{ color: 'var(--status-admitted-text)', fontWeight: 600 }}>{admitted}</td>
                <td>{getPercentage(admitted)}%</td>
                <td><span className="badge badge-admitted">Admitted</span></td>
              </tr>
              <tr>
                <td>Active Follow-ups</td>
                <td style={{ color: 'var(--status-followup-text)', fontWeight: 600 }}>{followUp}</td>
                <td>{getPercentage(followUp)}%</td>
                <td><span className="badge badge-followup">Follow-up</span></td>
              </tr>
              <tr>
                <td>Interested Enquiries</td>
                <td>{interested}</td>
                <td>{getPercentage(interested)}%</td>
                <td><span className="badge badge-enquired">Interested</span></td>
              </tr>
              <tr>
                <td>New Enquiries</td>
                <td>{newEnquiry}</td>
                <td>{getPercentage(newEnquiry)}%</td>
                <td><span className="badge badge-enquired">New Enquiry</span></td>
              </tr>
              <tr>
                <td>Closed Case (Not Interested)</td>
                <td style={{ color: 'var(--status-closed-text)', fontWeight: 600 }}>{notInterested}</td>
                <td>{getPercentage(notInterested)}%</td>
                <td><span className="badge badge-closed">Not Interested</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Campus Analytics Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <TrendingUp size={18} style={{ color: 'var(--secondary)' }} />
          <h3 style={{ fontSize: '15px', color: 'var(--text-main)' }}>Campus Performance Indicators</h3>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Campus Branch</th>
                <th>Enquiries Count</th>
                <th>Admissions Confirmed (Joined)</th>
                <th>Conversion Rate (%)</th>
                <th style={{ width: '240px' }}>Performance Visual</th>
              </tr>
            </thead>
            <tbody>
              {campusReport.map(camp => (
                <tr key={camp.name}>
                  <td style={{ fontWeight: 600 }}>{camp.name}</td>
                  <td>{camp.total}</td>
                  <td>{camp.joined}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{camp.conversion}%</td>
                  <td>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${camp.conversion}%`, 
                          backgroundColor: 'var(--primary)',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{camp.conversion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Course Analytics Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <BarChart3 size={18} style={{ color: 'var(--status-admitted-text)' }} />
          <h3 style={{ fontSize: '15px', color: 'var(--text-main)' }}>Course Interest & Conversion breakdown</h3>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Enquiries Count</th>
                <th>Admissions Confirmed (Joined)</th>
                <th>Conversion Rate (%)</th>
                <th style={{ width: '240px' }}>Performance Visual</th>
              </tr>
            </thead>
            <tbody>
              {courseReport.map(course => (
                <tr key={course.name}>
                  <td style={{ fontWeight: 600 }}>{course.name}</td>
                  <td>{course.total}</td>
                  <td>{course.joined}</td>
                  <td style={{ fontWeight: 700, color: 'var(--status-admitted-text)' }}>{course.conversion}%</td>
                  <td>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${course.conversion}%`, 
                          backgroundColor: 'var(--status-admitted-text)',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{course.conversion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          .visible-print-block {
            display: block !important;
          }
          .custom-table {
            font-size: 12px !important;
          }
          .custom-table th, .custom-table td {
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
