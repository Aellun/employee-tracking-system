import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // Adjust the path if necessary
import '../css/TimesheetPage.css'; // Import custom CSS

const TimesheetPage = () => {
  const [timeEntries, setTimeEntries] = useState([]); // Change to array
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedDates, setExpandedDates] = useState({}); // Track expanded/minimized states
  const [error, setError] = useState(null); // Error handling state

  useEffect(() => {
    if (token) {
      fetchTimeEntries();
    }
  }, [token, selectedDate]); // Fetch on token change and selected date change

  const fetchTimeEntries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate || undefined },
      });

      console.log('API Response:', response.data); // Log the API response to check structure
      setTimeEntries(response.data || []); // Set state to the response data (array)

      // Log the state right after setting it
      console.log('State updated to:', response.data);
      
    } catch (error) {
      console.error('Error fetching time entries:', error);
      setError('Failed to fetch time entries. Please try again later.'); // Set user-friendly error
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTimeEntries();
  };

  const toggleExpand = (date) => {
    setExpandedDates((prevState) => ({
      ...prevState,
      [date]: !prevState[date], // Toggle the expand/minimize state for the date
    }));
  };

  // Helper function to parse date safely
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? null : date; // Return null if the date is invalid
  };

  // Group clock-in records by date
  const groupByDate = (records) => {
    if (!Array.isArray(records)) {
      console.error('Expected an array for grouping, but received:', records);
      return {};
    }
    return records.reduce((groups, record) => {
      const date = parseDate(record.time_clocked_in)?.toLocaleDateString() || 'Invalid Date';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      return groups;
    }, {});
  };

  // Grouped entries by date
  const groupedEntries = groupByDate(timeEntries);

  return (
    <div className="container">
      <h1>Timesheet</h1>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}
      <div className="filter-container">
        <form onSubmit={handleFilterSubmit}>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded p-2 mr-2"
          />
          <button type="submit" className="button">Filter</button>
        </form>
      </div>

      {/* Display grouped time entries by date */}
      {Object.keys(groupedEntries).length === 0 ? (
        <div>No entries available for the selected date.</div>
      ) : (
        Object.keys(groupedEntries).map((date) => (
          <div key={date} className="date-section">
            <h3 onClick={() => toggleExpand(date)} className="date-header">
              {date} {expandedDates[date] ? '▲' : '▼'}
            </h3>

            {/* Expand/Collapse time entries for each date */}
            {expandedDates[date] && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Time in - out</th>
                    <th>Duration</th>
                    <th>Break Type</th> {/* Updated from Job to Break Type */}
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
                        <td>{entry.breaks.length > 0 ? entry.breaks[0].break_type : 'N/A'}</td> {/* Display break type */}
                        <td>{entry.notes || 'N/A'}</td>
                      </tr>

                      {/* Display breaks under the associated clock-in record */}
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

// Function to calculate the duration between clock-in and clock-out or breaks
const formatDuration = (start, end) => {
  if (!end || end === 'N/A') return 'Ongoing'; // Handle ongoing cases
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) return 'Invalid Duration'; // Handle invalid dates

  const diff = (endDate - startDate) / (1000 * 60); // Difference in minutes

  // Return 0 if the total duration is less than 1 minute
  if (diff < 1) {
    return '0';
  }

  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60); // Round down minutes

  // Format duration
  if (hours > 0) {
    return `${hours}h ${minutes < 10 ? '0' : ''}${minutes}`; // Format as "hh:mm"
  } else {
    return `${minutes}m`; // Return only minutes if less than an hour
  }
};

export default TimesheetPage;
