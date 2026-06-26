import React, { useState, useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { School, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import NewEnquiry from './NewEnquiry';

export default function Login() {
  const { login } = useContext(CRMContext);
  const [viewMode, setViewMode] = useState('landing'); // 'landing', 'enquiry', 'login'
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please fill in all login fields.');
      return;
    }

    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setError(res.message);
    }
  };

  // If viewing Enquiry Form directly
  if (viewMode === 'enquiry') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        padding: '40px 20px',
        transition: 'background-color var(--transition-normal)'
      }}>
        <NewEnquiry setCurrentPage={(page) => setViewMode('landing')} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '20px',
      transition: 'background-color var(--transition-normal)'
    }}>
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Brand / Logo Header */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          padding: '24px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
          }}>
            <School size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 800 }}>
              Sri Gowthami
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Educational Institutions
            </p>
          </div>
        </div>

        {/* Panel Card */}
        <div className="card" style={{ padding: '24px 30px' }}>
          
          {/* Notifications */}
          {error && (
            <div style={{
              backgroundColor: 'var(--status-closed-bg)',
              color: 'var(--status-closed-text)',
              padding: '12px',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              <span style={{ lineHeight: 1.3 }}>{error}</span>
            </div>
          )}

          {viewMode === 'landing' ? (
            /* LANDING VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
              <div style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 700 }}>
                  Admission Enquiry Portal
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Welcome! Please select an option below to continue
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setViewMode('enquiry')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 600 }}
                >
                  Submit Admission Enquiry
                </button>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => setViewMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-light)',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-light)'}
                >
                  Staff Login
                </button>
              </div>
            </div>
          ) : (
            /* STAFF LOGIN VIEW */
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 700 }}>
                  Staff Sign In
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Enter your administrative credentials to log in
                </p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-light)'
                    }} />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. admin@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      style={{ paddingLeft: '45px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-light)'
                    }} />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{ paddingLeft: '45px' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                  Sign In
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setViewMode('landing');
                    setError('');
                  }} 
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                >
                  Back to Home
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
