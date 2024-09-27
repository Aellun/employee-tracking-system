import React, { useState, useEffect } from 'react';
import TimeTracker from '../components/TimeTracker';

const TimeTrackerPage = () => {
  const [task, setTask] = useState(null);

  const startTracking = (selectedTask) => {
    setTask(selectedTask);
    // Additional logic to send start time to API
  };

  return (
    <div>
      <h1>Time Tracker</h1>
      <TimeTracker task={task} onStartTracking={startTracking} />
    </div>
  );
};

export default TimeTrackerPage;
