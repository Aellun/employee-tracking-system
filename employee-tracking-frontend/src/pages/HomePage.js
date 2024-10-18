import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import axios from 'axios';
import { FaTasks, FaRegClock, FaUser, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

const HomePage = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const [clockInStatus, setClockInStatus] = useState(null);
  const [taskSummary, setTaskSummary] = useState([]);
  const [hoursWorked, setHoursWorked] = useState(0);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:8000/api/clockin-status/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          if (response.data.clockedIn) {
            const clockInTime = new Date(response.data.time_clocked_in).toLocaleTimeString();
            setClockInStatus(`Clocked In at ${clockInTime}`);
          } else {
            setClockInStatus('Not Clocked In');
          }
        })
        .catch(error => console.error('Error fetching clock-in status:', error));

      axios.get('http://localhost:8000/api/timesheet/today/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setHoursWorked(response.data.hoursWorked);
        })
        .catch(error => console.error('Error fetching hours worked:', error));

      axios.get('http://localhost:8000/api/tasks/today', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          const taskNames = response.data.map(task => task.name);
          setTaskSummary(taskNames);
        })
        .catch(error => console.error('Error fetching task summary:', error));
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="navbar flex justify-between items-center px-6 py-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">EmplyTech System</h1>
        <div className="flex items-center">
          <span className="mr-4">{username.toUpperCase()}</span>
          <FaUser className="text-white mr-2" />
          <Link to="/profile" className="text-white hover:text-yellow-300">Profile</Link>
          <Link to="/settings" className="text-white hover:text-yellow-300 ml-4">Settings</Link>
        </div>
      </nav>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-200 p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <ul className="space-y-6">
            <li>
              <Link to="/tasks" className="flex items-center text-blue-600 hover:underline text-lg">
                <FaTasks className="text-blue-600 mr-3" />
                Tasks
              </Link>
            </li>
            <li>
              <Link to="/timesheet" className="flex items-center text-blue-600 hover:underline text-lg">
                <FaClipboardList className="text-blue-600 mr-3" />
                Timesheet
              </Link>
            </li>
            <li>
              <Link to="/clockin" className="flex items-center text-blue-600 hover:underline text-lg">
                <FaRegClock className="text-blue-600 mr-3" />
                Clock In
              </Link>
            </li>
            <li>
              <Link to="/leave" className="flex items-center text-blue-600 hover:underline text-lg">
                <FaUser className="text-blue-600 mr-3" />
                Leave
              </Link>
            </li>
          </ul>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-2 rounded-lg transition-all text-sm inline-flex items-center text-red-500 hover:text-red-700"
          >
            <FaSignOutAlt className="mr-1" />
            Logout
          </button>
        </aside>

        {/* Main content */}
<main className="flex-grow p-8 flex flex-col justify-center items-center">
  <h1 className="text-4xl font-extrabold mb-10 text-left text-gray-700 tracking-wide">Welcome, {username.toUpperCase()}</h1>
  <div className="flex flex-wrap justify-center gap-8 w-full max-w-7xl">
    {/* Clock-in Status */}
    <div className="flex flex-col items-center bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow-lg p-6 w-64 transition-transform transform hover:scale-105">
      <FaRegClock className="text-5xl mb-4" />
      <h2 className="text-2xl font-bold">Clock-in Status</h2>
      <p className="mt-4 text-lg">
        {clockInStatus || 'Loading...'}
      </p>
    </div>

    {/* Today's Tasks */}
    <div className="flex flex-col items-center bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg shadow-lg p-6 w-64 transition-transform transform hover:scale-105">
      <FaTasks className="text-5xl mb-4" />
      <h2 className="text-2xl font-bold">Today's Tasks</h2>
      {taskSummary.length > 0 ? (
        <ul className="mt-4 space-y-2 text-lg">
          {taskSummary.map((taskName, index) => (
            <li key={index} className="text-gray-100">{taskName}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-lg">No tasks assigned for today.</p>
      )}
    </div>

    {/* Hours Worked Today */}
    <div className="flex flex-col items-center bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg shadow-lg p-6 w-64 transition-transform transform hover:scale-105">
      <FaUser className="text-5xl mb-4" />
      <h2 className="text-2xl font-bold">Hours Worked Today</h2>
      <p className="mt-4 text-lg">{hoursWorked} hours</p>
    </div>
  </div>
</main>
</div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center w-full">
        <p>&copy; 2024 All rights reserved.</p>
        <p>
          <a href="/terms" className="text-gray-400 hover:text-gray-200">Terms of Service</a> |
          <a href="/privacy" className="text-gray-400 hover:text-gray-200">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
