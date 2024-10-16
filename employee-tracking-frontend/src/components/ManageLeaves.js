import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';

const ManageLeaves = () => {
  const { token } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/admin-dashboard/api/leaves/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
      } catch (err) {
        setError('Error fetching leave requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [token]);

  // Update leave status
  const handleUpdateLeaveStatus = async (leaveId, status) => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
      try {
        const response = await axios.put(
          `http://localhost:8000/admin-dashboard/api/leaves/${leaveId}/`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLeaveRequests((prevState) =>
          prevState.map((leave) =>
            leave.id === leaveId ? { ...leave, status: response.data.status } : leave
          )
        );
      } catch (err) {
        setError('Error updating leave request status.');
      }
    }
  };

  // Delete a leave request
  const handleDeleteLeave = async (leaveId) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await axios.delete(`http://localhost:8000/admin-dashboard/api/leaves/${leaveId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests((prevState) =>
          prevState.filter((leave) => leave.id !== leaveId)
        );
      } catch (err) {
        setError('Error deleting leave request.');
      }
    }
  };

  if (loading) return <p className="text-center text-lg">Loading leave requests...</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Manage Leaves</h2>

      {error && <p className="text-red-600">{error}</p>}

      <table className="min-w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="border border-gray-300 px-4 py-2">Employee Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Leave Type</th>
            <th className="border border-gray-300 px-4 py-2">Start Date</th>
            <th className="border border-gray-300 px-4 py-2">End Date</th>
            <th className="border border-gray-300 px-4 py-2">Reason</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((leave) => (
            <tr key={leave.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{leave.employee_name}</td>
              <td className="border border-gray-300 px-4 py-2">{leave.employee_email}</td>
              <td className="border border-gray-300 px-4 py-2">{leave.leave_type}</td>
              <td className="border border-gray-300 px-4 py-2">{leave.start_date}</td>
              <td className="border border-gray-300 px-4 py-2">{leave.end_date}</td>
              <td className="border border-gray-300 px-4 py-2">{leave.reason}</td>
              <td className="border border-gray-300 px-4 py-2">{leave.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                {leave.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleUpdateLeaveStatus(leave.id, 'APPROVED')}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateLeaveStatus(leave.id, 'REJECTED')}
                      className="bg-red-500 text-white px-3 py-1 rounded mr-2 hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => handleDeleteLeave(leave.id)}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageLeaves;
