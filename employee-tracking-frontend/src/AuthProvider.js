import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null); // New userId state

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const login = (userData) => {
    console.log('Login called with:', userData);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userId', userData.user_id); // Store userId in localStorage
    localStorage.setItem('username', userData.username);
    setToken(userData.token);
    setUserId(userData.user_id); // Set userId state
    setIsAdmin(userData.is_admin);
  };

  const logout = () => {
    // Remove specific keys from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('clockInTime');
    localStorage.removeItem('recordId');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('breakActive');  // Remove breakActive
    localStorage.removeItem('totalWorkedSeconds');  // Remove totalWorkedSeconds
    setToken(null);
    setUserId(null); // Reset userId state
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
