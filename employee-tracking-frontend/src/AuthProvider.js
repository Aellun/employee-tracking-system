import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Backend API URL
const API_URL = 'http://localhost:8000/api/';

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => JSON.parse(localStorage.getItem('isAdmin')) || false);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [userProfile, setUserProfile] = useState(() => {
    const storedProfile = localStorage.getItem('userProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  // Load from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    const storedIsAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const storedProfile = localStorage.getItem('userProfile');

    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
    if (storedUsername) setUsername(storedUsername);
    if (storedIsAdmin !== null) setIsAdmin(storedIsAdmin);
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
  }, []);

  // Fetch employee profile from backend
  const fetchEmployeeProfile = async (authToken, userId) => {
    try {
      const response = await axios.get(`${API_URL}employees/${userId}/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const profile = response.data;
        setUserProfile(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Error fetching employee profile:', error);
      setUserProfile(null);
    }
  };

  // Login handler
  const login = async (userData) => {
    console.log('Login called with:', userData);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userId', userData.user_id);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('isAdmin', JSON.stringify(userData.is_admin));

    setToken(userData.token);
    setUserId(userData.user_id);
    setUsername(userData.username);
    setIsAdmin(userData.is_admin);

    // Fetch profile with token
    await fetchEmployeeProfile(userData.token, userData.user_id);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('clockInTime');
    localStorage.removeItem('recordId');
    localStorage.removeItem('breakActive');
    localStorage.removeItem('totalWorkedSeconds');
    localStorage.removeItem('userProfile');

    setToken(null);
    setUserId(null);
    setUsername('');
    setIsAdmin(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        token,
        userId,
        username,
        userProfile,
        login,
        logout,
      }}
    >
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
