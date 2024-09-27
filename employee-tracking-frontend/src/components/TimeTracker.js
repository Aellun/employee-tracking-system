import React, { useState, useEffect } from 'react';
import moment from 'moment';

const TimeTracker = ({ task, onStartTracking }) => {
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setCurrentTime(moment());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const startTask = () => {
    setStartTime(moment());
    onStartTracking(task);
  };

  return (
    <div>
      {task ? (
        <div>
          <h3>Tracking: {task.name}</h3>
          <p>Started at: {startTime ? startTime.format('HH:mm:ss') : 'N/A'}</p>
          <p>Elapsed: {startTime ? moment.utc(currentTime.diff(startTime)).format('HH:mm:ss') : 'N/A'}</p>
        </div>
      ) : (
        <p>No task selected for tracking.</p>
      )}
      <button onClick={startTask}>Start Tracking</button>
    </div>
  );
};

export default TimeTracker;
