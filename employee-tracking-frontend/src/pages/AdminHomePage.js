import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { 
  FaUser, FaSignOutAlt, FaCog, FaUserFriends, FaCheckCircle, 
  FaProjectDiagram, FaChartLine, FaTasks, FaCalendarAlt, FaClock,
  FaBell, FaEnvelope, FaSearch, FaPlus, FaChartBar, FaIdCard,
  FaMoneyBillWave, FaUserClock, FaCalendarCheck, FaUsers
} from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { FaExclamationCircle } from 'react-icons/fa';

import '../css/AdminHomePage.css';

// Register the Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
const AdminHomePage = () => {
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const baseUrl = 'http://localhost:8000/admin-dashboard/api/';
        
        // Fetch all dashboard data in parallel
        const [statsRes, chartsRes, activitiesRes, notificationsRes] = await Promise.all([
          api.get('/admin-dashboard/api/statistics/', { headers }),
          api.get('/admin-dashboard/api/charts/', { headers }),
          api.get('/admin-dashboard/api/activity/', { headers }),
          api.get('/admin-dashboard/api/notifications/', { headers })
        ]);

        setStats(statsRes.data);
        setCharts(chartsRes.data);
        setActivities(activitiesRes.data);
        setNotifications(notificationsRes.data.map(n => ({
          ...n,
          read: n.status !== 'pending',
          time: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, read: true} : notif
    ));
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'addEmployee':
        navigate('/admin/employees/add');
        break;
      case 'createProject':
        navigate('/admin/projects/create');
        break;
      case 'assignTask':
        navigate('/admin/manage-tasks/assign');
        break;
      case 'approveLeave':
        navigate('/admin/manage-leaves');
        break;
      default:
        break;
    }
  };

  // Format chart data using backend responses
  const formatChartData = () => {
    if (!charts) return {};
    
    // Leave Balance Chart
    const leaveBalanceData = {
      labels: ['Annual', 'Sick', 'Casual', 'Maternity'],
      datasets: [{
        label: 'Leave Balance (Days)',
        data: [
          charts.leave_balances.total_annual,
          charts.leave_balances.total_sick,
          charts.leave_balances.total_casual,
          charts.leave_balances.total_maternity
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
      }]
    };
    
    // Project Status Chart
    const projectStatusData = {
      labels: charts.project_status.map(item => item.status),
      datasets: [{
        data: charts.project_status.map(item => item.count),
        backgroundColor: ['#6366F1', '#3B82F6', '#10B981', '#F59E0B'],
        borderWidth: 0,
      }]
    };
    
    // Employee Distribution Chart
    const employeeDistributionData = {
      labels: charts.employee_distribution.map(item => item.department__name || 'Unassigned'),
      datasets: [{
        label: 'Employees by Department',
        data: charts.employee_distribution.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
      }]
    };
    
    return { leaveBalanceData, projectStatusData, employeeDistributionData };
  };

  // Format activity items
  const formatActivityItem = (activity) => {
    const timestamp = new Date(activity.timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - timestamp) / (1000 * 60 * 60));
    
    let timeText;
    if (diffHours < 1) {
      timeText = 'Just now';
    } else if (diffHours < 24) {
      timeText = `${diffHours} hours ago`;
    } else if (diffHours < 48) {
      timeText = 'Yesterday';
    } else {
      timeText = `${Math.floor(diffHours / 24)} days ago`;
    }
    
    return {
      ...activity,
      time: timeText,
      user: activity.user || 'System'
    };
  };

  const { leaveBalanceData, projectStatusData, employeeDistributionData } = formatChartData();

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <FaExclamationCircle className="error-icon" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Top Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <FaUserFriends className="logo-icon" />
            <span>EMS Admin</span>
          </div>
          
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search employees, projects, tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-icons">
            <div className="icon-wrapper notification-icon">
              <FaBell />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
              )}
            </div>
            <div className="icon-wrapper">
              <FaEnvelope />
            </div>
            <Link to="/settings" className="icon-wrapper">
              <FaCog />
            </Link>
          </div>
          
          <div className="user-profile">
            <div className="avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Admin User'}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <nav className="dashboard-sidebar">
          <ul className="sidebar-menu">
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <Link to="#">
                <FaChartBar className="menu-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/employees">
                <FaUserFriends className="menu-icon" />
                <span>Employees</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/projects">
                <FaProjectDiagram className="menu-icon" />
                <span>Projects</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/reportspage">
                <FaChartLine className="menu-icon" />
                <span>Reports</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-tasks">
                <FaTasks className="menu-icon" />
                <span>Tasks</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-leaves">
                <FaCalendarAlt className="menu-icon" />
                <span>Leaves</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/manage-clockin">
                <FaCheckCircle className="menu-icon" />
                <span>Clock-ins</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/payroll">
                <FaMoneyBillWave className="menu-icon" />
                <span>Payroll</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/attendance">
                <FaUserClock className="menu-icon" />
                <span>Attendance</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/events">
                <FaCalendarCheck className="menu-icon" />
                <span>Events</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/departments">
                <FaUsers className="menu-icon" />
                <span>Departments</span>
              </Link>
            </li>
            <li className="logout-link" onClick={handleLogout}>
              <FaSignOutAlt className="menu-icon" />
              <span>Logout</span>
            </li>
          </ul>
          
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <button onClick={() => handleQuickAction('addEmployee')} className="quick-action-btn">
              <FaPlus className="action-icon" /> Add Employee
            </button>
            <button onClick={() => handleQuickAction('createProject')} className="quick-action-btn">
              <FaPlus className="action-icon" /> Create Project
            </button>
            <button onClick={() => handleQuickAction('assignTask')} className="quick-action-btn">
              <FaPlus className="action-icon" /> Assign Task
            </button>
            <button onClick={() => handleQuickAction('approveLeave')} className="quick-action-btn">
              <FaPlus className="action-icon" /> Approve Leave
            </button>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="dashboard-content">
          <div className="content-header">
            <h1>Admin Dashboard</h1>
            <div className="breadcrumb">Dashboard / Overview</div>
          </div>
          
          {/* Statistics Cards */}
          {stats && (
            <div className="statistics-grid">
              <div className="stat-card">
                <div className="stat-icon employees">
                  <FaUserFriends />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_employees}</div>
                  <div className="stat-label">Employees</div>
                </div>
                <div className="stat-trend">+5% this month</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon projects">
                  <FaProjectDiagram />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_projects}</div>
                  <div className="stat-label">Projects</div>
                </div>
                <div className="stat-trend">+3 new projects</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon tasks">
                  <FaTasks />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_tasks}</div>
                  <div className="stat-label">Tasks</div>
                </div>
                <div className="stat-trend">72% completed</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon clockins">
                  <FaClock />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_clockins_today}</div>
                  <div className="stat-label">Clock-ins Today</div>
                </div>
                <div className="stat-trend">92% attendance</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon leaves">
                  <FaCalendarAlt />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.pending_leave_requests}</div>
                  <div className="stat-label">Leave Requests</div>
                </div>
                <div className="stat-trend">+8 pending</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon approvals">
                  <FaCheckCircle />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.pending_approvals}</div>
                  <div className="stat-label">Pending Approvals</div>
                </div>
                <div className="stat-trend">+3 new requests</div>
              </div>
            </div>
          )}
          
          {/* Charts Section */}
          {charts && (
            <div className="charts-section">
              <div className="chart-container">
                <h2>Leave Balance Overview</h2>
                <div className="chart-wrapper">
                  {leaveBalanceData && (
                    <Bar 
                      data={leaveBalanceData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Available Leave Days',
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
              
              <div className="chart-container">
                <h2>Project Status</h2>
                <div className="chart-wrapper">
                  {projectStatusData && (
                    <Pie 
                      data={projectStatusData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
              
              <div className="chart-container">
                <h2>Employee Distribution</h2>
                <div className="chart-wrapper">
                  {employeeDistributionData && (
                    <Bar 
                      data={employeeDistributionData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'By Department',
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Recent Activity and Notifications */}
          <div className="activity-section">
            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {activities.slice(0, 10).map(activity => {
                  const formattedActivity = formatActivityItem(activity);
                  return (
                    <div key={activity.timestamp} className="activity-item">
                      <div className="activity-avatar">
                        <FaIdCard />
                      </div>
                      <div className="activity-details">
                        <div className="activity-text">
                          <span className="activity-user">{formattedActivity.user}</span> {formattedActivity.action}
                        </div>
                        <div className="activity-time">{formattedActivity.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="notifications">
              <div className="notifications-header">
                <h2>Notifications</h2>
                <span className="unread-count">
                  {notifications.filter(n => !n.read).length} unread
                </span>
              </div>
              <div className="notification-list">
                {notifications.slice(0, 10).map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      <FaBell />
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                    {!notification.read && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} Employee Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminHomePage;