import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeForm from '../components/EmployeeForm';
import { useAuth } from '../AuthProvider';
import '../css/ManageEmployees.css';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const { token } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/admin-dashboard/api/employees/data/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
      setFilteredEmployees(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching employees', error);
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdateEmployee = async (employeeData) => {
    try {
      setIsLoading(true);
      const url = selectedEmployee 
        ? `http://localhost:8000/admin-dashboard/api/employees/data/${selectedEmployee.id}/` 
        : 'http://localhost:8000/admin-dashboard/api/employees/data/';
      
      const method = selectedEmployee ? 'put' : 'post';
      
      await axios({
        method: method,
        url: url,
        data: employeeData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      await fetchEmployees();
      setShowModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      const errorMessage = error.response?.data?.email || 
                           error.response?.data?.message || 
                           'An error occurred. Please try again.';
      alert(errorMessage);
      console.error('Error creating/updating employee', error);
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:8000/admin-dashboard/api/employees/data/${selectedEmployee.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchEmployees();
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error deleting employee', error);
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const lowerCaseTerm = searchTerm.toLowerCase();
    const results = employees.filter(employee =>
      employee.first_name?.toLowerCase().includes(lowerCaseTerm) ||
      employee.last_name?.toLowerCase().includes(lowerCaseTerm) ||
      employee.email?.toLowerCase().includes(lowerCaseTerm) ||
      employee.position?.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredEmployees(results);
  };

  const resetSearch = () => {
    setSearchTerm('');
    setFilteredEmployees(employees);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredEmployees(sortedEmployees);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="manage-employees-container">
      <div className="header-section">
        <div className="title-container">
          <h1>Employee Management</h1>
          <p>Manage your team members and their information</p>
        </div>
        
        <button 
          className="add-employee-btn"
          onClick={() => {
            setSelectedEmployee(null);
            setShowModal(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
          Add New Employee
        </button>
      </div>

      <div className="controls-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or position"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="search-btn">Search</button>
          <button 
            type="button" 
            className="reset-btn"
            onClick={resetSearch}
          >
            Reset
          </button>
        </form>
        
        <div className="stats-container">
          <div className="stat-card">
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
          </div>
          <div className="stat-card">
            <span>Active Today</span>
            <strong>{employees.filter(e => e.status === 'active').length}</strong>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading employee data...</p>
        </div>
      ) : (
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>
                  ID {getSortIcon('id')}
                </th>
                <th onClick={() => handleSort('first_name')}>
                  Name {getSortIcon('first_name')}
                </th>
                <th onClick={() => handleSort('email')}>
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('position')}>
                  Position {getSortIcon('position')}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-results">
                    <div className="no-results-content">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <p>No employees found matching your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>
                      <div className="employee-info">
                        <div className="avatar-placeholder">
                          {employee.first_name?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="employee-name">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="employee-department">
                            {employee.department || 'No department'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{employee.email}</td>
                    <td>{employee.position}</td>
                    <td>
                      <span className={`status-badge ${employee.status || 'inactive'}`}>
                        {employee.status || 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowModal(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowDeleteModal(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="employee-modal">
            <div className="modal-header">
              <h3>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowModal(false);
                  setSelectedEmployee(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <EmployeeForm
                employee={selectedEmployee}
                onSubmit={handleCreateOrUpdateEmployee}
                onClose={() => setShowModal(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                className="close-modal"
                onClick={() => setShowDeleteModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="delete-warning">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>
                  Are you sure you want to permanently delete 
                  <strong> {selectedEmployee?.first_name} {selectedEmployee?.last_name}</strong>?
                </p>
                <p className="warning-note">This action cannot be undone.</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={handleDeleteEmployee}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Yes, Delete Employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;