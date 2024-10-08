import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null); // Store token in state

  // Sync token from localStorage if updated elsewhere (in case)
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (userData) => {
    console.log('Login called with:', userData); // Log the incoming userData
    localStorage.setItem('authToken', userData.token); // Store token under "authToken"
    setToken(userData.token); // Set token in state
    setIsAdmin(userData.is_admin); // Set admin status based on backend response

    // Log values after setting them
    console.log('Token set in localStorage:', localStorage.getItem('authToken'));
    console.log('Token set in state:', userData.token);
    console.log('Admin status set in state:', userData.is_admin);
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('authToken'); // Remove token from localStorage
    setToken(null); // Clear token from state
    setIsAdmin(false); // Reset admin status

    // Log values after state has been cleared
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
