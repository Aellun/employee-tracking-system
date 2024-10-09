import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clockInRecord, clockOutRecord, takeBreakRecord } from '../api';

// Helper to fetch auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper to calculate total hours worked
const calculateTotalHours = (clockInTime, clockOutTime) => {
  const startTime = new Date(clockInTime);
  const endTime = new Date(clockOutTime);
  return Math.floor((endTime - startTime) / (1000 * 60 * 60));
};

// Helper to calculate extra hours beyond 8
const calculateExtraHours = (totalHours) => {
  const overtimeThreshold = 8;
  return totalHours > overtimeThreshold ? totalHours - overtimeThreshold : 0;
};

const ClockInSeconds = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recordId, setRecordId] = useState(null);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [breakType, setBreakType] = useState('');
  const [breakNotes, setBreakNotes] = useState('');
  const [clockInMessage, setClockInMessage] = useState('');

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Clock in functionality
  const handleClockIn = useCallback(async () => {
    // Check if the user is already clocked in
    if (isClockedIn) {
      toast.error('You are already clocked in. Please clock out before clocking in again.');
      return; // Prevent further execution if already clocked in
    }
  
    const authToken = getAuthToken();
    // const email = localStorage.getItem('email');
  
    if (!authToken) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }
  
    try {
      const response = await clockInRecord(authToken);
      if (response && response.message === 'Clocked in successfully') {
        setRecordId(response.record_id);
        setIsClockedIn(true);
        setClockInTime(new Date().toISOString());
        const clockInTime = new Date().toLocaleTimeString();
        setClockInMessage(` clocked in at ${clockInTime}`);
        toast.success(`Clocked In Successfully at ${clockInTime}`);
      } else {
        toast.error('Error clocking in. Please try again.');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error clocking in. Please try again.');
    }
  }, [isClockedIn]); // Add isClockedIn as a dependency
  

  // Clock out functionality
  const handleClockOut = useCallback(async () => {
    const authToken = getAuthToken();
    if (!isClockedIn) {
      toast.error('You are not currently clocked in.');
      return;
    }

    try {
      await clockOutRecord(authToken, recordId);
      setIsClockedIn(false);
      setClockOutTime(new Date().toISOString());
      toast.success(`Clocked Out Successfully at ${new Date().toLocaleTimeString()}`);
    } catch {
      toast.error('Error clocking out. Please try again.');
    }
  }, [isClockedIn, recordId]);

  // Take a break functionality
  const handleTakeBreak = useCallback(async () => {
    const authToken = getAuthToken();
    if (!isClockedIn || !breakType || !breakNotes) {
      toast.error('Please fill in all required fields for the break.');
      return;
    }

    try {
      await takeBreakRecord(authToken, recordId, breakType, breakNotes);
      setBreakType('');
      setBreakNotes('');
      toast.success('Break Taken Successfully');
    } catch {
      toast.error('Error taking break. Please try again.');
    }
  }, [isClockedIn, recordId, breakType, breakNotes]);

  const totalHours = isClockedIn
    ? calculateTotalHours(clockInTime, new Date().toISOString())
    : calculateTotalHours(clockInTime, clockOutTime);
    
  const extraHours = calculateExtraHours(totalHours);

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
      {/* Display the clock-in message at the top */}
      {clockInMessage && (
        <div className="bg-green-100 text-green-800 p-2 rounded mb-4">
          {clockInMessage}
        </div>
      )}

      <h3 className="text-xl font-bold text-center">Clock In</h3>
      <div className="text-center mt-4">
        <p className="text-lg">{currentTime.toLocaleTimeString()}</p>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handleClockIn}
          className="bg-blue-500 text-white py-2 px-4 rounded"
          disabled={isClockedIn || !getAuthToken()} // Disable if already clocked in
        >
          Clock In
        </button>
      </div>

      <JobSection isClockedIn={isClockedIn} />

      <BreakSelection
        breakType={breakType}
        setBreakType={setBreakType}
        breakNotes={breakNotes}
        setBreakNotes={setBreakNotes}
      />

      <div className="mt-6 flex justify-between">
        <button
          onClick={handleTakeBreak}
          className="bg-purple-500 text-white py-2 px-4 rounded mt-2"
          disabled={!isClockedIn || !breakType || !breakNotes}
        >
          Take Break
        </button>
        <button
          onClick={handleClockOut}
          className="bg-red-500 text-white py-2 px-4 rounded"
          disabled={!isClockedIn}
        >
          Clock Out
        </button>
      </div>

      <TimeTracking totalHours={totalHours.toFixed(2)} extraHours={extraHours.toFixed(2)} />

      <ToastContainer />
    </div>
  );
};

// Job Section component
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

// Break Selection component
const BreakSelection = ({ breakType, setBreakType, breakNotes, setBreakNotes }) => (
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
      placeholder="Add notes before break"
      className="border border-gray-300 rounded p-2 w-full mt-2"
    />
  </div>
);

// Time Tracking component
const TimeTracking = ({ totalHours, extraHours }) => (
  <div className="mt-6">
    <p>Total Time: <span className="font-bold">{totalHours} hrs</span></p>
    <p>Extra Hours: <span className="font-bold">{extraHours} hrs</span></p>
  </div>
);

export default ClockInSeconds;
