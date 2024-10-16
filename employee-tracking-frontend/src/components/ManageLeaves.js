import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';

const ManageLeaves = () => {
  const { token } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('/api/leaves/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
      } catch (err) {
        setError('Error fetching leave requests.');
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchLeaveRequests();
  }, [token]);

  // Update leave status
  const handleUpdateLeaveStatus = async (leaveId, status) => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
      try {
        const response = await axios.put(
          `/api/leaves/${leaveId}/`,
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
        await axios.delete(`/api/leaves/${leaveId}/`, {
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

  if (loading) return <p>Loading leave requests...</p>; // Loading state

  return (
    <div>
      <h2>Manage Leaves</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Email</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((leave) => (
            <tr key={leave.id}>
              <td>{leave.employee_name}</td>
              <td>{leave.employee_email}</td>
              <td>{leave.leave_type}</td>
              <td>{leave.start_date}</td>
              <td>{leave.end_date}</td>
              <td>{leave.reason}</td>
              <td>{leave.status}</td>
              <td>
                {leave.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleUpdateLeaveStatus(leave.id, 'APPROVED')}>Approve</button>
                    <button onClick={() => handleUpdateLeaveStatus(leave.id, 'REJECTED')}>Reject</button>
                  </>
                )}
                <button onClick={() => handleDeleteLeave(leave.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageLeaves;
