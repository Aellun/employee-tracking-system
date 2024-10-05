import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider'; // Import useAuth to access logout and token

const AdminNavbar = () => {
  const { logout, token } = useAuth(); // Destructure logout and token from useAuth
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout function
    navigate('/'); // Redirect to login page after logging out
  };

  return (
    <nav className="navbar flex justify-between items-center px-4 py-2 bg-gray-800 text-white">
      <ul className="flex space-x-4">
        <li><Link to="/admin/employees" className="hover:text-yellow-300">Employees</Link></li>
        <li><Link to="/admin/projects" className="hover:text-yellow-300">Projects</Link></li>
        <li><Link to="/admin/reports" className="hover:text-yellow-300">Reports</Link></li>
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
    </nav>
  );
};

export default AdminNavbar;
