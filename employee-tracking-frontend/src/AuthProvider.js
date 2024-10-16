import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => JSON.parse(localStorage.getItem('isAdmin')) || false); // Retrieve isAdmin from localStorage
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    const storedIsAdmin = JSON.parse(localStorage.getItem('isAdmin')); // Retrieve isAdmin from localStorage
    
    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
    if (storedIsAdmin !== null) setIsAdmin(storedIsAdmin); // Set isAdmin state
  }, []);

  const login = (userData) => {
    console.log('Login called with:', userData);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userId', userData.user_id);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('isAdmin', JSON.stringify(userData.is_admin)); // Store isAdmin in localStorage
    setToken(userData.token);
    setUserId(userData.user_id);
    setIsAdmin(userData.is_admin); // Set isAdmin state
  };

  const logout = () => {
    // Remove specific keys from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('clockInTime');
    localStorage.removeItem('recordId');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');  // Remove isAdmin
    localStorage.removeItem('breakActive');
    localStorage.removeItem('totalWorkedSeconds');
    setToken(null);
    setUserId(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
