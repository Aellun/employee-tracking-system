import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeForm from '../components/EmployeeForm';
import { useAuth } from '../AuthProvider';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin-dashboard/api/employees/data/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
      setFilteredEmployees(response.data); // Initialize filtered list to full list
    } catch (error) {
      console.error('Error fetching employees', error);
    }
  };

  const handleCreateOrUpdateEmployee = (employeeData) => {
    const url = selectedEmployee 
      ? `http://localhost:8000/admin-dashboard/api/employees/data/${selectedEmployee.id}/` 
      : 'http://localhost:8000/admin-dashboard/api/employees/data/';

    const method = selectedEmployee ? 'put' : 'post';

    axios({
      method: method,
      url: url,
      data: employeeData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      fetchEmployees();
      setShowModal(false);
      setSelectedEmployee(null);
    })
    .catch(error => {
      const errorMessage = error.response?.data?.email || error.response?.data?.message || 'An error occurred. Please try again.';
      alert(errorMessage);
      console.error('Error creating/updating employee', error);
    });
  };

  const handleDeleteEmployee = async () => {
    try {
      await axios.delete(`http://localhost:8000/admin-dashboard/api/employees/data/${selectedEmployee.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEmployees();
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error deleting employee', error);
    }
  };

  const handleSearch = () => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const results = employees.filter(employee =>
      employee.first_name.toLowerCase().includes(lowerCaseTerm) ||
      employee.last_name.toLowerCase().includes(lowerCaseTerm) ||
      employee.email.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredEmployees(results);
  };

  return (
    <div style={{ maxWidth: '950px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ fontSize: '26px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Manage Employees</h2>

      {/* Search Input and Button */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          onClick={handleSearch}
          style={{ backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none', transition: 'background 0.3s' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007BFF'}
        >
          Search
        </button>
        <button
          onClick={() => {
            setFilteredEmployees(employees);
            setSearchTerm('');
          }}
          style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none', transition: 'background 0.3s' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          Reset
        </button>
      </div>

      <button
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: '#007BFF',
          color: 'white',
          padding: '5px 10px',
          fontSize: '18px',
          borderRadius: '5px',
          cursor: 'pointer',
          border: 'none',
          transition: 'background 0.3s',
          width: '200px',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#007BFF')}
      >
        Add Employee
      </button>

      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', backgroundColor: '#FFF', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)', borderRadius: '8px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7f8fa', textAlign: 'left', color: '#555' }}>
              {['ID', 'First Name', 'Last Name', 'Email', 'Position', 'Actions'].map((header) => (
                <th key={header} style={{ padding: '12px', fontSize: '16px', fontWeight: '500' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee.id} style={{ backgroundColor: '#FFF', borderBottom: '1px solid #E0E0E0' }}>
                <td style={{ padding: '12px' }}>{employee.id}</td>
                <td style={{ padding: '12px' }}>{employee.first_name}</td>
                <td style={{ padding: '12px' }}>{employee.last_name}</td>
                <td style={{ padding: '12px' }}>{employee.email}</td>
                <td style={{ padding: '12px' }}>{employee.position}</td>
                <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowModal(true);
                    }}
                    style={{ backgroundColor: '#6c757d', color: 'white', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', border: 'none', transition: 'background 0.3s' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowDeleteModal(true);
                    }}
                    style={{ backgroundColor: '#DC3545', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', minWidth: '300px', zIndex: 1000 }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</h3>
            <EmployeeForm
              employee={selectedEmployee}
              onSubmit={handleCreateOrUpdateEmployee}
              onClose={() => setShowModal(false)}
            />
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', border: 'none' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', minWidth: '300px', zIndex: 1000 }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>Confirm Delete</h3>
            <p>Are you sure you want to delete {selectedEmployee?.first_name} {selectedEmployee?.last_name}?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={handleDeleteEmployee}
                style={{ backgroundColor: '#DC3545', color: 'white', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', border: 'none' }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', border: 'none' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
