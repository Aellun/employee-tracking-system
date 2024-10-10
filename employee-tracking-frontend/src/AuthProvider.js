import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (userData) => {
    console.log('Login called with:', userData);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('username', userData.username);
    setToken(userData.token);
    setIsAdmin(userData.is_admin);

    console.log('Token set in localStorage:', localStorage.getItem('authToken'));
    console.log('Token set in state:', userData.token);
    console.log('Admin status set in state:', userData.is_admin);
    console.log('Username set in localStorage:', localStorage.getItem('username'));
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('authToken');
    setToken(null);
    setIsAdmin(false);
    console.log('Token removed from localStorage');
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
