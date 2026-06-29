import React, { createContext, useState, useEffect } from 'react';

export const CRMContext = createContext();

export const CRMProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardFilter, setDashboardFilter] = useState(null);

  // Load database state from backend / session from localStorage on init
  useEffect(() => {
    const savedSession = localStorage.getItem('crm_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setCurrentUser(parsed);
      refreshData(parsed).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Sync data utility from backend APIs
  const refreshData = async (user = currentUser) => {
    if (!user) {
      setEnquiries([]);
      setUsers([]);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      };

      // 1. Fetch enquiries
      const enqRes = await fetch('/api/enquiries', { headers });
      if (enqRes.ok) {
        const enqData = await enqRes.json();
        setEnquiries(enqData);
      }

      // 2. Fetch counsellors (users list for dropdowns)
      const usersRes = await fetch('/api/counsellors', { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Format to match frontend structure (email, name, role, phone)
        const formattedUsers = usersData.map(u => ({
          email: u.email,
          name: u.name,
          role: u.role,
          phone: u.phone || ''
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error('Error refreshing CRM data:', err);
    }
  };

  // Auth Functions
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Login failed.' };
      }

      const userSession = {
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        phone: data.user.phone || '',
        loginTime: new Date().toISOString()
      };

      setCurrentUser(userSession);
      localStorage.setItem('crm_session', JSON.stringify(userSession));
      await refreshData(userSession);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Could not connect to authentication server.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crm_session');
    setEnquiries([]);
    setUsers([]);
  };

  const registerUser = async (name, email, password, role, phone) => {
    try {
      const res = await fetch('/api/counsellors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser?.email || '',
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify({ name, email, password, phone })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to create counsellor.' };
      }

      await refreshData();
      return { success: true };
    } catch (err) {
      console.error('Error creating counsellor:', err);
      return { success: false, message: 'Could not connect to backend server.' };
    }
  };

  const continueAsStudent = (email) => {
    // Client-only fallback for student sessions (not used in current flow)
    if (!email || !email.trim()) {
      return { success: false, message: 'Please enter your email address.' };
    }
    const userSession = {
      email: email.trim().toLowerCase(),
      name: 'Student',
      role: 'student',
      phone: '',
      loginTime: new Date().toISOString()
    };
    setCurrentUser(userSession);
    localStorage.setItem('crm_session', JSON.stringify(userSession));
    return { success: true };
  };

  // CRUD Operations
  const addEnquiry = async (enquiryData) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser?.email || '',
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify(enquiryData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to submit enquiry.' };
      }

      await refreshData();
      return { id: data.id, success: true };
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      return { success: false, message: 'Could not connect to backend server.' };
    }
  };

  const updateEnquiry = async (id, updatedFields) => {
    // Synchronously update local state to avoid UI lag
    setEnquiries(prev => prev.map((enq) => {
      if (enq.id === id) {
        return {
          ...enq,
          ...updatedFields,
          updatedAt: new Date().toISOString()
        };
      }
      return enq;
    }));

    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser?.email || '',
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify(updatedFields)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('Failed to sync update to backend:', data.message);
      }
      // Re-fetch in background to ensure database-level consistency
      refreshData();
    } catch (err) {
      console.error('Error updating enquiry on backend:', err);
    }
  };

  const deleteEnquiry = async (id) => {
    // Synchronously update local state to avoid UI lag
    setEnquiries(prev => prev.filter((enq) => enq.id !== id));

    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': currentUser?.email || '',
          'X-User-Role': currentUser?.role || ''
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('Failed to delete enquiry from backend:', data.message);
      }
      refreshData();
    } catch (err) {
      console.error('Error deleting enquiry on backend:', err);
    }
  };

  return (
    <CRMContext.Provider
      value={{
        users,
        enquiries,
        currentUser,
        loading,
        login,
        logout,
        registerUser,
        continueAsStudent,
        addEnquiry,
        updateEnquiry,
        deleteEnquiry,
        dashboardFilter,
        setDashboardFilter
      }}
    >
      {!loading && children}
    </CRMContext.Provider>
  );
};
