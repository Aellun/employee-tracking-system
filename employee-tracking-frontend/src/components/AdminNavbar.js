import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/admin/employees">Employees</Link></li>
        <li><Link to="/admin/projects">Projects</Link></li>
        <li><Link to="/admin/reports">Reports</Link></li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
