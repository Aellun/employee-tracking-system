import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import axios from 'axios';
import { FaTasks, FaRegClock, FaUser, FaSignOutAlt, FaClipboardList } from 'react-icons/fa'; // Updated icons

const HomePage = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const [clockInStatus, setClockInStatus] = useState(null);
  const [taskSummary, setTaskSummary] = useState([]);
  const [hoursWorked, setHoursWorked] = useState(0);

  // Retrieve the username from local storage
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (token) {
      // Fetch clock-in status from the correct backend URL
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

      // Fetch today's worked hours
      axios.get('http://localhost:8000/api/timesheet/today/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setHoursWorked(response.data.hoursWorked);
        })
        .catch(error => console.error('Error fetching hours worked:', error));

      // Fetch today's task summary
      axios.get('http://localhost:8000/api/tasks/today', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          const taskNames = response.data.map(task => task.name);  // Extract only the names
          setTaskSummary(taskNames);  // Set the task names
        })
        .catch(error => console.error('Error fetching task summary:', error));
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <ul className="space-y-4">
          <li>
            <Link to="/tasks" className="flex items-center text-blue-600 hover:underline">
              <FaTasks className="text-blue-600 mr-2" />
              Tasks
            </Link>
          </li>
          <li>
            <Link to="/timesheet" className="flex items-center text-blue-600 hover:underline">
              <FaClipboardList className="text-blue-600 mr-2" />
              Timesheet
            </Link>
          </li>
          <li>
            <Link to="/clockin" className="flex items-center text-blue-600 hover:underline">
              <FaRegClock className="text-blue-600 mr-2" />
              Clock In
            </Link>
          </li>
          <li>
            <Link to="/leave" className="flex items-center text-blue-600 hover:underline">
              <FaUser className="text-blue-600 mr-2" />
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

      <div className="flex flex-col flex-grow">
        {/* Navbar */}
        <nav className="navbar flex justify-between items-center px-6 py-4 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">Employee Tracking System</h1>
          <div className="flex items-center">
            <span className="mr-4">{username.toUpperCase()}</span>
            <FaUser className="text-white mr-2" />
            <Link to="/profile" className="text-white hover:text-yellow-300">Profile</Link>
            <Link to="/settings" className="text-white hover:text-yellow-300 ml-4">Settings</Link>
          </div>
        </nav>

        {/* Welcome message */}
        <h1 className="text-3xl font-bold px-6 py-4 text-left text-gray-600">Welcome, {username.toUpperCase()}</h1>

        {/* Main content in flexbox */}
        <main className="flex-grow p-8 flex flex-col justify-center items-center">
          <div className="flex flex-wrap justify-center gap-8 w-full max-w-7xl">
            {/* Clock-in Status */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6 w-64">
              <h2 className="text-2xl font-bold text-gray-800">Clock-in Status</h2>
              <p className="mt-4 text-xl text-gray-700">
                {clockInStatus || 'Loading...'}
              </p>
            </div>

            {/* Today's Tasks */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6 w-64">
              <h2 className="text-2xl font-bold text-gray-800">Today's Tasks</h2>
              {taskSummary.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {taskSummary.map((taskName, index) => (
                    <li key={index} className="text-lg text-gray-700">{taskName}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-lg text-gray-700">No tasks assigned for today.</p>
              )}
            </div>

            {/* Hours Worked Today */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6 w-64">
              <h2 className="text-2xl font-bold text-gray-800">Hours Worked Today</h2>
              <p className="mt-4 text-xl text-gray-700">{hoursWorked} hours</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white p-4 text-center w-full">
          <p>&copy; 2024 All rights reserved.</p>
          <p>
            <a href="/terms" className="text-gray-400 hover:text-gray-200">Terms of Service</a> |
            <a href="/privacy" className="text-gray-400 hover:text-gray-200">Privacy Policy</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
