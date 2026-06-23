import React, { useContext } from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  PhoneCall, 
  GraduationCap, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  School,
  Users,
  UserCheck,
  FolderOpen,
  ClipboardCheck
} from 'lucide-react';
import { CRMContext } from '../context/CRMContext';

export default function Sidebar({ currentPage, setCurrentPage, sidebarCollapsed, setSidebarCollapsed, mobileOpen, setMobileOpen }) {
  const { currentUser, logout, setDashboardFilter } = useContext(CRMContext);

  const handleNavClick = (pageId) => {
    setDashboardFilter(null);
    setCurrentPage(pageId);
    setMobileOpen(false); // Close drawer on mobile click
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out of the CRM?')) {
      logout();
    }
  };

  // Get dynamic menu items based on role
  const getMenuItems = () => {
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
          { id: 'new-enquiry', name: 'New Enquiry', icon: UserPlus },
          { id: 'students', name: 'Students Registry', icon: Users },
          { id: 'counsellors', name: 'Manage Counsellors', icon: UserCheck },
          { id: 'follow-ups', name: 'Follow Ups', icon: PhoneCall },
          { id: 'admissions', name: 'Admissions List', icon: GraduationCap },
          { id: 'reports', name: 'Reports & Insights', icon: BarChart3 }
        ];
      case 'counsellor':
        return [
          { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
          { id: 'follow-ups', name: 'Follow Ups', icon: PhoneCall },
          { id: 'admissions', name: 'Admissions List', icon: GraduationCap },
          { id: 'my-enquiries', name: 'My Enquiries', icon: FolderOpen }
        ];
      case 'student':
      default:
        return [
          { id: 'new-enquiry', name: 'New Enquiry Form', icon: UserPlus },
          { id: 'my-status', name: 'My Status', icon: ClipboardCheck }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onClick={() => setMobileOpen(false)}
          className="no-print"
        />
      )}

      <aside 
        className={`sidebar-drawer no-print ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
        style={{
          width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          borderRight: '1px solid var(--border)',
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          zIndex: 1001,
          overflow: 'hidden'
        }}
      >
        {/* Sidebar Header / Brand Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px 15px',
          height: 'var(--topbar-height)',
          borderBottom: '1px solid var(--bg-sidebar-hover)',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            flexShrink: 0
          }}>
            <School size={22} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                SRI GOWTHAMI
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 500, letterSpacing: '0.05em' }}>
                EDUCATIONAL CRM
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Menu Items */}
        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--border-radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                  color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition-fast)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User / Logout Area */}
        <div style={{
          padding: '15px 10px',
          borderTop: '1px solid var(--bg-sidebar-hover)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {!sidebarCollapsed && currentUser && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-sidebar-hover)',
              fontSize: '12px',
              overflow: 'hidden'
            }}>
              <p style={{ fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</p>
              <p style={{ color: 'var(--text-light)', fontSize: '11px', textTransform: 'capitalize' }}>
                {currentUser.role === 'student' ? 'Student/Parent' : currentUser.role}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'var(--transition-fast)',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse Button (Desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="no-print"
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            backgroundColor: 'var(--bg-sidebar-hover)',
            border: 'none',
            color: 'var(--text-sidebar)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sidebar)'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  );
}
