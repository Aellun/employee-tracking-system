// src/api/index.js

import axios from 'axios';

// Base URL (adjust this to point to your backend)
const API_URL = 'http://localhost:8000/api/'; // Replace with your actual backend URL

// Function to clock in
export const clockInRecord = async (authToken, additionalData = {}) => {
    try {
        const response = await axios.post(
            `${API_URL}clock-in/`,
            additionalData, // Send additional data if required
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json', // Ensure content type is set
                }
            }
        );

        // Check if the response is successful (201)
        if (response.status === 201) {
            console.log('Response:', response.data); // Log the successful response
            return response.data; // Return the success message and record ID
        } else {
            // Handle unexpected statuses (not likely since backend returns 201 on success)
            throw new Error('Unexpected response from the server.');
        }

    } catch (error) {
        console.error('Error clocking in:', error);

        // Provide more detailed error feedback
        if (error.response) {
            throw new Error(error.response.data.message || 'An error occurred while clocking in.');
        } else {
            throw new Error('Network error: Please check your connection.');
        }
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
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json', // Ensure content type is set
                }
            }
        );

        console.log('Response:', response.data); // Log the response
        return response.data;
    } catch (error) {
        console.error('Error clocking out:', error);
        if (error.response) {
            throw new Error(error.response.data.message || 'An error occurred while clocking out.');
        } else {
            throw new Error('Network error: Please check your connection.');
        }
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
                break_notes: notes
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json', // Ensure content type is set
                }
            }
        );

        console.log('Response:', response.data); // Log the response
        return response.data;
    } catch (error) {
        console.error('Error taking break:', error);
        if (error.response) {
            throw new Error(error.response.data.message || 'An error occurred while taking a break.');
        } else {
            throw new Error('Network error: Please check your connection.');
        }
    }
};
