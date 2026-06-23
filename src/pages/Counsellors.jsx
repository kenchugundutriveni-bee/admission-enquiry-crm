import React, { useState, useContext } from 'react';
import { CRMContext } from '../context/CRMContext';
import { UserCheck, Search, Plus, Mail, Phone, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';

export default function Counsellors() {
  const { users, registerUser } = useContext(CRMContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const counsellors = users.filter(u => u.role === 'counsellor');

  const filteredCounsellors = counsellors.filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.phone.includes(searchTerm);
  });

  const handlePhoneChange = (val) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };

  const handleAddCounsellor = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || phone.length !== 10 || !phoneRegex.test(phone)) {
      setError('Please enter a valid Indian mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const res = registerUser(name, email, password, 'counsellor', phone);
    if (res.success) {
      setSuccess('Counsellor account created successfully.');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px'
    }}>
      {/* Left: Counsellors Registry */}
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '400px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCheck size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Registered Counsellors</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>List of staff members assigned to enquiries</p>
          </div>
        </div>

        {/* Search */}
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
            placeholder="Search counsellors by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '45px' }}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCounsellors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)', fontSize: '13px' }}>
              No counsellors found.
            </div>
          ) : (
            filteredCounsellors.map(c => (
              <div key={c.email} style={{
                padding: '14px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-app)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{c.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} />
                    <span>{c.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} />
                    <span>+91 {c.phone}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Create Counsellor Form */}
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignSelf: 'start'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={24} style={{ color: 'var(--status-admitted-text)' }} />
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Add New Counsellor</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Create a new staff login credential</p>
          </div>
        </div>

        {/* Messages */}
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
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'var(--status-admitted-bg)',
            color: 'var(--status-admitted-text)',
            padding: '12px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleAddCounsellor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Full Name *</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }} />
              <input
                type="text"
                className="form-control"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }} />
              <input
                type="email"
                className="form-control"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Indian Mobile Number *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                borderRight: '1px solid var(--border)',
                paddingRight: '8px'
              }}>
                +91
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Indian Mobile Number"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                style={{ paddingLeft: '56px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Password * (Min 6 chars)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }} />
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            Register Counsellor
          </button>
        </form>
      </div>
    </div>
  );
}
