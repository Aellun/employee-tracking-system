import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsPage = () => {
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/admin_dashboard/time-entries/')
      .then(response => setTimeEntries(response.data))
      .catch(error => console.error('Error fetching time entries:', error));
  }, []);

  return (
    <div>
      <h1>Reports</h1>
      <ul>
        {timeEntries.map(entry => (
          <li key={entry.id}>
            {entry.employee.first_name} worked on {entry.project.name} from {entry.start_time} to {entry.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsPage;
