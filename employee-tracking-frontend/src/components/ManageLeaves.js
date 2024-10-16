import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // Get authentication context

const ManageLeaves = () => {
  const { token } = useAuth(); // Get the token from the AuthProvider
  const [leaveRequests, setLeaveRequests] = useState([]); // State to store leave requests
  const [error, setError] = useState(null); // Error handling

  // Fetch leave requests on component mount
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('/api/leaves/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
      } catch (err) {
        setError('Error fetching leave requests.');
      }
    };

    fetchLeaveRequests();
  }, [token]);

  // Approve or reject a leave request
  const handleUpdateLeaveStatus = async (leaveId, status) => {
    try {
      const response = await axios.put(
        `/api/leaves/${leaveId}/`,
        { status }, // Send the updated status (APPROVED or REJECTED)
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the state to reflect the new status
      setLeaveRequests((prevState) =>
        prevState.map((leave) =>
          leave.id === leaveId ? { ...leave, status: response.data.status } : leave
        )
      );
    } catch (err) {
      setError('Error updating leave request status.');
    }
  };

  // Delete a leave request
  const handleDeleteLeave = async (leaveId) => {
    try {
      await axios.delete(`/api/leaves/${leaveId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the deleted leave from the state
      setLeaveRequests((prevState) =>
        prevState.filter((leave) => leave.id !== leaveId)
      );
    } catch (err) {
      setError('Error deleting leave request.');
    }
  };

  return (
    <div>
      <h2>Manage Leaves</h2>

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display list of leave requests */}
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
                    <button
                      onClick={() => handleUpdateLeaveStatus(leave.id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateLeaveStatus(leave.id, 'REJECTED')}
                    >
                      Reject
                    </button>
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
