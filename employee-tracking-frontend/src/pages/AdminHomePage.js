import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { FaUser, FaCog, FaUserFriends,FaCheckCircle, FaProjectDiagram, FaChartLine, FaTasks, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'; // Import necessary Chart.js components
import '../css/AdminHomePage.css'; // Import the custom CSS

// Register the Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminHomePage = () => {
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalProjects: 0,
    totalTasks: 0,
    totalClockIns: 0,
    totalLeaveRequests: 0,
    leaveBalances: {
      annual: 0,
      sick: 0,
      casual: 0,
      maternity: 0,
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:8000/admin-dashboard/api/statistics/admin/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setStatistics(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [token]);

  const leaveBalanceData = {
    labels: ['Annual', 'Sick', 'Casual', 'Maternity'],
    datasets: [
      {
        label: 'Leave Balance (Days)',
        data: [
          statistics.leaveBalances.annual,
          statistics.leaveBalances.sick,
          statistics.leaveBalances.casual,
          statistics.leaveBalances.maternity,
        ],
        backgroundColor: ['#0D6EFD', '#198754', '#FFC107', '#AB2E3C'],
      },
    ],
  };

  return (
    <div className="container">
      {/* Navbar */}
      <header className="navbar">
        <h1>Employee Management System</h1>
        <div className="user-info">
          <FaUser />
          <span>{user?.name || 'Admin'}</span>
          <Link to="/settings">
            <FaCog />
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>Admin Panel</h2>
          <ul>
            <li>
              <Link to="/admin/employees">
                <FaUserFriends /> Manage Employees
              </Link>
            </li>
            <li>
              <Link to="/admin/projects">
                <FaProjectDiagram /> Manage Projects
              </Link>
            </li>
            <li>
            <Link to="/admin/reportspage">
                <FaChartLine /> Reports
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-tasks">
                <FaTasks /> Manage Tasks
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-leaves">
                <FaCalendarAlt /> Manage Leaves
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-clockin">
                <FaCheckCircle /> Manage Clockin
              </Link>
            </li>

            <li>
              <Link to="/clockin">
                <FaClock /> Clock In
              </Link>
            </li>
            
          </ul>
          <button onClick={handleLogout}>Logout</button>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <section className="section">
            <h2>Welcome to the Admin Dashboard</h2>
            <div className="grid grid-3">
              <div className="card">
                <FaUserFriends className="icon" />
                <div className="value">{statistics.totalEmployees}</div>
                <div className="label">Total Employees</div>
              </div>
              <div className="card">
                <FaProjectDiagram className="icon" />
                <div className="value">{statistics.totalProjects}</div>
                <div className="label">Total Projects</div>
              </div>
              <div className="card">
                <FaTasks className="icon" />
                <div className="value">{statistics.totalTasks}</div>
                <div className="label">Total Tasks</div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>Leave Balance Overview</h2>
            <Bar data={leaveBalanceData} />
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        &copy; {new Date().getFullYear()} Admin Employee Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminHomePage;
