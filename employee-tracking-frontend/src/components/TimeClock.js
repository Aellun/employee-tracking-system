import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clockInRecord, clockOutRecord, takeBreakRecord } from '../api';

// Helper functions
const getAuthToken = () => localStorage.getItem('authToken');
const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

// ClockInSeconds Component
const ClockInSeconds = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [breakActive, setBreakActive] = useState(false);
  const [breakType, setBreakType] = useState('');
  const [breakNotes, setBreakNotes] = useState('');
  const [breakDuration, setBreakDuration] = useState(0);
  const [breakExceeded, setBreakExceeded] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [workingSeconds, setWorkingSeconds] = useState(0); // Track working seconds
  const [clockInMessage, setClockInMessage] = useState(''); // Track clock-in message

  // Update working seconds every second when clocked in and no break is active
  useEffect(() => {
    if (isClockedIn && !breakActive) {
      const interval = setInterval(() => {
        setWorkingSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isClockedIn, breakActive]);

  useEffect(() => {
    if (breakActive) {
      setBreakExceeded(false);
      const interval = setInterval(() => setBreakDuration((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [breakActive]);

  // Clock in handler
  const handleClockIn = useCallback(async () => {
    const authToken = getAuthToken();
    if (isClockedIn || !authToken) {
      toast.error('Already clocked in or authentication failed.');
      return;
    }

    try {
      const response = await clockInRecord(authToken);
      if (response?.message === 'Clocked in successfully') {
        setRecordId(response.record_id);
        setIsClockedIn(true);
        setClockInTime(new Date());
        setWorkingSeconds(0); // Reset total working time on new clock-in
        setClockInMessage(`Clocked in at ${new Date().toLocaleTimeString()}`);
        toast.success(`Clocked in at ${new Date().toLocaleTimeString()}`);
      } else {
        toast.error('Clock-in failed.');
      }
    } catch {
      toast.error('Error clocking in. Please try again.');
    }
  }, [isClockedIn]);

  // Clock out handler
  const handleClockOut = useCallback(async () => {
    const authToken = getAuthToken();
    if (!isClockedIn || !authToken) {
      toast.error('You are not clocked in or authentication failed.');
      return;
    }

    if (!breakNotes) {
      toast.error('Please add notes before clocking out.');
      return;
    }

    try {
      await clockOutRecord(authToken, recordId);
      setIsClockedIn(false);
      setClockOutTime(new Date());
      setTotalHours(workingSeconds); // Finalize total hours
      setClockInMessage(''); // Clear the message after clock-out
      toast.success(`Clocked out at ${new Date().toLocaleTimeString()}`);
    } catch {
      toast.error('Error clocking out. Please try again.');
    }
  }, [isClockedIn, recordId, workingSeconds, breakNotes]);

  // Break handling
  const handleTakeBreak = useCallback(async () => {
    const authToken = getAuthToken();
    if (!isClockedIn || !breakType || !breakNotes || !authToken) {
      toast.error('Please fill in all required fields for the break.');
      return;
    }

    try {
      await takeBreakRecord(authToken, recordId, breakType, breakNotes);
      setBreakActive(true);
      toast.success('Break started.');
    } catch {
      toast.error('Error taking break.');
    }
  }, [isClockedIn, recordId, breakType, breakNotes]);

  const handleEndBreak = () => {
    if (breakExceeded) toast.warn('Break exceeded!');
    setBreakActive(false);
    setBreakDuration(0);
    setBreakExceeded(false);
    setClockInMessage(''); // Clear the message after ending break
    toast.success('Break ended.');
  };

  // UI Elements
  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
      {/* Clock-in status and message */}
      <h3 className="text-xl font-bold text-center">Clock In</h3>
      <div className="text-center mt-4">
        <p className="text-lg">{new Date().toLocaleTimeString()}</p>
      </div>
      {clockInMessage && <p className="text-center text-sm text-green-600">{clockInMessage}</p>}

      {/* Clock in/out buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handleClockIn}
          className="bg-blue-500 text-white py-2 px-4 rounded"
          disabled={isClockedIn}
        >
          Clock In
        </button>
        <button
          onClick={handleClockOut}
          className="bg-red-500 text-white py-2 px-4 rounded"
          disabled={!isClockedIn || breakActive}
        >
          Clock Out
        </button>
      </div>

      {/* Job management */}
      <JobSection isClockedIn={isClockedIn} />

      {/* Break management */}
      <BreakSelection
        breakType={breakType}
        setBreakType={setBreakType}
        breakNotes={breakNotes}
        setBreakNotes={setBreakNotes}
        handleTakeBreak={handleTakeBreak}
        breakActive={breakActive}
      />

      {/* Active break indicator and end break button */}
      {breakActive && (
        <div className="mt-4">
          <p>Current Break: {breakType === 'tea' ? 'Tea Break' : 'Lunch Break'}</p>
          <button
            onClick={handleEndBreak}
            className="bg-green-500 text-white py-2 px-4 rounded mt-2"
          >
            End Break
          </button>
        </div>
      )}

      {/* Time tracking */}
      <TimeTracking totalHours={workingSeconds} breakDuration={breakDuration} />

      <ToastContainer />
    </div>
  );
};

// Job Section Component
const JobSection = ({ isClockedIn }) => {
  const [jobName, setJobName] = useState('');

  return (
    <div className="mt-4">
      <h4 className="font-bold text-lg">Manage Jobs</h4>
      <input
        type="text"
        value={jobName}
        onChange={(e) => setJobName(e.target.value)}
        placeholder="Job Name"
        className="border rounded p-2 w-full"
      />
      <div className="mt-2 flex justify-between">
        <button
          className="bg-green-500 text-white py-2 px-4 rounded"
          disabled={!isClockedIn}
        >
          Clock In Job
        </button>
        <button
          className="bg-orange-500 text-white py-2 px-4 rounded"
          disabled={!isClockedIn}
        >
          Clock Out Job
        </button>
      </div>
    </div>
  );
};

// Break Selection Component
const BreakSelection = ({ breakType, setBreakType, breakNotes, setBreakNotes, handleTakeBreak, breakActive }) => (
  <div className="mt-6">
    <select
      value={breakType}
      onChange={(e) => setBreakType(e.target.value)}
      className="border border-gray-300 rounded p-2 w-full"
    >
      <option value="">Select Break Type</option>
      <option value="tea">Tea Break</option>
      <option value="lunch">Lunch Break</option>
    </select>
    <textarea
      value={breakNotes}
      onChange={(e) => setBreakNotes(e.target.value)}
      placeholder="Break Notes"
      className="border rounded p-2 w-full mt-2"
    />
    <button
      onClick={handleTakeBreak}
      className="bg-purple-500 text-white py-2 px-4 rounded mt-2"
      disabled={breakActive}
    >
      Take Break
    </button>
  </div>
);

// Time Tracking Component
const TimeTracking = ({ totalHours, breakDuration }) => (
  <div className="mt-4">
    <h4 className="font-bold text-lg">Time Tracking</h4>
    <p>Total Working Hours: {formatTime(totalHours)}</p>
    <p>Current Break Duration: {formatTime(breakDuration)}</p>
  </div>
);

export default ClockInSeconds;
