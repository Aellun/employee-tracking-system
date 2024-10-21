import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeForm from '../components/EmployeeForm';
import { useAuth } from '../AuthProvider'; // Import the AuthProvider

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { token } = useAuth(); // Get token from AuthProvider

  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

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
        // Check if error response exists and display the relevant message
        if (error.response && error.response.data) {
            const errorMessage = error.response.data.email || 'An error occurred. Please try again.';
            alert(errorMessage); // Display the error message
        } else {
            console.error('Error creating/updating employee', error);
        }
    });
};

  const handleDeleteEmployee = (id) => {
    axios.delete(`http://localhost:8000/admin-dashboard/api/employees/data/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(fetchEmployees)
      .catch(error => console.error('Error deleting employee', error));
    setShowDeleteModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Manage Employees</h2>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Add Employee
      </button>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">First Name</th>
              <th className="px-4 py-2">Last Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">position</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{employee.id}</td>
                <td className="border px-4 py-2">{employee.first_name}</td>
                <td className="border px-4 py-2">{employee.last_name}</td>
                <td className="border px-4 py-2">{employee.email}</td>
                <td className="border px-4 py-2">{employee.position}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowModal(true);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowDeleteModal(true);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
            </h3>
            <EmployeeForm
              employee={selectedEmployee}
              onSubmit={handleCreateOrUpdateEmployee}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete {selectedEmployee?.first_name}?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
