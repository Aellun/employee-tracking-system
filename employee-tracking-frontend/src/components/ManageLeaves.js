import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';

const ManageLeaves = () => {
  const { token } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/admin-dashboard/api/leaves/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
        setFilteredLeaves(response.data); // Initialize filtered leaves
      } catch (err) {
        setError('Error fetching leave requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [token]);

  // Filter leave requests based on input criteria
  const handleFilter = () => {
    let filtered = leaveRequests;

    if (employeeName) {
      filtered = filtered.filter(leave => 
        leave.employee_name.toLowerCase().includes(employeeName.toLowerCase())
      );
    }
    if (startDate) {
      filtered = filtered.filter(leave => new Date(leave.start_date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(leave => new Date(leave.end_date) <= new Date(endDate));
    }
    if (statusFilter) {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    setFilteredLeaves(filtered);
  };

  // Update leave status
  const handleUpdateLeaveStatus = async (leaveId, status) => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
      try {
        const response = await axios.put(
          `http://localhost:8000/admin-dashboard/api/leaves/${leaveId}/`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFilteredLeaves((prevState) =>
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
        setFilteredLeaves((prevState) =>
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

      {/* Filter Inputs */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Employee Name"
          value={employeeName}
          onChange={e => setEmployeeName(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button onClick={handleFilter} className="p-2 bg-blue-500 text-white rounded">Filter</button>
      </div>

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
          {filteredLeaves.map((leave) => (
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
