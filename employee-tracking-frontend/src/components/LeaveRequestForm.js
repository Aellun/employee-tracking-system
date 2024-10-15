import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeaveRequestForm = () => {
    const { token } = useAuth();
    
    const initialFormData = {
        employee_name: '',
        employee_id: '',
        employee_email: '',
        leave_type: 'ANNUAL',
        start_date: '',
        end_date: '',
        reason: ''
    };
    
    const [formData, setFormData] = useState(initialFormData);

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
            
            // Clear the form after successful submit or draft
            setFormData(initialFormData);

        } catch (error) {
            console.error('Error submitting leave request:', error);
            toast.error('Error submitting leave request');
        }
    };

    const handleCancel = () => {
        setFormData(initialFormData);  // Clear the form
        toast.info('Leave request canceled');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={(e) => handleSubmit(e, false)} className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Leave Request Form</h2>

                {/** Employee Name */}
                <FormInput
                    label="Employee Name"
                    type="text"
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleChange}
                />

                {/** Employee ID */}
                <FormInput
                    label="Employee ID"
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
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

                <div className="flex space-x-4 mt-6">
                    {/** Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Submit Leave Request
                    </button>

                    {/** Save as Draft Button */}
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}  // Save as draft
                        className="w-full bg-gray-600 text-white font-semibold py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                    >
                        Save as Draft
                    </button>

                    {/** Cancel Button */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition duration-200"
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
    <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">{label}:</label>
        <input 
            type={type} 
            name={name}
            value={value} 
            onChange={onChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

// Form Select Component
const FormSelect = ({ label, name, value, onChange, options }) => (
    <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">{label}:</label>
        <select 
            name={name}
            value={value} 
            onChange={onChange} 
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">{label}:</label>
        <textarea 
            name={name}
            value={value} 
            onChange={onChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

export default LeaveRequestForm;
