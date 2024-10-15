import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeaveRequestForm = ({ existingRequest, onClose }) => {
    const { token } = useAuth();
    
    const initialFormData = {
        employee_name: '',
        employee_email: '',
        leave_type: 'ANNUAL',
        start_date: '',
        end_date: '',
        reason: ''
    };
    
    const [formData, setFormData] = useState(initialFormData);

    // Pre-fill form if editing an existing request
    useEffect(() => {
        if (existingRequest) {
            setFormData({
                employee_name: existingRequest.employee_name || '',
                employee_email: existingRequest.employee_email || '',
                leave_type: existingRequest.leave_type || 'ANNUAL',
                start_date: existingRequest.start_date || '',
                end_date: existingRequest.end_date || '',
                reason: existingRequest.reason || '',
                status: existingRequest.status || 'DRAFT',
            });
        }
    }, [existingRequest]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e, isDraft = false) => {
        e.preventDefault();
        
        const leaveRequestData = {
            ...formData,
            status: isDraft ? 'DRAFT' : 'PENDING'
        };
    
        try {
            if (existingRequest && existingRequest.id) {
                // Update existing request using the correct ID
                await axios.put(
                    `http://localhost:8000/api/leave-requests/${existingRequest.id}/`, 
                    leaveRequestData, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                toast.success(isDraft ? 'Draft saved successfully' : 'Leave request updated successfully');
            } else {
                // Create a new request
                await axios.post(
                    'http://localhost:8000/api/leave-requests/', 
                    leaveRequestData, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                toast.success(isDraft ? 'Leave request saved as draft' : 'Leave request submitted successfully');
            }
            
            setFormData(initialFormData);  // Reset form
            onClose();  // Close the form after submission
    
        } catch (error) {
            console.error('Error submitting leave request:', error);
            toast.error('Error submitting leave request');
        }
    };
    

    const handleCancel = () => {
        setFormData(initialFormData);  // Reset form
        onClose();  // Close the form
        toast.info('Leave request canceled');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-200">
            <form onSubmit={(e) => handleSubmit(e, false)} className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Request Leave</h2>

                {/** Employee Name */}
                <FormInput
                    label="Employee Name"
                    type="text"
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleChange}
                />

                {/** Employee Email */}
                <FormInput
                    label="Employee Email"
                    type="email"
                    name="employee_email"
                    value={formData.employee_email}
                    onChange={handleChange}
                />

                {/** Leave Type */}
                <FormSelect
                    label="Leave Type"
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleChange}
                    options={[
                        { value: 'ANNUAL', label: 'Annual Leave' },
                        { value: 'SICK', label: 'Sick Leave' },
                        { value: 'CASUAL', label: 'Casual Leave' },
                        { value: 'MATERNITY', label: 'Maternity Leave' }
                    ]}
                />

                {/** Start Date */}
                <FormInput
                    label="Start Date"
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                />

                {/** End Date */}
                <FormInput
                    label="End Date"
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                />

                {/** Reason for Leave */}
                <FormTextarea
                    label="Reason for Leave"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                />

                <div className="flex justify-between space-x-4">
                    {/** Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>

                    {/** Save as Draft Button */}
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}  // Save as draft
                        className="w-full bg-gray-500 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                        Save Draft
                    </button>

                    {/** Cancel Button */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// Form Input Component
const FormInput = ({ label, type, name, value, onChange }) => (
    <div className="space-y-2">
        <label className="block text-gray-700 font-medium">{label}:</label>
        <input 
            type={type} 
            name={name}
            value={value} 
            onChange={onChange} 
            required 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

// Form Select Component
const FormSelect = ({ label, name, value, onChange, options }) => (
    <div className="space-y-2">
        <label className="block text-gray-700 font-medium">{label}:</label>
        <select 
            name={name}
            value={value} 
            onChange={onChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

// Form Textarea Component
const FormTextarea = ({ label, name, value, onChange }) => (
    <div className="space-y-2">
        <label className="block text-gray-700 font-medium">{label}:</label>
        <textarea 
            name={name}
            value={value} 
            onChange={onChange} 
            required 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

export default LeaveRequestForm;
