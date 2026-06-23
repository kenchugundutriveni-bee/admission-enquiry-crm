import React, { useState, useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { School, Lock, User, AlertCircle, CheckCircle, Phone } from 'lucide-react';

export default function Login() {
  const { login, registerUser } = useContext(CRMContext);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('student'); // 'student' or 'counsellor'
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please fill in all login fields.');
      return;
    }

    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handlePhoneChange = (val) => {
    // Strip non-digit characters
    const digits = val.replace(/\D/g, '');
    // Limit to 10 characters
    if (digits.length <= 10) {
      setRegPhone(digits);
    }
  };

  const validateRegistration = () => {
    if (!regName.trim()) return 'Full name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail)) {
      return 'Please enter a valid email address';
    }

    // Indian phone format checking
    // Starts with 6,7,8,9 and is exactly 10 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!regPhone || regPhone.length !== 10 || !phoneRegex.test(regPhone)) {
      return 'Please enter a valid Indian mobile number.';
    }

    if (regPassword.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (regPassword !== regConfirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validationError = validateRegistration();
    if (validationError) {
      setError(validationError);
      return;
    }

    const res = registerUser(regName, regEmail, regPassword, regRole, regPhone);
    if (res.success) {
      setSuccessMsg('Registration successful! You can now log in.');
      setIsRegisterMode(false);
      // Copy registered email to login view
      setLoginEmail(regEmail);
      // Reset registration form
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegRole('student');
      setRegPassword('');
      setRegConfirmPassword('');
    } else {
      setError(res.message);
    }
  };



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

        {/* Auth Panel Card */}
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

          {successMsg && (
            <div style={{
              backgroundColor: 'var(--status-admitted-bg)',
              color: 'var(--status-admitted-text)',
              padding: '12px',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Switcher */}
          {!isRegisterMode ? (
            /* SIGN IN FORM */
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 700 }}>
                  Account Sign In
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Enter your email and password to access the system
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
                      placeholder="e.g. user@gmail.com"
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
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                <button 
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 700 }}>
                  Create Account
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Sign up for student status checks or counsellor actions
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ramesh Babu"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. ramesh@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

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
                      placeholder="98765 43210"
                      value={regPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      style={{ paddingLeft: '65px' }}
                      required
                    />
                  </div>
                </div>



                <div className="form-group">
                  <label>Password * (Min 6 chars)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                  Register Account
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Already registered? </span>
                <button 
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
