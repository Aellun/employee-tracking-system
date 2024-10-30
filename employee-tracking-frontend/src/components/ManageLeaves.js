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

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/admin-dashboard/api/leaves/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
        setFilteredLeaves(response.data);
      } catch (err) {
        setError('Error fetching leave requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, [token]);

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

  if (loading) return <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading leave requests...</p>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Manage Leaves</h2>

      {error && <p style={{ color: '#e53e3e' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Employee Name"
          value={employeeName}
          onChange={e => setEmployeeName(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button onClick={handleFilter} style={{ padding: '8px', backgroundColor: '#1d72b8', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Filter</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#e2e8f0', color: '#4a5568' }}>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>Employee Name</th>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>Email</th>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>Leave Type</th>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>Start Date</th>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>End Date</th>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>Reason</th>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>Status</th>
            <th style={{ border: '1px solid #e2e8f0', padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaves.map((leave) => (
            <tr key={leave.id} style={{ backgroundColor: leave.status === 'PENDING' ? '#fefcbf' : 'white', cursor: 'pointer' }}>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>{leave.employee_name}</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>{leave.employee_email}</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>{leave.leave_type}</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>{leave.start_date}</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>{leave.end_date}</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>{leave.reason}</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>{leave.status}</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '12px' }}>
                {leave.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleUpdateLeaveStatus(leave.id, 'APPROVED')}
                      style={{ backgroundColor: '#38a169', color: '#fff', padding: '8px', borderRadius: '4px', marginRight: '8px', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateLeaveStatus(leave.id, 'REJECTED')}
                      style={{ backgroundColor: '#e53e3e', color: '#fff', padding: '8px', borderRadius: '4px', marginRight: '8px', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => handleDeleteLeave(leave.id)}
                  style={{ backgroundColor: '#a0aec0', color: '#2d3748', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
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
