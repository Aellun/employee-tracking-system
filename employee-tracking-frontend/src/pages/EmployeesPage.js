import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeForm from '../components/EmployeeForm';
import { useAuth } from '../AuthProvider';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDeleteEmployee = (id) => {
    axios.delete(`http://localhost:8000/admin-dashboard/api/employees/data/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => fetchEmployees())
    .catch(error => console.error('Error deleting employee', error));
    setShowDeleteModal(false);
  };

  return (
    <div style={{ maxWidth: '950px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Manage Employees</h2>
      <button
        onClick={() => setShowModal(true)}
        style={{ backgroundColor: '#007BFF', color: 'white', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}
      >
        Add Employee
      </button>

      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', backgroundColor: '#FFF', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F2F2F2' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>First Name</th>
              <th style={{ padding: '10px' }}>Last Name</th>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Position</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} style={{ backgroundColor: '#FFF' }}>
                <td style={{ padding: '10px', border: '1px solid #EEE' }}>{employee.id}</td>
                <td style={{ padding: '10px', border: '1px solid #EEE' }}>{employee.first_name}</td>
                <td style={{ padding: '10px', border: '1px solid #EEE' }}>{employee.last_name}</td>
                <td style={{ padding: '10px', border: '1px solid #EEE' }}>{employee.email}</td>
                <td style={{ padding: '10px', border: '1px solid #EEE' }}>{employee.position}</td>
                <td style={{ padding: '10px', border: '1px solid #EEE' }}>
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowModal(true);
                    }}
                    style={{ backgroundColor: 'grey', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}
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
        <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', zIndex: 1000 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
              {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
            </h3>
            <EmployeeForm
              employee={selectedEmployee}
              onSubmit={handleCreateOrUpdateEmployee}
              onClose={() => setShowModal(false)} // Pass onClose function
            />
            <div style={{ textAlign: 'right', marginTop: '15px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: '#6C757D', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', zIndex: 1000 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '15px' }}>Are you sure you want to delete {selectedEmployee?.first_name}?</p>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ backgroundColor: '#6C757D', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                style={{ backgroundColor: '#DC3545', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
