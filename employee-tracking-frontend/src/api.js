// src/api/index.js

import axios from 'axios';

// Base URL (adjust this to point to your backend)
const API_URL = 'http://localhost:8000/api/'; // Replace with your actual backend URL

// Set up CSRF token for secure requests
const getCSRFToken = () => {
    let csrfToken = null;
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.split('=');
        if (name.trim() === 'csrftoken') csrfToken = value;
    });
    return csrfToken;
};

// Function to clock in
export const clockInRecord = (recordId) => {
    const csrfToken = getCSRFToken();
    return axios.post(
        `${API_URL}clock-in/`, // Adjust to your backend endpoint
        { record_id: recordId },
        { headers: { 'X-CSRFToken': csrfToken } }
    );
};

// Function to clock out
export const clockOutRecord = (recordId) => {
    const csrfToken = getCSRFToken();
    return axios.post(
        `${API_URL}clock-out/`, // Adjust to your backend endpoint
        { record_id: recordId },
        { headers: { 'X-CSRFToken': csrfToken } }
    );
};

// Function to take a break
export const takeBreakRecord = (recordId, breakType, notes) => {
    const csrfToken = getCSRFToken();
    return axios.post(
        `${API_URL}take-break/`, // Adjust to your backend endpoint
        { record_id: recordId, break_type: breakType, notes },
        { headers: { 'X-CSRFToken': csrfToken } }
    );
};
