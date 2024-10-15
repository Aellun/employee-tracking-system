import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import LeaveRequestForm from './LeaveRequestForm'; // Import the form for editing

const LeaveHistory = () => {
    const { token } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRequest, setEditingRequest] = useState(null); // For tracking the request being edited

    // Define fetchLeaveRequests outside of useEffect so that it can be reused
    const fetchLeaveRequests = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/leave-requests/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setLeaveRequests(response.data);
        } catch (error) {
            setError('Error fetching leave requests');
            console.error('Error fetching leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests(); // Fetch data when the component mounts
    }, [token]);

    const handleEditClick = (request) => {
        console.log('Editing request ID:', request?.id);
        setEditingRequest(request);  // Set the request being edited
    };

    const handleFormClose = () => {
        setEditingRequest(null); // Close the form when editing is done
        fetchLeaveRequests(); // Refresh the leave requests after editing
    };

    if (loading) {
        return <p>Loading leave history...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Leave History</h2>
            {leaveRequests.length === 0 ? (
                <p>No leave requests found.</p>
            ) : (
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="px-4 py-2 border">Employee Name</th>
                            <th className="px-4 py-2 border">Leave Type</th>
                            <th className="px-4 py-2 border">Start Date</th>
                            <th className="px-4 py-2 border">End Date</th>
                            <th className="px-4 py-2 border">Reason</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2 border">{request.employee_name}</td>
                                <td className="px-4 py-2 border">{request.leave_type}</td>
                                <td className="px-4 py-2 border">{new Date(request.start_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 border">{new Date(request.end_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 border">{request.reason}</td>
                                <td className="px-4 py-2 border">{request.status}</td>
                                <td className="px-4 py-2 border">
                                    {request.status === 'DRAFT' && (
                                        <button
                                            onClick={() => handleEditClick(request)}
                                            className="bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {editingRequest && (
                <div className="mt-6">
                    <LeaveRequestForm
                        existingRequest={editingRequest}
                        onClose={handleFormClose}  // Handle form close action
                    />
                </div>
            )}
        </div>
    );
};

export default LeaveHistory;
