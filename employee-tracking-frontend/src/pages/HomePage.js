import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import '../css/HomePage.css';
import axios from 'axios';

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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="navbar flex justify-between items-center px-6 py-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Employee Tracking System</h1>
        <ul className="flex space-x-6">
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
    </div>
  );
};

export default HomePage;
