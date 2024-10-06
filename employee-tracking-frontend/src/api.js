import axios from 'axios';  

// Function to get the CSRF token  
const getCSRFToken = () => {  
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');  
    return csrfToken;  
};  

// Generic API request function  
const apiRequest = (url, data) => {  
    const csrfToken = getCSRFToken();  

    return axios.post(url, data, {  
        headers: {  
            'X-CSRFToken': csrfToken,  
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`  
        }  
    });  
};  

// Function to clock in  
export const clockInRecord = (recordId) => {  
    return apiRequest(`http://localhost:8000/api/clock-in-records/${recordId}/clock_in/`, {});  
};  

// Function to clock out  
export const clockOutRecord = (recordId) => {  
    return apiRequest(`http://localhost:8000/api/clock-in-records/${recordId}/clock_out/`, {});  
};  

// Function to take a break  
export const takeBreakRecord = (recordId, breakType, breakNotes) => {  
    return apiRequest(`http://localhost:8000/api/clock-in-records/${recordId}/take_break/`, { break_type: breakType, break_notes: breakNotes });  
};