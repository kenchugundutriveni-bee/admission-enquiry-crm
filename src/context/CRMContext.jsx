import React, { createContext, useState, useEffect } from 'react';

export const CRMContext = createContext();

const SEED_USERS = [
  {
    email: 'admin@gmail.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
    phone: '9876543210'
  },
  {
    email: 'counsellor@gmail.com',
    password: 'counsellor123',
    name: 'Academic Counsellor',
    role: 'counsellor',
    phone: '9000888777'
  },
  {
    email: 'student@gmail.com',
    password: 'student123',
    name: 'New Student',
    role: 'student',
    phone: '9112233445'
  }
];

// Fresh start: No pre-existing student enquiries
const SEED_ENQUIRIES = [];

export const CRMProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardFilter, setDashboardFilter] = useState(null);

  // Load database state from localStorage on init
  useEffect(() => {
    // 1. Session check
    const savedSession = localStorage.getItem('crm_session');
    if (savedSession) {
      setCurrentUser(JSON.parse(savedSession));
    }

    // 2. Users registry check
    const savedUsers = localStorage.getItem('crm_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('crm_users', JSON.stringify(SEED_USERS));
      setUsers(SEED_USERS);
    }

    // 3. Enquiries registry check
    const savedEnquiries = localStorage.getItem('crm_enquiries');
    const normalizeStatus = (status) => {
      if (!status) return 'New Enquiry';
      const s = status.trim();
      if (s === 'Joined' || s === 'Admitted') return 'Admitted';
      if (s === 'Follow Up' || s === 'Follow-up') return 'Follow-up';
      if (s === 'Interested') return 'Interested';
      if (s === 'Not Joined' || s === 'Rejected' || s === 'Not Interested') return 'Not Interested';
      return 'New Enquiry';
    };

    if (savedEnquiries) {
      const loaded = JSON.parse(savedEnquiries);
      const seenIds = new Set();
      const normalized = loaded.map((e, index) => {
        let currentId = e.id;
        // Regenerate unique ID if missing or duplicate
        if (!currentId || seenIds.has(currentId)) {
          currentId = `ENQ-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
        }
        seenIds.add(currentId);

        return {
          ...e,
          id: currentId,
          admissionStatus: normalizeStatus(e.admissionStatus)
        };
      });
      setEnquiries(normalized);
      localStorage.setItem('crm_enquiries', JSON.stringify(normalized));
    } else {
      localStorage.setItem('crm_enquiries', JSON.stringify(SEED_ENQUIRIES));
      setEnquiries(SEED_ENQUIRIES);
    }

    setLoading(false);
  }, []);

  // Sync utilities
  const saveUsersToStorage = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('crm_users', JSON.stringify(updatedUsers));
  };

  const saveEnquiriesToStorage = (updatedEnquiries) => {
    setEnquiries(updatedEnquiries);
    localStorage.setItem('crm_enquiries', JSON.stringify(updatedEnquiries));
  };

  // Auth Functions
  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!foundUser) {
      return { success: false, message: 'Account not found. Please create an account.' };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const userSession = {
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      phone: foundUser.phone,
      loginTime: new Date().toISOString()
    };
    setCurrentUser(userSession);
    localStorage.setItem('crm_session', JSON.stringify(userSession));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crm_session');
  };

  const registerUser = (name, email, password, role, phone) => {
    const trimmedEmail = email.trim().toLowerCase();
    const isDuplicate = users.some(u => u.email.toLowerCase() === trimmedEmail);

    if (isDuplicate) {
      return { success: false, message: 'Email is already registered.' };
    }

    // Only Admin can create counsellor accounts. Public registers default to 'student'.
    const finalRole = (currentUser?.role === 'admin') ? role : 'student';

    const newUser = {
      name: name.trim(),
      email: trimmedEmail,
      password,
      role: finalRole,
      phone
    };

    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    return { success: true };
  };

  // CRUD Operations
  const addEnquiry = (enquiryData) => {
    // Generate a unique ID using Date.now() and a random suffix to guarantee uniqueness
    const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newId = `ENQ-${uniqueSuffix}`;

    const newEnquiry = {
      id: newId,
      ...enquiryData,
      createdAt: new Date().toISOString()
    };

    const updated = [newEnquiry, ...enquiries];
    saveEnquiriesToStorage(updated);
    return newEnquiry;
  };

  const updateEnquiry = (id, updatedFields) => {
    const updated = enquiries.map((enq) => {
      if (enq.id === id) {
        return {
          ...enq,
          ...updatedFields,
          updatedAt: new Date().toISOString()
        };
      }
      return enq;
    });
    saveEnquiriesToStorage(updated);
  };

  const deleteEnquiry = (id) => {
    const updated = enquiries.filter((enq) => enq.id !== id);
    saveEnquiriesToStorage(updated);
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
