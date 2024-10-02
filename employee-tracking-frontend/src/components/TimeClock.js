import React, { useState, useEffect } from 'react';
import Modal from './modal'; // Assuming we've created the Modal component in a separate file
import './css/TimeClock.css'; // Ensure to add your styles

const TimeClock = () => {
  const [isClockedIn, setIsClockedIn] = useState(null);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [dayCount, setDayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [notes, setNotes] = useState('');
  const [isNotesValid, setIsNotesValid] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakEndTime, setBreakEndTime] = useState(null);
  const [remainingBreakTime, setRemainingBreakTime] = useState(0);
  const [breakIntervalId, setBreakIntervalId] = useState(null);

  const jobs = ['Assets Movement', 'Crating/Packaging', 'Coordination'];

  const formatTime = (ms) => {
    const hours = String(Math.floor(ms / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((ms % (1000 * 60)) / 1000)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleClockIn = (job) => {
    const now = new Date();
    setIsClockedIn(now.toLocaleTimeString());
    setStartTime(now);

    const interval = setInterval(() => {
      const current = new Date();
      const diffMs = current - now;
      setCurrentTime(formatTime(diffMs));
    }, 1000);

    setIntervalId(interval);
  };

  const handleClockOut = () => {
    if (!isNotesValid) return;

    clearInterval(intervalId);
    setIsClockedIn(null);
    setStartTime(null);
    setCurrentTime('00:00:00');
    setNotes('');
    setIsNotesValid(false);
    setDayCount((prevDayCount) => {
      const newDayCount = prevDayCount + 1;
      if (newDayCount % 7 === 0) {
        setWeekCount((prevWeekCount) => prevWeekCount + 1);
      }
      return newDayCount;
    });
  };

  const handleTakeBreak = () => {
    if (!isNotesValid || isOnBreak) return;
    setIsBreakModalOpen(true);
  };

  const handleBreakSelection = (duration) => {
    const now = new Date();
    setIsOnBreak(true);
    setBreakEndTime(new Date(now.getTime() + duration * 60000));
    setRemainingBreakTime(duration * 60000);
    setIsBreakModalOpen(false);

    // Stop the main timer
    clearInterval(intervalId);

    const breakInterval = setInterval(() => {
      const timeLeft = breakEndTime - new Date();
      if (timeLeft <= 0) {
        clearInterval(breakInterval);
        resumeClock();
      } else {
        setRemainingBreakTime(timeLeft);
      }
    }, 1000);

    setBreakIntervalId(breakInterval);
  };

  const resumeClock = () => {
    setIsOnBreak(false);
    const now = new Date();
    const remainingTime = breakEndTime - now;

    const interval = setInterval(() => {
      const current = new Date();
      const diffMs = current - (startTime.getTime() + remainingTime);
      setCurrentTime(formatTime(diffMs));
    }, 1000);

    setIntervalId(interval);
  };

  const handleEndBreak = () => {
    clearInterval(breakIntervalId);
    setIsOnBreak(false);
    setRemainingBreakTime(0);
    resumeClock();
  };

  const handleNotesChange = (e) => {
    const notesValue = e.target.value;
    setNotes(notesValue);
    setIsNotesValid(notesValue.trim() !== '');
  };

  useEffect(() => {
    // Check if the user is still clocked in when the component mounts
    const savedClockedInStatus = localStorage.getItem('isClockedIn');
    if (savedClockedInStatus) {
      setIsClockedIn(savedClockedInStatus);
    }
    
    // Cleanup function to clear intervals
    return () => {
      clearInterval(intervalId);
      clearInterval(breakIntervalId);
    };
  }, [intervalId, breakIntervalId]);

  useEffect(() => {
    // Save clocked in status in localStorage
    if (isClockedIn) {
      localStorage.setItem('isClockedIn', isClockedIn);
    } else {
      localStorage.removeItem('isClockedIn');
    }
  }, [isClockedIn]);

  return (
    <div className="time-clock">
      <div className="title" style={{ backgroundColor: 'green', color: 'white', padding: '10px' }}>
        Time Clock
      </div>

      {isClockedIn && (
        <div className="clocked-in-info">
          <p>@user clocked in at {isClockedIn}</p>
          <div className="totals">
            <div className="current-time">Current: <span>{currentTime}</span></div>
            <div className="day-count">Day: <span>{dayCount}</span></div>
            <div className="week-count">Week: <span>{weekCount}</span></div>
          </div>
        </div>
      )}

      <div className="jobs">
        <h3>Jobs</h3>
        <input type="text" placeholder="Search jobs" />
        <ul>
          {jobs.map((job, index) => (
            <li key={index}>
              <div className="job-item">
                <span>{job}</span>
                {!isClockedIn && <button onClick={() => handleClockIn(job)}>Clock In</button>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="notes">
        <h3>Notes</h3>
        <input
          type="text"
          placeholder="Enter notes"
          value={notes}
          onChange={handleNotesChange}
        />
      </div>

      {isClockedIn && (
        <div className="actions">
          <button disabled={!isNotesValid || isOnBreak} onClick={handleTakeBreak}>Take Break</button>
          <button disabled={!isNotesValid} onClick={handleClockOut}>Clock Out</button>
        </div>
      )}

      {isBreakModalOpen && (
        <Modal
          isOpen={isBreakModalOpen}
          onClose={() => setIsBreakModalOpen(false)}
          title="Select Break Duration"
          content={
            <div className="break-selection">
              <h4>Break Type</h4>
              <div>
                <strong>Lunch Break</strong><br />
                <span>45 minutes Unpaid</span><br />
                <button onClick={() => handleBreakSelection(45)}>Select</button>
              </div>
              <div>
                <strong>Tea Break</strong><br />
                <span>15 minutes</span><br />
                <button onClick={() => handleBreakSelection(15)}>Select</button>
              </div>
              <div>
                <strong>Cool-off Break</strong><br />
                <span>10 minutes</span><br />
                <button onClick={() => handleBreakSelection(10)}>Select</button>
              </div>
            </div>
          }
        />
      )}

      {isOnBreak && (
        <div className="on-break-message">
          <p>You are on a break. Time remaining: {formatTime(remainingBreakTime)}</p>
          <button onClick={handleEndBreak}>End Break</button>
        </div>
      )}
    </div>
  );
};

export default TimeClock;
