import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import axios from 'axios';
import { 
  FaTasks, FaRegClock, FaUser, FaSignOutAlt, FaClipboardList, 
  FaChartLine, FaBriefcase, FaCog, FaBell, FaSearch, 
  FaCalendarAlt, FaBuilding, FaIdCard 
} from 'react-icons/fa';
import '../css/HomePage.css';

const HomePage = () => {
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();

  const [clockInStatus, setClockInStatus] = useState({ clockedIn: false, time: null });
  const [tasks, setTasks] = useState([]);
  const [hoursWorked, setHoursWorked] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState({ annual: 0, sick: 0, casual: 0, maternity: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      
      // Fetch all dashboard data
      const fetchDashboardData = async () => {
        try {
          // Fetch clock-in status
          const clockInResponse = await axios.get('http://localhost:8000/api/clockin-status/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setClockInStatus({
            clockedIn: clockInResponse.data.clockedIn,
            time: clockInResponse.data.time_clocked_in
          });

          // Fetch hours worked
          const hoursResponse = await axios.get('http://localhost:8000/api/timesheet/today/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHoursWorked(hoursResponse.data.hoursWorked);

          // Fetch tasks
          const tasksResponse = await axios.get('http://localhost:8000/api/tasks/today', { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          setTasks(tasksResponse.data);

          // Fetch leave balance
          const leaveResponse = await axios.get('http://localhost:8000/api/leave-balance/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLeaveBalance(leaveResponse.data);

          // Fetch department and role
          if (user && user.id) {
            const employeeResponse = await axios.get(`http://localhost:8000/api/employees/?user=${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (employeeResponse.data.length > 0) {
              const employeeData = employeeResponse.data[0];
              setUserDepartment(employeeData.department);
              setUserRole(employeeData.role);
            }
          }

          // Fetch notifications (if endpoint exists)
          /*
          const notificationsResponse = await axios.get('http://localhost:8000/api/notifications/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(notificationsResponse.data);
          */
          
          // Fetch upcoming events (if endpoint exists)
          /*
          const eventsResponse = await axios.get('http://localhost:8000/api/events/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUpcomingEvents(eventsResponse.data);
          */

        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [token, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClockIn = async () => {
    try {
      await axios.post('http://localhost:8000/api/clock-in/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update UI immediately
      setClockInStatus({
        clockedIn: true,
        time: new Date().toISOString()
      });
      
      // Refresh hours worked
      const hoursResponse = await axios.get('http://localhost:8000/api/timesheet/today/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHoursWorked(hoursResponse.data.hoursWorked);
    } catch (error) {
      console.error('Error clocking in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await axios.post('http://localhost:8000/api/clock-out/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update UI immediately
      setClockInStatus({
        clockedIn: false,
        time: null
      });
      
      // Refresh hours worked
      const hoursResponse = await axios.get('http://localhost:8000/api/timesheet/today/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHoursWorked(hoursResponse.data.hoursWorked);
    } catch (error) {
      console.error('Error clocking out:', error);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, read: true} : notif
    ));
  };

  // Format task status for display
  const formatTaskStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'waiting_for_approval': 'Pending Approval'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="homepage-dashboard">
      {/* Top Navigation Bar */}
      <header className="homepage-header">
        <div className="homepage-header-left">
          <div className="homepage-logo">
            <FaBuilding className="homepage-logo-icon" />
            <h1>EmplyTech</h1>
          </div>
          
          <div className="homepage-search-bar">
            <FaSearch className="homepage-search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="homepage-search-input"
            />
          </div>
        </div>
        
        <div className="homepage-header-right">
          <div className="homepage-notification-bell">
            <FaBell className="homepage-notification-icon" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="homepage-notification-badge">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
            <div className="homepage-notification-dropdown">
              <h3>Notifications</h3>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`homepage-notification-item ${notif.read ? 'homepage-read' : 'homepage-unread'}`}
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    <div className="homepage-notification-content">
                      <p>{notif.message}</p>
                      <span>{notif.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="homepage-no-notifications">No notifications</p>
              )}
            </div>
          </div>
          
          <div className="homepage-user-profile">
            <div className="homepage-avatar">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="homepage-user-info">
              <span className="homepage-username">
                {user?.first_name || 'User'} {user?.last_name || 'Name'}
              </span>
              <span className="homepage-user-role">
                {userRole?.title || 'Role'} | {userDepartment?.name || 'Department'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="homepage-main">
        {/* Sidebar */}
        <aside className="homepage-sidebar">
          <div className="homepage-sidebar-user">
            <div className="homepage-sidebar-avatar">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div>
              <h3>{user?.first_name || 'User'} {user?.last_name || 'Name'}</h3>
              <p>
                <FaIdCard className="homepage-icon" /> 
                {userRole?.title || 'Role'} | {userDepartment?.name || 'Department'}
              </p>
            </div>
          </div>
          
          <nav className="homepage-sidebar-nav">
            <ul>
              <li>
                <Link to="/dashboard" className="homepage-nav-link homepage-active">
                  <FaChartLine className="homepage-icon" /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="homepage-nav-link">
                  <FaTasks className="homepage-icon" /> Tasks
                </Link>
              </li>
              <li>
                <Link to="/timesheet" className="homepage-nav-link">
                  <FaClipboardList className="homepage-icon" /> Timesheet
                </Link>
              </li>
              <li>
                <Link to="/projects" className="homepage-nav-link">
                  <FaBriefcase className="homepage-icon" /> Projects
                </Link>
              </li>
              <li>
                <Link to="/profile" className="homepage-nav-link">
                  <FaUser className="homepage-icon" /> Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="homepage-nav-link">
                  <FaCog className="homepage-icon" /> Settings
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="homepage-sidebar-footer">
            <button onClick={handleLogout} className="homepage-logout-btn">
              <FaSignOutAlt className="homepage-icon" /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="homepage-content">
          <div className="homepage-content-header">
            <h2>Dashboard</h2>
            <div className="homepage-date-display">
              <FaCalendarAlt className="homepage-icon" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="homepage-loading-container">
              <div className="homepage-spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <div className="homepage-dashboard-grid">
              {/* Clock-in Status Card */}
              <div className="homepage-dashboard-card homepage-card-clock">
                <div className="homepage-card-header">
                  <FaRegClock className="homepage-icon" />
                  <h3>Clock-in Status</h3>
                </div>
                <div className="homepage-card-body">
                  {clockInStatus.clockedIn ? (
                    <div className="homepage-clock-status">
                      <div className="homepage-status-indicator homepage-active">Currently Clocked In</div>
                      <p>Clocked in at: {formatTime(clockInStatus.time)}</p>
                      <button onClick={handleClockOut} className="homepage-clock-btn homepage-clock-out">
                        Clock Out
                      </button>
                    </div>
                  ) : (
                    <div className="homepage-clock-status">
                      <div className="homepage-status-indicator homepage-inactive">Not Clocked In</div>
                      <p>Ready to start your workday</p>
                      <button onClick={handleClockIn} className="homepage-clock-btn homepage-clock-in">
                        Clock In
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Hours Worked Card */}
              <div className="homepage-dashboard-card homepage-card-hours">
                <div className="homepage-card-header">
                  <FaRegClock className="homepage-icon" />
                  <h3>Hours Worked</h3>
                </div>
                <div className="homepage-card-body">
                  <div className="homepage-hours-display">
                    <span className="homepage-hours-value">{hoursWorked}</span>
                    <span className="homepage-hours-label">hours today</span>
                  </div>
                  <div className="homepage-progress-container">
                    <div 
                      className="homepage-progress-bar" 
                      style={{ width: `${Math.min(hoursWorked / 8 * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p>Target: 8 hours per day</p>
                </div>
              </div>

              {/* Tasks Card */}
              <div className="homepage-dashboard-card homepage-card-tasks">
                <div className="homepage-card-header">
                  <FaTasks className="homepage-icon" />
                  <h3>Today's Tasks</h3>
                  <Link to="/tasks" className="homepage-view-all">View All</Link>
                </div>
                <div className="homepage-card-body">
                  {tasks.length > 0 ? (
                    <ul className="homepage-task-list">
                      {tasks.slice(0, 4).map(task => (
                        <li key={task.id} className="homepage-task-item">
                          <div className="homepage-task-info">
                            <span className="homepage-task-name">{task.name}</span>
                            <span className="homepage-task-project">{task.project?.name || 'General'}</span>
                          </div>
                          <div className={`homepage-task-status homepage-${task.status}`}>
                            {formatTaskStatus(task.status)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No tasks assigned for today</p>
                  )}
                </div>
              </div>

              {/* Leave Balance Card */}
              <div className="homepage-dashboard-card homepage-card-leave">
                <div className="homepage-card-header">
                  <FaUser className="homepage-icon" />
                  <h3>Leave Balance</h3>
                </div>
                <div className="homepage-card-body">
                  <div className="homepage-leave-balance">
                    <div className="homepage-leave-type">
                      <span>Annual</span>
                      <div className="homepage-leave-amount">{leaveBalance.annual} days</div>
                    </div>
                    <div className="homepage-leave-type">
                      <span>Sick</span>
                      <div className="homepage-leave-amount">{leaveBalance.sick} days</div>
                    </div>
                    <div className="homepage-leave-type">
                      <span>Casual</span>
                      <div className="homepage-leave-amount">{leaveBalance.casual} days</div>
                    </div>
                  </div>
                  <Link to="/leave" className="homepage-request-leave-btn">Request Leave</Link>
                </div>
              </div>

              {/* Department Info Card */}
              {userDepartment && (
                <div className="homepage-dashboard-card homepage-card-department">
                  <div className="homepage-card-header">
                    <FaBuilding className="homepage-icon" />
                    <h3>Department Info</h3>
                  </div>
                  <div className="homepage-card-body">
                    <div className="homepage-department-info">
                      <h4>{userDepartment.name}</h4>
                      <p>Manager: {userDepartment.manager || 'Department Manager'}</p>
                      <div className="homepage-department-stats">
                        <div className="homepage-stat">
                          <span>Team Size</span>
                          <strong>{userDepartment.employee_count || 'N/A'}</strong>
                        </div>
                        <div className="homepage-stat">
                          <span>Active Projects</span>
                          <strong>{userDepartment.active_projects || 'N/A'}</strong>
                        </div>
                      </div>
                    </div>
                    <Link to="/department" className="homepage-view-team">View Team Members</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="homepage-footer">
        <p>&copy; 2024 EmplyTech System. All rights reserved.</p>
        <div className="homepage-footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/help">Help Center</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;