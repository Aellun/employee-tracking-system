import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TimesheetPage = () => {
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/timeentries/')
      .then(response => setTimeEntries(response.data))
      .catch(error => console.error('Error fetching time entries:', error));
  }, []);

  return (
    <div>
      <h1>Timesheet</h1>
      <ul>
        {timeEntries.map(entry => (
          <li key={entry.id}>
            Task: {entry.task.name}, Duration: {entry.start_time} - {entry.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimesheetPage;
