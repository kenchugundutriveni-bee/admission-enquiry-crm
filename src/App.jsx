import React, { useState, useContext, useEffect } from 'react';
import { CRMProvider, CRMContext } from './context/CRMContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Page Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewEnquiry from './pages/NewEnquiry';
import Students from './pages/Students';
import FollowUps from './pages/FollowUps';
import Admissions from './pages/Admissions';
import Reports from './pages/Reports';
import MyEnquiries from './pages/MyEnquiries';
import Counsellors from './pages/Counsellors';

function AppContent() {
  const { currentUser, loading } = useContext(CRMContext);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);

  // Role Access Enforcement and Default Landing Redirections on Login
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'admin' || currentUser.role === 'counsellor') {
      setCurrentPage('dashboard');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--primary)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid var(--border)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }



  // Authentication Guard
  if (!currentUser) {
    return <Login />;
  }

  // Routing renderer
  const renderPage = () => {
    const roleAllowedPages = {
      admin: ['dashboard', 'new-enquiry', 'students', 'follow-ups', 'admissions', 'reports', 'counsellors'],
      counsellor: ['dashboard', 'follow-ups', 'admissions', 'my-enquiries', 'new-enquiry']
    };

    const allowed = roleAllowedPages[currentUser.role] || [];

    if (!allowed.includes(currentPage)) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          margin: '20px auto',
          maxWidth: '600px'
        }}>
          <h2 style={{ color: 'var(--status-closed-text)', marginBottom: '10px', fontSize: '24px', fontWeight: 800 }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Access denied. You are not allowed to open this page.</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} setSelectedEnquiryId={setSelectedEnquiryId} />;
      case 'new-enquiry':
        return <NewEnquiry setCurrentPage={setCurrentPage} />;
      case 'login':
        return <Login />;
      case 'students':
        return <Students />;
      case 'follow-ups':
        return <FollowUps selectedEnquiryId={selectedEnquiryId} setSelectedEnquiryId={setSelectedEnquiryId} />;
      case 'admissions':
        return <Admissions />;
      case 'reports':
        return <Reports />;
      case 'my-enquiries':
        return <MyEnquiries />;
      case 'counsellors':
        return <Counsellors />;
      default:
        return currentUser ? <Dashboard setCurrentPage={setCurrentPage} setSelectedEnquiryId={setSelectedEnquiryId} /> : <NewEnquiry setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-app)',
        marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        transition: 'margin-left var(--transition-normal)'
      }}>
        {/* Topbar Info & Actions */}
        <Topbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          setMobileOpen={setMobileOpen}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Scrollable Page Body */}
        <main className="page-body">
          {renderPage()}
        </main>
      </div>

      {/* Global CSS adjustments for page layout transitions */}
      <style>{`
        @media (max-width: 992px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}
