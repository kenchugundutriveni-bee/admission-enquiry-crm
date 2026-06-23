import React, { useContext, useEffect, useState } from 'react';
import { Menu, Sun, Moon, Plus, User, Bell } from 'lucide-react';
import { CRMContext } from '../context/CRMContext';

export default function Topbar({ currentPage, setCurrentPage, setMobileOpen, sidebarCollapsed }) {
  const { currentUser, dashboardFilter } = useContext(CRMContext);
  const [darkTheme, setDarkTheme] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('crm_dark_theme');
    if (savedTheme === 'true') {
      setDarkTheme(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !darkTheme;
    setDarkTheme(nextTheme);
    if (nextTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('crm_dark_theme', 'true');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('crm_dark_theme', 'false');
    }
  };

  const getPageTitle = () => {
    if (currentPage === 'students' && dashboardFilter) {
      if (dashboardFilter.status === 'New Enquiry') return 'New Enquiries';
      if (dashboardFilter.status === 'Interested') return 'Interested Leads';
      if (dashboardFilter.status === 'Not Interested') return 'Not Interested Leads';
    }

    if (currentPage === 'my-enquiries' && dashboardFilter) {
      if (dashboardFilter.status === 'New Enquiry') return 'My Assigned New Enquiries';
      if (dashboardFilter.status === 'Interested') return 'My Assigned Interested Leads';
      if (dashboardFilter.status === 'Not Interested') return 'My Assigned Closed Leads';
    }

    if (currentPage === 'follow-ups' && dashboardFilter && dashboardFilter.date === 'today') {
      return 'Follow-ups Today';
    }

    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'new-enquiry':
        return 'New Student Enquiry';
      case 'follow-ups':
        return 'Follow-Up Schedule';
      case 'admissions':
        return 'Confirmed Admissions';
      case 'reports':
        return 'Reports & Analytics';
      case 'students':
        return 'Students Registry';
      case 'my-enquiries':
        return 'My Assigned Enquiries';
      case 'my-status':
        return 'My Enquiry Status';
      case 'counsellors':
        return 'Manage Counsellors';
      default:
        return 'Admission CRM';
    }
  };

  return (
    <header
      className="no-print"
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          className="btn-icon"
          onClick={() => setMobileOpen(prev => !prev)}
          style={{ display: 'none' }} /* Show only under media query via inline toggle if needed, or we style it dynamically */
          id="mobile-nav-toggle"
        >
          <Menu size={22} />
        </button>

        {/* Display styled title */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '20px', color: 'var(--text-main)', fontWeight: 700 }}>
            {getPageTitle()}
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Sri Gowthami Educational Institutions
          </span>
        </div>
      </div>

      {/* Right: Actions, Theme Switch, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Quick Add Button */}
        {currentPage !== 'new-enquiry' && (
          <button
            onClick={() => setCurrentPage('new-enquiry')}
            className="btn btn-primary"
            style={{
              padding: '8px 14px',
              fontSize: '13px'
            }}
          >
            <Plus size={16} />
            <span className="hide-on-mobile">New Enquiry</span>
          </button>
        )}

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={darkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border)'
          }}
        >
          {darkTheme ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} style={{ color: '#475569' }} />}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />

        {/* User profile details */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              border: '2px solid var(--primary)'
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'capitalize' }}>{currentUser.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Inline CSS overrides for Topbar mobile toggle */}
      <style>{`
        @media (max-width: 992px) {
          #mobile-nav-toggle {
            display: inline-flex !important;
          }
        }
        @media (max-width: 576px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
