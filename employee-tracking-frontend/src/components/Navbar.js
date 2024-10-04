import React from 'react';
import { Link } from 'react-router-dom';
import '../css/HomePage.css'; // Import the CSS file for styling

const HomePage = () => {
  return (
    <div className="home-page">
      <nav className="navbar">
        <ul>
          <li><Link to="/tasks">Tasks</Link></li>
          <li><Link to="/track">Time Tracker</Link></li>
          <li><Link to="/timesheet">Timesheet</Link></li>
          <li><Link to="/clockin">Clock In</Link></li>
        </ul>
      </nav>

      <div className="content">
        <h1>Welcome</h1>
        <p>We are glad to have you here! Use the navigation above to access your tasks, track your time, and clock in for your work.</p>
        {/* Add any additional information or links you want to show on the home page */}
      </div>
    </div>
  );
};

export default HomePage;
