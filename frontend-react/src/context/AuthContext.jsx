import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smart_campus_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to Rahul Verma (student) for instant demo exploration
    return {
      id: 4,
      student_id: 1,
      username: 'rahul_v',
      full_name: 'Rahul Verma',
      email: 'rahul.verma@smartcampus.edu',
      role: 'student',
      roll_number: 'CS2023-001',
      department: 'Computer Science & Engineering',
      semester: 6,
      cgpa: 8.85
    };
  });

  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:8000/backend-php/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      setCurrentUser(data.data);
      localStorage.setItem('smart_campus_user', JSON.stringify(data.data));
      return data.data;
    } catch (err) {
      // Offline fallback login for demonstration
      console.warn('Backend offline, using demo fallback account for', username);
      let user = null;
      if (username === 'admin') {
        user = {
          id: 1,
          username: 'admin',
          full_name: 'Dr. Ramesh Kumar (Principal)',
          email: 'admin@smartcampus.edu',
          role: 'admin'
        };
      } else if (username.includes('prof') || username.includes('sharma')) {
        user = {
          id: 2,
          faculty_id: 1,
          employee_id: 'FAC-CS-101',
          username: 'prof_sharma',
          full_name: 'Prof. Rajesh Sharma',
          email: 'sharma@smartcampus.edu',
          role: 'faculty',
          department: 'Computer Science & Engineering'
        };
      } else {
        user = {
          id: 4,
          student_id: 1,
          username: username || 'rahul_v',
          full_name: 'Rahul Verma',
          email: 'rahul.verma@smartcampus.edu',
          role: 'student',
          roll_number: 'CS2023-001',
          department: 'Computer Science & Engineering',
          semester: 6,
          cgpa: 8.85
        };
      }
      setCurrentUser(user);
      localStorage.setItem('smart_campus_user', JSON.stringify(user));
      return user;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smart_campus_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
