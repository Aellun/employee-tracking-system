import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/employees/');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Employees</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="border-b">First Name</th>
            <th className="border-b">Last Name</th>
            <th className="border-b">Email</th>
            <th className="border-b">Role</th>
            <th className="border-b">Active</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="border-b">{employee.first_name}</td>
              <td className="border-b">{employee.last_name}</td>
              <td className="border-b">{employee.email}</td>
              <td className="border-b">{employee.role}</td>
              <td className="border-b">{employee.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeManagement;
