import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/tasks">Tasks</Link></li>
        <li><Link to="/track">Time Tracker</Link></li>
        <li><Link to="/timesheet">Timesheet</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
