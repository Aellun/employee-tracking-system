import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import axios from 'axios';
import { FaTasks, FaRegClock, FaUser, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import '../css/HomePage.css';

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
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1>EmplyTech System</h1>
        <div className="navbar-right">
          <span>{username.toUpperCase()}</span>
          <FaUser className="icon" />
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>Navigation</h2>
          <ul>
            <li>
              <Link to="/tasks" className="sidebar-link">
                <FaTasks className="icon" /> Tasks
              </Link>
            </li>
            <li>
              <Link to="/timesheet" className="sidebar-link">
                <FaClipboardList className="icon" /> Timesheet
              </Link>
            </li>
            <li>
              <Link to="/clockin" className="sidebar-link">
                <FaRegClock className="icon" /> Clock In
              </Link>
            </li>
            <li>
              <Link to="/leave" className="sidebar-link">
                <FaUser className="icon" /> Leave
              </Link>
            </li>
            </ul>
              <Link to="/" onClick={handleLogout} className="sidebar-link">
              <FaSignOutAlt className="icon" /> Logout
              </Link>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <h1>Welcome, {username.toUpperCase()}</h1>
          <div className="card-grid">
            <div className="card card-status">
              <FaRegClock className="icon" />
              <h2>Clock-in Status</h2>
              <p>{clockInStatus || 'Loading...'}</p>
            </div>

            <div className="card card-tasks">
              <FaTasks className="icon" />
              <h2>Today's Tasks</h2>
              {taskSummary.length > 0 ? (
                <ul>
                  {taskSummary.map((taskName, index) => (
                    <li key={index}>{taskName}</li>
                  ))}
                </ul>
              ) : (
                <p>No tasks assigned for today.</p>
              )}
            </div>

            <div className="card card-hours">
              <FaUser className="icon" />
              <h2>Hours Worked Today</h2>
              <p>{hoursWorked} hours</p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 All rights reserved.</p>
        <p>
          <Link to="/terms" className="footer-link">Terms of Service</Link> |
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
