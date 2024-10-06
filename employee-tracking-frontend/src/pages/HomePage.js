import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider'; // Import useAuth to access logout and token
import '../css/HomePage.css'; // Import custom CSS if needed

const HomePage = () => {
  const { logout, token } = useAuth(); // Destructure logout and token from useAuth
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout function
    navigate('/'); // Redirect to login page after logging out
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar at the top */}
      <nav className="navbar flex justify-between items-center px-4 py-2 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Employee Tracking System</h1>
        {/* Logout button will appear if the user is logged in (token exists) */}
        
        <ul className="flex space-x-4">
          <li><Link to="/tasks" className="hover:text-yellow-300">Tasks</Link></li>
          <li><Link to="/track" className="hover:text-yellow-300">Time Tracker</Link></li>
          <li><Link to="/timesheet" className="hover:text-yellow-300">Timesheet</Link></li>
          <li><Link to="/clockin" className="hover:text-yellow-300">Clock In</Link></li>
        </ul>
        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Logout
          </button>
        )}
      </nav>

      

      {/* Content Section */}
      <main className="flex-grow p-8">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="mt-4 text-lg">
          We are glad to have you here! Use the navigation above to access your tasks, track your time, and clock in for your work.
        </p>
        {/* Add any additional information or links you want to show on the home page */}
      </main>
    </div>
  );
};

export default HomePage;
