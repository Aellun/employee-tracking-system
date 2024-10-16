import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { FaUser, FaCog, FaUserFriends, FaProjectDiagram, FaChartLine, FaTasks, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register necessary components for Chart.js
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
    totalClockIns: 0,  // New statistic
    totalBreaksTaken: 0,  // New statistic
    totalLeaveRequests: 0,  // New statistic
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

  // Fetch data from backend
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/statistics/', {
          headers: {
            'Authorization': `Bearer ${token}`, // Ensure the token is passed here
          },
        });
        console.log('Statistics:', response.data);
        // Update state with fetched statistics
        setStatistics(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [token]);

  // Chart data for leave balance
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
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#FF7043'],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white text-left p-4 flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Admin Employee Management System</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaUser className="text-orange-400" />
            <span>{user?.name || "Admin"}</span>
          </div>
          <Link to="/settings" className="flex items-center space-x-2 hover:text-orange-400 transition-colors duration-200">
            <FaCog />
            <span>Settings</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
          <ul className="space-y-4">
            <li>
              <Link to="/admin/employees" className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition">
                <FaUserFriends className="mr-2 text-blue-600" /> Employees
              </Link>
            </li>
            <li>
              <Link to="/admin/projects" className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition">
                <FaProjectDiagram className="mr-2 text-blue-600" /> Manage Projects
              </Link>
            </li>
            <li>
              <Link to="/admin/reports" className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition">
                <FaChartLine className="mr-2 text-blue-600" /> Reports
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-tasks" className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition">
                <FaTasks className="mr-2 text-blue-600" /> Manage Tasks
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-leaves" className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Manage Leaves
              </Link>
            </li>
            <li>
              <Link to="/clockin" className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition">
                <FaClock className="mr-2 text-blue-600" /> Clock In
              </Link>
            </li>
          </ul>
          <div className="p-4 border-t border-gray-700 mt-4">
            {token && (
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 container mx-auto space-y-8">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>
            <p className="text-lg">
              Here you can manage employees, projects, reports, tasks, and leaves. Use the navigation on the left to access different sections.
            </p>

            {/* Numerical Data */}
            <div className="grid grid-cols-3 gap-6 mt-6">
              <div className="bg-gray-100 p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold">Total Employees</h3>
                <p className="text-3xl">{statistics.totalEmployees}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold">Total Projects</h3>
                <p className="text-3xl">{statistics.totalProjects}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold">Total Tasks</h3>
                <p className="text-3xl">{statistics.totalTasks}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold">Total Clock-ins</h3>
                <p className="text-3xl">{statistics.totalClockIns}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold">Total Breaks Taken</h3>
                <p className="text-3xl">{statistics.totalBreaksTaken}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold">Total Leave Requests</h3>
                <p className="text-3xl">{statistics.totalLeaveRequests}</p>
              </div>
            </div>
          </section>

          {/* Graphical Data */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Leave Balance Overview</h2>
            <Bar data={leaveBalanceData} />
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        <p>
          <a href="/terms" className="text-gray-400 hover:text-gray-200">Terms of Service</a> | 
          <a href="/privacy" className="text-gray-400 hover:text-gray-200"> Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
};

export default AdminHomePage;
