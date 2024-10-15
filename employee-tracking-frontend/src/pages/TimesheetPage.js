import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // Adjust the path if necessary
import '../css/TimesheetPage.css'; // Import custom CSS for styling

const TimesheetPage = () => {
  const [timeEntries, setTimeEntries] = useState([]); // Array for time entries
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedDates, setExpandedDates] = useState({}); // Track expanded/minimized states
  const [error, setError] = useState(null); // Error handling state

  useEffect(() => {
    if (token) {
      fetchTimeEntries();
    }
  }, [token, selectedDate]); // Fetch when token or date changes

  const fetchTimeEntries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate || undefined },
      });
      setTimeEntries(response.data || []); // Set state to the response data (array)
    } catch (error) {
      setError('Failed to fetch time entries. Please try again later.'); // User-friendly error message
    }
  };

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTimeEntries();
  };

  const toggleExpand = (date) => {
    setExpandedDates((prevState) => ({
      ...prevState,
      [date]: !prevState[date], // Toggle expanded state for the date
    }));
  };

  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? null : date; // Return null if invalid date
  };

  const groupByDate = (records) => {
    if (!Array.isArray(records)) return {};
    return records.reduce((groups, record) => {
      const date = parseDate(record.time_clocked_in)?.toLocaleDateString() || 'Invalid Date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
      return groups;
    }, {});
  };

  const groupedEntries = groupByDate(timeEntries);

  return (
    <div className="timesheet-container">
      <h1 className="page-title">Timesheet</h1>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}
      
      <div className="filter-container">
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker"
          />
          <button type="submit" className="filter-button">Filter</button>
        </form>
      </div>

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="no-entries">No entries available for the selected date.</div>
      ) : (
        Object.keys(groupedEntries).map((date) => (
          <div key={date} className="date-section">
            <h3 onClick={() => toggleExpand(date)} className="date-header">
              {date} {expandedDates[date] ? '▲' : '▼'}
            </h3>

            {expandedDates[date] && (
              <table className="entry-table">
                <thead>
                  <tr>
                    <th>Time In - Out</th>
                    <th>Duration</th>
                    <th>Break Type</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEntries[date].map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr>
                        <td>
                          {parseDate(entry.time_clocked_in)?.toLocaleTimeString() || 'Invalid Time'} -{' '}
                          {entry.time_clocked_out ? parseDate(entry.time_clocked_out)?.toLocaleTimeString() : 'N/A'}
                        </td>
                        <td>{formatDuration(entry.time_clocked_in, entry.time_clocked_out)}</td>
                        <td>{entry.breaks.length > 0 ? entry.breaks[0].break_type : 'N/A'}</td>
                        <td>{entry.notes || 'N/A'}</td>
                      </tr>

                      {entry.breaks && entry.breaks.map((breakEntry) => (
                      <tr key={breakEntry.id} className="break-row">
                        <td>
                          &nbsp;&nbsp;
                          {parseDate(breakEntry.time_started)?.toLocaleTimeString() || 'Invalid Time'} -{' '}
                          {breakEntry.time_ended ? parseDate(breakEntry.time_ended)?.toLocaleTimeString() : 'Ongoing'}
                        </td>
                        <td>{formatDuration(breakEntry.time_started, breakEntry.time_ended)}</td>
                        <td>{breakEntry.break_type || 'N/A'}</td>
                        <td>Break</td>
                      </tr>
                    ))}

                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const formatDuration = (start, end) => {
  if (!end || end === 'N/A') return 'Ongoing';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate)) return 'Invalid Duration';

  const diff = (endDate - startDate) / (1000 * 60); // Difference in minutes
  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60);

  return hours > 0 ? `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m` : `${minutes}m`;
};

export default TimesheetPage;
