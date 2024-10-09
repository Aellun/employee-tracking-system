// src/api/index.js

import axios from 'axios';

// Base URL (adjust this to point to your backend)
const API_URL = 'http://localhost:8000/api/'; // Replace with your actual backend URL

// Function to clock in
export const clockInRecord = async (authToken) => {
    try {
        const response = await axios.post(
            `${API_URL}clock-in/`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error clocking in:', error);
        throw error;
    }
};

// Function to clock out
export const clockOutRecord = async (authToken, recordId) => {
    try {
        const response = await axios.post(
            `${API_URL}clock-out/`,
            { record_id: recordId },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error clocking out:', error);
        throw error;
    }
};

// Function to take a break
export const takeBreakRecord = async (authToken, recordId, breakType, notes) => {
    try {
        const response = await axios.post(
            `${API_URL}take-break/`,
            { 
                record_id: recordId,
                break_type: breakType,
                notes: notes
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error taking break:', error);
        throw error;
    }
};
