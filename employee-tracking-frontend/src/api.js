import axios from 'axios';

// Base URL (adjust this to point to your backend)
const API_URL = 'http://localhost:8000/api/'; // Replace with your actual backend URL

// Function to check if there is an active clock-in
export const checkActiveClockIn = async (authToken) => {
    try {
        const response = await axios.get(
            `${API_URL}check-active-clockin/`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.status === 200) {
            const { active, time_clocked_in, record_id } = response.data;
            return { active, time_clocked_in, record_id };
        } else {
            throw new Error('Unexpected response from the server.');
        }
    } catch (error) {
        console.error('Error checking active clock-in:', error);
        if (error.response) {
            const message = error.response.data.error || 'An error occurred while checking active clock-in.';
            throw new Error(message);
        } else {
            throw new Error('Network error: Please check your connection.');
        }
    }
};

// Function to clock in
export const clockInRecord = async (authToken, additionalData = {}) => {
    try {
        const response = await axios.post(
            `${API_URL}clock-in/`,
            additionalData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.status === 201) {
            console.log('Response:', response.data);
            return response.data;
        } else {
            throw new Error('Unexpected response from the server.');
        }
    } catch (error) {
        console.error('Error clocking in:', error);

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
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log('Response:', response.data);
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
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log('Response:', response.data);
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

// Function to check if there is an active break
export const checkActiveBreak = async (authToken, recordId) => {
    try {
        const response = await axios.get(
            `${API_URL}check-active-break/`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                params: { record_id: recordId }
            }
        );

        if (response.status === 200) {
            const { active, break_id, break_start_time } = response.data;
            return { active, break_id, break_start_time };
        } else {
            throw new Error('Unexpected response from the server.');
        }
    } catch (error) {
        console.error('Error checking active break:', error);
        if (error.response) {
            const message = error.response.data.error || 'An error occurred while checking active break.';
            throw new Error(message);
        } else {
            throw new Error('Network error: Please check your connection.');
        }
    }
};

// Function to end an active break
export const endBreakRecord = async (authToken, breakId) => {
    try {
        const response = await axios.post(
            `${API_URL}end-break/`,
            { break_id: breakId },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error ending break:', error);
        if (error.response) {
            throw new Error(error.response.data.message || 'An error occurred while ending the break.');
        } else {
            throw new Error('Network error: Please check your connection.');
        }
    }
};
