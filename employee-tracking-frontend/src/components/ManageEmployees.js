import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';

const ManageEmployees = () => {
  const { token } = useAuth(); // Get the token from context
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    role: '', 
    is_active: true 
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      console.log("Fetching employees...");
  console.log("Authorization Token: ", token);
      if (!token) {
        setError('No token found');
        return;
      }

      const headers= { Authorization: `Bearer ${token}` };


      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/admin-dashboard/api/employees/', { headers });
        setEmployees(response.data);
      } catch (error) {
        setError(error.response?.data?.detail || 'Error fetching employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (editingEmployee) {
        // Update existing employee
        const response = await axios.put(
          `http://localhost:8000/admin-dashboard/api/employees/${editingEmployee.id}/`,
          formData,
          { headers }
        );
        setEmployees(employees.map((emp) => (emp.id === editingEmployee.id ? response.data : emp)));
        setSuccess('Employee updated successfully');
      } else {
        // Create new employee
        const response = await axios.post('http://localhost:8000/admin-dashboard/api/employees/', formData, { headers });
        setEmployees([...employees, response.data]);
        setSuccess('Employee created successfully');
      }
      // Reset form after creating or updating
      setFormData({ first_name: '', last_name: '', email: '', role: '', is_active: true });
      setEditingEmployee(null);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error saving employee data');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`http://localhost:8000/admin-dashboard/api/employees/${employeeId}/`, { headers });
        setEmployees(employees.filter((emp) => emp.id !== employeeId));
        setSuccess('Employee deleted successfully');
      } catch (error) {
        setError(error.response?.data?.detail || 'Error deleting employee');
      }
    }
  };

  const clearForm = () => {
    setFormData({ first_name: '', last_name: '', email: '', role: '', is_active: true });
    setEditingEmployee(null);
  };

  const handleCloseNotification = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) return <p>Loading employees...</p>; // Consider adding a spinner here
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Manage Employees</h2>

      {/* Notification Section */}
      {error && (
        <div className="error-notification">
          <p>{error}</p>
          <button onClick={handleCloseNotification}>Close</button>
        </div>
      )}
      {success && (
        <div className="success-notification">
          <p>{success}</p>
          <button onClick={handleCloseNotification}>Close</button>
        </div>
      )}

      <form onSubmit={handleCreateOrUpdate}>
        <input 
          type="text" 
          name="first_name" 
          value={formData.first_name} 
          onChange={handleChange} 
          placeholder="First Name" 
          required 
        />
        <input 
          type="text" 
          name="last_name" 
          value={formData.last_name} 
          onChange={handleChange} 
          placeholder="Last Name" 
          required 
        />
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="Email" 
          required 
        />
        <input 
          type="text" 
          name="role" 
          value={formData.role} 
          onChange={handleChange} 
          placeholder="Role" 
          required 
        />
        <select name="is_active" value={formData.is_active} onChange={handleChange}>
          <option value={true}>Active</option>
          <option value={false}>Inactive</option>
        </select>
        <button type="submit">
          {editingEmployee ? 'Update Employee' : 'Add Employee'}
        </button>
        <button type="button" onClick={clearForm}>
          Clear Form
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.first_name}</td>
              <td>{employee.last_name}</td>
              <td>{employee.email}</td>
              <td>{employee.role}</td>
              <td>{employee.is_active ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(employee)}>Edit</button>
                <button onClick={() => handleDelete(employee.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageEmployees;
