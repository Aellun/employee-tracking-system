import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // Adjust the path if necessary
import '../css/TimesheetPage.css'; // Import custom CSS

const TimesheetPage = () => {
  const [timeEntries, setTimeEntries] = useState({ clockInRecords: [], breakRecords: [] });
  const { token } = useAuth(); // Get the token from AuthProvider
  const [selectedDate, setSelectedDate] = useState('');
  
  useEffect(() => {
    if (token) { // Ensure token is available before making the request
      fetchTimeEntries(); // Fetch all entries on mount
    }
  }, [token]); // No dependency on selectedDate here

  const fetchTimeEntries = async () => {
    try {
      console.log("Fetching entries for date:", selectedDate); // Log the selected date
      const response = await axios.get('http://127.0.0.1:8000/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate || undefined }, // Pass selected date if available
      });
      setTimeEntries(response.data);
      console.log("Received data:", response.data); // Log the received data
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTimeEntries(); // Fetch data again on submit to apply the filter
  };

  // Function to format total hours correctly
  const formatTotalHours = (hours) => {
    if (typeof hours !== 'number' || isNaN(hours)) return '0.000 hours'; // Handle non-numeric cases
    return hours.toFixed(3) + ' hours'; // Format to three decimal places
  };

  // Calculate total hours worked
  const totalHoursWorked = timeEntries.clockInRecords.reduce((total, entry) => {
    return total + (Number(entry.hours_worked) || 0); // Ensure hours_worked is treated as a number
  }, 0);

  return (
    <div className="container">
      <h1>Timesheet</h1>
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
      <h2>Clock In Records</h2>
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Time Clocked In</th>
            <th>Time Clocked Out</th>
            <th>Duration</th>
            <th>Extra Hours</th> {/* Added Extra Hours column */}
          </tr>
        </thead>
        <tbody>
          {timeEntries.clockInRecords.map(entry => (
            <tr key={entry.id}>
              <td>{entry.user.username}</td>
              <td>{new Date(entry.time_clocked_in).toLocaleString()}</td>
              <td>{entry.time_clocked_out ? new Date(entry.time_clocked_out).toLocaleString() : 'N/A'}</td>
              <td>{entry.hours_worked} hours</td>
              <td>{entry.extra_hours} hours</td> {/* Display Extra Hours */}
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Total Hours Worked: {formatTotalHours(totalHoursWorked)}</h2> {/* Pass total hours to formatTotalHours */}
      <h2>Break Records</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Break Type</th>
            <th>Time Started</th>
            <th>Time Ended</th>
          </tr>
        </thead>
        <tbody>
          {timeEntries.breakRecords.map(entry => (
            <tr key={entry.id}>
              <td>{entry.break_type}</td>
              <td>{new Date(entry.time_started).toLocaleString()}</td>
              <td>{new Date(entry.time_ended).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimesheetPage;
