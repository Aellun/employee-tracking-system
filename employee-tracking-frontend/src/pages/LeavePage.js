import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/LeavePage.css';

const LeaveManagementSystem = () => {
  const { token, userId } = useAuth();
  const [activeTab, setActiveTab] = useState('request');
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_email: '',
    leave_type: 'ANNUAL',
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Fetch leave balance and history
  useEffect(() => {
    const fetchLeaveData = async () => {
      setIsLoading(true);
      try {
        // Fetch leave balance
        const balanceResponse = await axios.get('http://localhost:8000/api/leave-balance/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeaveBalance(balanceResponse.data);
        
        // Fetch leave requests
        const requestsResponse = await axios.get(`http://localhost:8000/api/leave-requests/?user_id=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setLeaveRequests(requestsResponse.data);
      } catch (error) {
        console.error('Error fetching leave data:', error);
        toast.error('Failed to load leave data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveData();
  }, [token, userId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    const leaveRequestData = {
      ...formData,
      status: isDraft ? 'DRAFT' : 'PENDING'
    };
    
    try {
      if (editingRequest && editingRequest.id) {
        // Update existing request
        await axios.put(
          `http://localhost:8000/api/leave-requests/${editingRequest.id}/`, 
          leaveRequestData, 
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success(isDraft ? 'Draft saved successfully' : 'Leave request updated successfully');
      } else {
        // Create new request
        await axios.post(
          'http://localhost:8000/api/leave-requests/', 
          leaveRequestData, 
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success(isDraft ? 'Leave request saved as draft' : 'Leave request submitted successfully');
      }
      
      // Reset form and refresh data
      setFormData({
        employee_name: '',
        employee_email: '',
        leave_type: 'ANNUAL',
        start_date: '',
        end_date: '',
        reason: ''
      });
      setEditingRequest(null);
      
      // Refresh data
      const requestsResponse = await axios.get(`http://localhost:8000/api/leave-requests/?user_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLeaveRequests(requestsResponse.data);
      
      // Fetch updated balance
      const balanceResponse = await axios.get('http://localhost:8000/api/leave-balance/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveBalance(balanceResponse.data);
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Error submitting leave request');
    }
  };

  // Handle edit click
  const handleEditClick = (request) => {
    setEditingRequest(request);
    setFormData({
      employee_name: request.employee_name,
      employee_email: request.employee_email,
      leave_type: request.leave_type,
      start_date: request.start_date,
      end_date: request.end_date,
      reason: request.reason
    });
    setActiveTab('request');
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="leave-management-container">
      <div className="leave-management-header">
        <h1>Leave Management</h1>
        <p>Request time off and manage your leave balances</p>
      </div>
      
      <div className="leave-tabs">
        <button 
          className={`leave-tab ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          Request Leave
        </button>
        <button 
          className={`leave-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Leave History
        </button>
        <button 
          className={`leave-tab ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          Leave Balance
        </button>
        <button 
          className={`leave-tab ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          Policies
        </button>
      </div>
      
      <div className="leave-management-content">
        {isLoading ? (
          <div className="leave-loading">
            <div className="leave-spinner"></div>
            <p>Loading leave data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'request' && (
              <div className="leave-form-section">
                <h2>{editingRequest ? 'Edit Leave Request' : 'Request New Leave'}</h2>
                <form onSubmit={(e) => handleSubmit(e, false)} className="leave-form">
                  <div className="form-group">
                    <label>Employee Name</label>
                    <input
                      type="text"
                      name="employee_name"
                      value={formData.employee_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Employee Email</label>
                    <input
                      type="email"
                      name="employee_email"
                      value={formData.employee_email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select
                      name="leave_type"
                      value={formData.leave_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="ANNUAL">Annual Leave</option>
                      <option value="SICK">Sick Leave</option>
                      <option value="CASUAL">Casual Leave</option>
                      <option value="MATERNITY">Maternity Leave</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Reason for Leave</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      rows="4"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      {editingRequest ? 'Update Request' : 'Submit Request'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={(e) => handleSubmit(e, true)}
                    >
                      Save as Draft
                    </button>
                    {editingRequest && (
                      <button 
                        type="button" 
                        className="btn-cancel"
                        onClick={() => {
                          setEditingRequest(null);
                          setFormData({
                            employee_name: '',
                            employee_email: '',
                            leave_type: 'ANNUAL',
                            start_date: '',
                            end_date: '',
                            reason: ''
                          });
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="leave-history-section">
                <h2>Your Leave History</h2>
                
                {leaveRequests.length === 0 ? (
                  <div className="no-leave-history">
                    <p>No leave requests found.</p>
                  </div>
                ) : (
                  <div className="leave-history-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests.map(request => (
                          <tr key={request.id}>
                            <td>
                              <div className={`leave-type-badge ${request.leave_type.toLowerCase()}`}>
                                {request.leave_type}
                              </div>
                            </td>
                            <td>{formatDate(request.start_date)}</td>
                            <td>{formatDate(request.end_date)}</td>
                            <td className="leave-reason">{request.reason}</td>
                            <td>
                              <span className={`status-badge ${request.status.toLowerCase()}`}>
                                {request.status}
                              </span>
                            </td>
                            <td>
                              {request.status === 'DRAFT' && (
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleEditClick(request)}
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'balance' && (
              <div className="leave-balance-section">
                <h2>Your Leave Balance</h2>
                
                <div className="leave-balance-cards">
                  <div className="balance-card annual">
                    <div className="card-content">
                      <h3>Annual Leave</h3>
                      <div className="balance-value">{leaveBalance.annual || 0}</div>
                      <p>Days Remaining</p>
                    </div>
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="balance-card sick">
                    <div className="card-content">
                      <h3>Sick Leave</h3>
                      <div className="balance-value">{leaveBalance.sick || 0}</div>
                      <p>Days Remaining</p>
                    </div>
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8V12L15,15" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="balance-card casual">
                    <div className="card-content">
                      <h3>Casual Leave</h3>
                      <div className="balance-value">{leaveBalance.casual || 0}</div>
                      <p>Days Remaining</p>
                    </div>
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8V12L15,15" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="balance-card maternity">
                    <div className="card-content">
                      <h3>Maternity Leave</h3>
                      <div className="balance-value">{leaveBalance.maternity || 0}</div>
                      <p>Days Remaining</p>
                    </div>
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="hr-contact-info">
                  <h3>Need Assistance?</h3>
                  <p>Contact HR for any leave-related questions:</p>
                  <div className="contact-details">
                    <p>
                      <strong>Email:</strong> 
                      <a href="mailto:hr@employeetrackingsystem.com">hr@employeetrackingsystem.com</a>
                    </p>
                    <p>
                      <strong>Phone:</strong> 
                      <a href="tel:+254728519741">(254) 728 519741</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'policies' && (
              <div className="policies-section">
                <h2>Leave Policies & Guidelines</h2>
                
                <div className="policy-card">
                  <div className="policy-content">
                    <h3>Annual Leave Policy</h3>
                    <p>
                      Employees are entitled to annual leave based on their tenure and position. 
                      Annual leave must be requested at least 2 weeks in advance for approval.
                    </p>
                    <ul>
                      <li>Employees with less than 1 year: 10 days</li>
                      <li>1-3 years: 15 days</li>
                      <li>3+ years: 20 days</li>
                    </ul>
                  </div>
                </div>
                
                <div className="policy-card">
                  <div className="policy-content">
                    <h3>Sick Leave Policy</h3>
                    <p>
                      Sick leave can be availed in case of illness or medical emergencies. 
                      Proper documentation is required for absences longer than 3 days.
                    </p>
                    <ul>
                      <li>Maximum 14 days per year</li>
                      <li>Doctor's note required after 3 consecutive days</li>
                      <li>No carryover to next year</li>
                    </ul>
                  </div>
                </div>
                
                <div className="policy-card">
                  <div className="policy-content">
                    <h3>Maternity/Paternity Leave</h3>
                    <p>
                      Details on leave entitlements for expecting parents. Maternity leave 
                      begins 2 weeks before the due date and extends 12 weeks after birth.
                    </p>
                    <ul>
                      <li>Maternity: 14 weeks paid leave</li>
                      <li>Paternity: 4 weeks paid leave</li>
                      <li>Additional unpaid leave available</li>
                    </ul>
                  </div>
                </div>
                
                <div className="policy-card">
                  <div className="policy-content">
                    <h3>Unpaid Leave Policy</h3>
                    <p>
                      Employees can apply for unpaid leave in certain circumstances. 
                      Approval is subject to business needs and employee's performance.
                    </p>
                    <ul>
                      <li>Maximum 30 days per year</li>
                      <li>Requires 4 weeks advance notice</li>
                      <li>Approval from department head</li>
                    </ul>
                  </div>
                </div>
                
                <div className="policy-documents">
                  <a href="/policies" className="policy-link">
                    Download Full Leave Policy Document
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveManagementSystem;