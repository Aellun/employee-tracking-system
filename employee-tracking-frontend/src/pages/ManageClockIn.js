import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { useAuth } from '../AuthProvider';
import '../css/ManageClockIn.css'; // Importing custom CSS

const ManageClockIn = () => {
  const { token } = useAuth();
  const [clockInRecords, setClockInRecords] = useState([]);
  const [users, setUsers] = useState([]); // Store employees here
  const [formData, setFormData] = useState({
    id: '',
    time_clocked_in: '',
    time_clocked_out: '',
    extra_hours: '',
    user_id: '',
    hours_worked: '',
  });
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const [filter, setFilter] = useState({
    date: '',
    employee: '',
  });

  useEffect(() => {
    fetchClockInRecords();
    fetchEmployees();
  }, []);

  const fetchClockInRecords = async () => {    
    try {
      const response = await axios.get('http://localhost:8000/admin-dashboard/api/clockins/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClockInRecords(response.data);
    } catch (error) {
      setError('Failed to fetch records. Please try again later.');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin-dashboard/api/employees/data/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data); // Store fetched employees in the users state
    } catch (error) {
      setError('Failed to fetch users.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateRecord();
    } else {
      await addRecord();
    }
  };

  const addRecord = async () => {
    try {
      const response = await axios.post('http://localhost:8000/admin-dashboard/api/clockins/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClockInRecords([...clockInRecords, response.data]);
      resetForm();
      setShowForm(false);
    } catch (error) {
      setError('Failed to add record. Please try again.');
    }
  };

  const updateRecord = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/admin-dashboard/api/clockins/${formData.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClockInRecords((prevRecords) =>
        prevRecords.map((record) => (record.id === response.data.id ? response.data : record))
      );
      resetForm();
      setShowForm(false);
    } catch (error) {
      setError('Failed to update record. Please try again.');
    }
  };

  const deleteRecord = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/admin-dashboard/api/clockins/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClockInRecords(clockInRecords.filter((record) => record.id !== id));
    } catch (error) {
      setError('Failed to delete record. Please try again.');
    }
  };

  const editRecord = (record) => {
    setFormData(record);
    setEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      time_clocked_in: '',
      time_clocked_out: '',
      extra_hours: '',
      user_id: '',
      hours_worked: '',
    });
    setEditing(false);
  };

  const getUserName = (user_id) => {
    const user = users.find((employees) => employees.id === user_id);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown Employee';
  };
  // const user_id = 1;
  // const userName = getUserName(user_id);
  // console.log(`User name for ID ${user_id}:`, userName);
  const toggleForm = () => setShowForm(!showForm);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredRecords = clockInRecords.filter((record) => {
    const recordDate = new Date(record.time_clocked_in).toISOString().split('T')[0];
    const userName = getUserName(record.user);  // Get the user name based on user_id
    
    return (
      (filter.date ? recordDate === filter.date : true) &&
      (filter.employee ? userName === filter.employee : true)  // Compare the name, not the ID
    );
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  return (
    <div className="manage-clock-in">
      <h1>Manage Clock In Records</h1>
      {error && <div className="error">{error}</div>}

      <button onClick={toggleForm} className="toggle-form-btn">
        {showForm ? 'Hide Form' : 'Add Record'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h2>{editing ? 'Edit Record' : 'Add Record'}</h2>
          <input type="hidden" name="id" value={formData.id} onChange={handleChange} />

          <div className="form-group">
            <label>Time Clocked In:</label>
            <input
              type="datetime-local"
              name="time_clocked_in"
              value={formData.time_clocked_in}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Time Clocked Out:</label>
            <input
              type="datetime-local"
              name="time_clocked_out"
              value={formData.time_clocked_out}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Extra Hours:</label>
            <input
              type="number"
              name="extra_hours"
              value={formData.extra_hours}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>User:</label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {`${user.first_name} ${user.last_name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Hours Worked:</label>
            <input
              type="number"
              name="hours_worked"
              value={formData.hours_worked}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {editing ? 'Update Record' : 'Add Record'}
          </button>
        </form>
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <h3>Filter Records</h3>
        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Employee:</label>
          <select
            name="employee"
            value={filter.employee}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Employees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {`${user.first_name} ${user.last_name}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table */}
      <table className="records-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Time Clocked In</th>
            <th>Time Clocked Out</th>
            <th>Extra Hours</th>
            <th>User</th>
            <th>Hours Worked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{new Date(record.time_clocked_in).toLocaleString()}</td>
              <td>{record.time_clocked_out ? new Date(record.time_clocked_out).toLocaleString() : 'N/A'}</td>
              <td>{record.extra_hours}</td>
              <td>{getUserName(record.user)}</td>
              <td>{record.hours_worked}</td>
              <td>
                <button onClick={() => editRecord(record)} className="edit-btn">
                  <FaEdit />
                </button>
                <button onClick={() => deleteRecord(record.id)} className="delete-btn">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        {Array(Math.ceil(filteredRecords.length / recordsPerPage))
          .fill()
          .map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={index + 1 === currentPage ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
      </div>
    </div>
  );
};

export default ManageClockIn;
