import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null); // Store token in state

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    setToken(userData.token); // Set token in state
    setIsAdmin(userData.is_admin); // Set admin status based on backend response
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null); // Clear token from state
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, token, login, logout }}>
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
