import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><Link to="/admin/users">Manage Users</Link></li>
          <li><Link to="/admin/projects">Manage Projects</Link></li>
          <li><Link to="/admin/tasks">Manage Tasks</Link></li>
          <li><Link to="/admin/leaves">Manage Leave Requests</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminDashboard;
