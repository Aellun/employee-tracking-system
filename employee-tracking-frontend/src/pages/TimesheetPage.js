// src/pages/TimesheetPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { 
  FaCalendarAlt, 
  FaChevronDown, 
  FaChevronUp, 
  FaClock, 
  FaExclamationCircle,
  FaPlus,
  FaFilter,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaChartBar,
  FaRegClock
} from 'react-icons/fa';
import '../css/TimesheetPage.css';

const TimesheetPage = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const { token, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timesheet');
  const [newEntry, setNewEntry] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    breakType: '',
    breakStart: '',
    breakEnd: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalHours: 0,
    avgHours: 0,
    daysWorked: 0
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [breakdownView, setBreakdownView] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTimeEntries();
      calculateStats();
    }
  }, [token, selectedDate]);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate || undefined },
      });
      setTimeEntries(response.data || []);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch time entries. Please try again later.');
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // In a real app, this would come from the backend
    const totalHours = timeEntries.reduce((sum, entry) => {
      const start = new Date(entry.time_clocked_in);
      const end = entry.time_clocked_out ? new Date(entry.time_clocked_out) : new Date();
      const duration = (end - start) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);
    
    const daysWorked = [...new Set(timeEntries.map(entry => 
      new Date(entry.time_clocked_in).toDateString()
    ))].length;
    
    setStats({
      totalHours: totalHours.toFixed(1),
      avgHours: (totalHours / (daysWorked || 1)).toFixed(1),
      daysWorked
    });
  };

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTimeEntries();
  };
  
  const clearFilter = () => {
    setSelectedDate('');
    fetchTimeEntries();
  };

  const toggleExpand = (date) => {
    setExpandedDates((prevState) => ({
      ...prevState,
      [date]: !prevState[date],
    }));
  };

  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? null : date;
  };

  const groupByDate = (records) => {
    return records.reduce((groups, record) => {
      const date = parseDate(record.time_clocked_in)?.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) || 'Invalid Date';
      
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
      return groups;
    }, {});
  };

  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    try {
      // In a real app, this would send to the backend
      alert('New entry would be submitted in a real application');
      setShowForm(false);
      setNewEntry({
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
        breakType: '',
        breakStart: '',
        breakEnd: ''
      });
    } catch (error) {
      setError('Failed to create new entry');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
  };

  const handleSaveEdit = () => {
    // In a real app, this would update the entry in the backend
    alert('Changes would be saved in a real application');
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      // In a real app, this would delete the entry
      setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const groupedEntries = groupByDate(timeEntries);

  return (
    <div className="timesheet-page">
      {/* Navigation */}
      <nav className="timesheet-nav">
        <div className="nav-container">
          <div className="logo">TimeTracker<span className="logo-highlight">Pro</span></div>
          <div className="nav-links">
            <button 
              className={activeTab === 'timesheet' ? 'active' : ''}
              onClick={() => setActiveTab('timesheet')}
            >
              Timesheet
            </button>
            <button 
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'Employee'}</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="timesheet-container">
        <div className="timesheet-header">
          <h1>
            <FaRegClock className="header-icon" />
            Timesheet Management
          </h1>
          <p>Track and manage your working hours and breaks</p>
        </div>

        {activeTab === 'timesheet' ? (
          <>
            {/* Stats Overview */}
            <div className="stats-overview">
              <div className="stat-card">
                <div className="stat-value">{stats.totalHours}h</div>
                <div className="stat-label">Total Hours</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgHours}h</div>
                <div className="stat-label">Avg. Daily</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.daysWorked}</div>
                <div className="stat-label">Days Worked</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">12</div>
                <div className="stat-label">Pending Approval</div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="controls-section">
              <div className="filter-controls">
                <form onSubmit={handleFilterSubmit} className="filter-form">
                  <div className="form-group">
                    <label htmlFor="dateFilter">
                      <FaCalendarAlt className="icon" /> Filter by Date:
                    </label>
                    <input
                      type="date"
                      id="dateFilter"
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <button type="submit" className="btn filter-btn">
                    <FaFilter className="icon" /> Apply Filter
                  </button>
                  <button 
                    type="button" 
                    className="btn clear-btn"
                    onClick={clearFilter}
                  >
                    Clear Filter
                  </button>
                </form>
              </div>
              <div className="action-controls">
                <button 
                  className="btn add-entry-btn"
                  onClick={() => setShowForm(!showForm)}
                >
                  <FaPlus className="icon" /> 
                  {showForm ? 'Cancel' : 'Add New Entry'}
                </button>
              </div>
            </div>

            {/* New Entry Form */}
            {showForm && (
              <div className="new-entry-form">
                <h3>Add New Timesheet Entry</h3>
                <form onSubmit={handleSubmitEntry}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={newEntry.date}
                        onChange={handleNewEntryChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={newEntry.startTime}
                        onChange={handleNewEntryChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={newEntry.endTime}
                        onChange={handleNewEntryChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Break Type</label>
                      <select
                        name="breakType"
                        value={newEntry.breakType}
                        onChange={handleNewEntryChange}
                      >
                        <option value="">Select Break Type</option>
                        <option value="lunch">Lunch Break</option>
                        <option value="short">Short Break</option>
                        <option value="meeting">Meeting Break</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Break Start</label>
                      <input
                        type="time"
                        name="breakStart"
                        value={newEntry.breakStart}
                        onChange={handleNewEntryChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Break End</label>
                      <input
                        type="time"
                        name="breakEnd"
                        value={newEntry.breakEnd}
                        onChange={handleNewEntryChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={newEntry.notes}
                      onChange={handleNewEntryChange}
                      placeholder="Add any notes about this entry..."
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn submit-btn">
                      <FaCheck className="icon" /> Submit Entry
                    </button>
                    <button 
                      type="button" 
                      className="btn cancel-btn"
                      onClick={() => setShowForm(false)}
                    >
                      <FaTimes className="icon" /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Timesheet Entries */}
            <div className="timesheet-entries">
              {error && (
                <div className="error-message">
                  <FaExclamationCircle className="icon" />
                  <span>{error}</span>
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading timesheet data...</p>
                </div>
              ) : Object.keys(groupedEntries).length === 0 ? (
                <div className="no-entries">
                  <div className="no-entries-icon">
                    <FaRegClock />
                  </div>
                  <h3>No timesheet entries found</h3>
                  <p>Start by adding a new entry using the "Add New Entry" button</p>
                </div>
              ) : (
                Object.keys(groupedEntries).map((date) => (
                  <div key={date} className="timesheet-day-group">
                    <div
                      className="day-header"
                      onClick={() => toggleExpand(date)}
                    >
                      <div className="date-info">
                        <h3>{date}</h3>
                        <div className="day-total">
                          <FaClock className="icon" />
                          {calculateDayTotal(groupedEntries[date])} hours
                        </div>
                      </div>
                      <div className="expand-icon">
                        {expandedDates[date] ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>

                    {expandedDates[date] && (
                      <div className="day-entries">
                        <div className="entries-header">
                          <div>Time In - Out</div>
                          <div>Duration</div>
                          <div>Break Type</div>
                          <div>Notes</div>
                          <div>Actions</div>
                        </div>
                        
                        {groupedEntries[date].map((entry) => (
                          <React.Fragment key={entry.id}>
                            <div className="entry-row">
                              <div className="time-range">
                                <span className="time">
                                  {parseDate(entry.time_clocked_in)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Invalid Time'}
                                </span>
                                <span className="separator">to</span>
                                <span className="time">
                                  {entry.time_clocked_out ? 
                                    parseDate(entry.time_clocked_out)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                    <span className="ongoing">Ongoing</span>}
                                </span>
                              </div>
                              <div className="duration">
                                {formatDuration(entry.time_clocked_in, entry.time_clocked_out)}
                              </div>
                              <div className="break-type">
                                {entry.breaks.length > 0 ? (
                                  <span className={`break-tag ${entry.breaks[0].break_type}`}>
                                    {entry.breaks[0].break_type}
                                  </span>
                                ) : 'N/A'}
                              </div>
                              <div className="notes">
                                {entry.notes || '—'}
                              </div>
                              <div className="actions">
                                <button 
                                  className="action-btn edit-btn"
                                  onClick={() => handleEditEntry(entry)}
                                >
                                  <FaEdit />
                                </button>
                                <button 
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>

                            {entry.breaks && entry.breaks.map((breakEntry, index) => (
                              <div key={breakEntry.id} className="break-row">
                                <div className="time-range">
                                  <span className="break-icon">↳</span>
                                  <span className="time">
                                    {parseDate(breakEntry.time_started)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Invalid Time'}
                                  </span>
                                  <span className="separator">to</span>
                                  <span className="time">
                                    {breakEntry.time_ended ? 
                                      parseDate(breakEntry.time_ended)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                      <span className="ongoing">Ongoing</span>}
                                  </span>
                                </div>
                                <div className="duration">
                                  {formatDuration(breakEntry.time_started, breakEntry.time_ended)}
                                </div>
                                <div className="break-type">
                                  <span className={`break-tag ${breakEntry.break_type}`}>
                                    {breakEntry.break_type}
                                  </span>
                                </div>
                                <div className="notes">Break</div>
                                <div className="actions">
                                  <button className="action-btn edit-btn">
                                    <FaEdit />
                                  </button>
                                  <button className="action-btn delete-btn">
                                    <FaTrash />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="analytics-tab">
            <h2>
              <FaChartBar className="icon" /> Timesheet Analytics
            </h2>
            
            <div className="analytics-controls">
              <div className="time-selector">
                <select>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Month</option>
                  <option>Custom Range</option>
                </select>
              </div>
              
              <div className="view-toggle">
                <button 
                  className={!breakdownView ? 'active' : ''}
                  onClick={() => setBreakdownView(false)}
                >
                  Summary
                </button>
                <button 
                  className={breakdownView ? 'active' : ''}
                  onClick={() => setBreakdownView(true)}
                >
                  Breakdown
                </button>
              </div>
            </div>
            
            <div className="analytics-content">
              <div className="analytics-chart">
                <div className="chart-placeholder">
                  <div className="chart-bar" style={{ height: '80%' }}>
                    <div className="bar-label">Mon</div>
                  </div>
                  <div className="chart-bar" style={{ height: '65%' }}>
                    <div className="bar-label">Tue</div>
                  </div>
                  <div className="chart-bar" style={{ height: '90%' }}>
                    <div className="bar-label">Wed</div>
                  </div>
                  <div className="chart-bar" style={{ height: '50%' }}>
                    <div className="bar-label">Thu</div>
                  </div>
                  <div className="chart-bar" style={{ height: '75%' }}>
                    <div className="bar-label">Fri</div>
                  </div>
                  <div className="chart-bar" style={{ height: '20%' }}>
                    <div className="bar-label">Sat</div>
                  </div>
                  <div className="chart-bar" style={{ height: '10%' }}>
                    <div className="bar-label">Sun</div>
                  </div>
                </div>
                <div className="chart-title">Weekly Hours Distribution</div>
              </div>
              
              <div className="analytics-summary">
                <div className="summary-card">
                  <h3>Productivity Insights</h3>
                  <ul>
                    <li>
                      <span className="metric">Highest Productivity:</span>
                      <span className="value">Wednesday (8.2h)</span>
                    </li>
                    <li>
                      <span className="metric">Average Daily Hours:</span>
                      <span className="value">{stats.avgHours}h</span>
                    </li>
                    <li>
                      <span className="metric">Overtime This Month:</span>
                      <span className="value">12.5h</span>
                    </li>
                    <li>
                      <span className="metric">Breaks Per Day:</span>
                      <span className="value">2.3</span>
                    </li>
                  </ul>
                </div>
                
                <div className="summary-card">
                  <h3>Recent Activity</h3>
                  <ul>
                    <li>Submitted 5 timesheets this week</li>
                    <li>2 entries pending approval</li>
                    <li>Average start time: 8:45 AM</li>
                    <li>Average end time: 5:30 PM</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="timesheet-footer">
        <div className="footer-content">
          <div className="footer-logo">TimeTracker<span className="logo-highlight">Pro</span></div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="copyright">
            © 2023 TimeTrackerPro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper function to calculate day total
const calculateDayTotal = (entries) => {
  return entries.reduce((total, entry) => {
    const start = new Date(entry.time_clocked_in);
    const end = entry.time_clocked_out ? new Date(entry.time_clocked_out) : new Date();
    const duration = (end - start) / (1000 * 60 * 60);
    return total + duration;
  }, 0).toFixed(1);
};

// Helper function to format duration
const formatDuration = (start, end) => {
  if (!end) return 'Ongoing';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate)) return 'Invalid';
  
  const diff = (endDate - startDate) / (1000 * 60);
  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default TimesheetPage;