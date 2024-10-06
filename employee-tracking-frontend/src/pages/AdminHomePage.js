import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider'; // Import useAuth to access logout and token

const AdminHomePage = () => {
  const { logout, token } = useAuth(); // Destructure logout and token from useAuth
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout function
    navigate('/'); // Redirect to login page after logging out
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4 shadow">
        <div className="flex justify-between items-center">
          <ul className="flex space-x-4">
            <li><Link to="/admin/employees" className="hover:text-yellow-300 transition">Employees</Link></li>
            <li><Link to="/admin/projects" className="hover:text-yellow-300 transition">Projects</Link></li>
            <li><Link to="/admin/reports" className="hover:text-yellow-300 transition">Reports</Link></li>
          </ul>

          {/* Logout button will appear if the user is logged in (token exists) */}
          {token && (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main Admin Content */}
      <div className="flex-grow p-4 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Admin Dashboard</h1>
        {/* Additional admin-related information or links can go here */}
        <p className="text-lg">
          Here you can manage employees, projects, and reports. Use the navigation above to access different sections.
        </p>
      </div>
    </div>
  );
};

export default AdminHomePage;
