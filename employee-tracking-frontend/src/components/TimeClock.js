import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clockInRecord, clockOutRecord, takeBreakRecord, checkActiveClockIn } from '../api';

// Helper functions
const getAuthToken = () => localStorage.getItem('authToken');
const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);
const convertSecondsToHMM = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// TimeClock component
const ClockInSeconds = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [breakActive, setBreakActive] = useState(false);
  const [breakType, setBreakType] = useState('');
  const [breakNotes, setBreakNotes] = useState('');
  const [breakDuration, setBreakDuration] = useState(0);
  const [breakExceeded, setBreakExceeded] = useState(false);
  const [workingSeconds, setWorkingSeconds] = useState(0); // Track working seconds
  const [clockInMessage, setClockInMessage] = useState(''); // Track clock-in message
  const [totalWorkedSeconds, setTotalWorkedSeconds] = useState(0); // Track total worked seconds

  // Helper to check if the date is valid
  const isValidDate = (date) => !isNaN(date.getTime());

  // Persist clock-in state on refresh
  useEffect(() => {
    const savedClockInTime = localStorage.getItem('clockInTime');
    const savedRecordId = localStorage.getItem('recordId');
    const savedBreakActive = localStorage.getItem('breakActive') === 'true'; // Retrieve break state

    if (savedClockInTime) {
      const parsedTime = new Date(savedClockInTime);
      setClockInTime(parsedTime);
      setRecordId(savedRecordId);
      setIsClockedIn(true);

        // Calculate the working time since the saved clock-in time
      const elapsedSeconds = Math.floor((Date.now() - parsedTime.getTime()) / 1000);
      setWorkingSeconds(elapsedSeconds);
      setTotalWorkedSeconds(elapsedSeconds); // Set total worked seconds
      setClockInMessage(`Clocked in at ${parsedTime.toLocaleTimeString()}`);
    }

    if (savedBreakActive) {
      setBreakActive(true);
    }
  }, []);

  // Save clock-in state to localStorage
  useEffect(() => {
    if (isClockedIn && clockInTime) {
      localStorage.setItem('clockInTime', clockInTime.toISOString());
      localStorage.setItem('recordId', recordId);
    } else {
      localStorage.removeItem('clockInTime');
      localStorage.removeItem('recordId');
    }
    // Save total worked seconds to localStorage
    localStorage.setItem('totalWorkedSeconds', totalWorkedSeconds.toString()); // Store as string
    // Save break state to localStorage
    localStorage.setItem('breakActive', breakActive.toString()); // Store as string
  }, [isClockedIn, clockInTime, recordId, breakActive, totalWorkedSeconds]);

  // Update working seconds every second when clocked in and no break is active
  useEffect(() => {
    let interval = null;
    if (isClockedIn && !breakActive) {
      interval = setInterval(() => {
        setWorkingSeconds((prev) => prev + 1);
        setTotalWorkedSeconds((prev) => prev + 1); // Update total worked seconds
      }, 1000);
    }
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [isClockedIn, breakActive]);

  // Break timer
  useEffect(() => {
    let breakInterval = null;
    if (breakActive) {
      breakInterval = setInterval(() => {
        setBreakDuration((prev) => prev + 1);
        // Check if break has exceeded its allowed time
        if ((breakType === 'tea' && breakDuration >= 15 * 60) || 
            (breakType === 'lunch' && breakDuration >= 45 * 60)) {
          setBreakExceeded(true);
        }
      }, 1000);
    }
    return () => clearInterval(breakInterval); // Clean up interval on break end
  }, [breakActive, breakDuration, breakType]);
// Check active clock-in status on component mount
// Check active clock-in status on component mount
// Inside useEffect to check active clock-in status
useEffect(() => {
  const fetchActiveClockIn = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const response = await checkActiveClockIn(authToken);
      if (response.active) {
        const clockInTime = response.time_clocked_in; // Use the correct property name
        const activeRecordId = response.record_id; // Get the active record ID
        if (clockInTime) { // Check if clock_in_time is defined
          const parsedTime = new Date(clockInTime);
          if (!isNaN(parsedTime.getTime())) { // Validate clock-in time
            setIsClockedIn(true);
            setClockInTime(parsedTime);
            setRecordId(activeRecordId); // Set record ID
            localStorage.setItem('recordId', activeRecordId); // Store in localStorage
            // Calculate total worked seconds based on clockInTime
            const elapsedSeconds = Math.floor((Date.now() - parsedTime.getTime()) / 1000);
            setWorkingSeconds(elapsedSeconds); // Continue the timer from last clock-in
            setTotalWorkedSeconds(elapsedSeconds); // Set total worked seconds
            setClockInMessage(`Clocked in at ${parsedTime.toLocaleTimeString()}`);
          } else {
            console.error("Invalid clock_in_time format from API:", clockInTime);
          }
        } else {
          console.error("Clock-in time is undefined.");
        }
      }
    } catch (error) {
      toast.error('Error checking active clock-in.');
    }
  };

  fetchActiveClockIn();
}, []); // Run this once when the component mounts

// Save clock-in state to localStorage
useEffect(() => {
  if (isClockedIn && clockInTime) {
    localStorage.setItem('clockInTime', clockInTime.toISOString());
    localStorage.setItem('recordId', recordId); // Store recordId when clocked in
    localStorage.setItem('totalWorkedSeconds', totalWorkedSeconds.toString()); // Store as string
  } else {
    localStorage.removeItem('clockInTime');
    localStorage.removeItem('recordId');
    localStorage.removeItem('totalWorkedSeconds'); // Clear on clock out
  }
}, [isClockedIn, clockInTime, recordId, totalWorkedSeconds]); // Update storage when these change



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
        const now = new Date();
        setClockInTime(now);
        setWorkingSeconds(0); // Reset total working time on new clock-in
        setClockInMessage(`Clocked in at ${now.toLocaleTimeString()}`);
        toast.success(`Clocked in at ${now.toLocaleTimeString()}`);
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

    console.log('Current recordId:', recordId); // Debug log  

    try {  
        let currentRecordId = recordId;  

        // If recordId is null, fetch the active clock-in record ID from the backend  
        if (!currentRecordId) {  
            const response = await checkActiveClockIn(authToken);  
            if (response.active && typeof response.record_id === 'number') {  
                currentRecordId = response.record_id; // Get the active record ID from the response  
            } else {  
                toast.error('No active clock-in found.');  
                return; // Exit if no active clock-in is found  
            }  
        }  

        // Validate currentRecordId before proceeding  
        if (!currentRecordId || typeof currentRecordId !== 'number') {  
            toast.error('Invalid record ID. Unable to clock out.');  
            return;  
        }  

        // Proceed to clock out with the retrieved or existing recordId  
        await clockOutRecord(authToken, currentRecordId);  
        setIsClockedIn(false);  
        setClockInMessage(''); // Clear the message after clock-out  
        toast.success(`Clocked out at ${new Date().toLocaleTimeString()}`);  
    } catch (error) {  
        console.error('Error during clock out:', error);  
        toast.error(error.message || 'Error clocking out. Please try again.');  
    }  
}, [isClockedIn, recordId]);


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
      setBreakDuration(0);
      setBreakExceeded(false); // Reset exceeded state when break starts
      toast.success('Break started.');
    } catch {
      toast.error('Error taking break.');
    }
  }, [isClockedIn, recordId, breakType, breakNotes]);

  const handleEndBreak = () => {
    if (breakExceeded) toast.warn('Break exceeded!');
    setBreakActive(false);
    setBreakDuration(0);
    setBreakNotes(''); // Clear break notes after ending the break
    setClockInMessage(''); // Clear the message after ending break
    toast.success('Break ended.');
  };

  // JobSection and BreakSelection components are memoized
  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
      {/* Clock-in status and message */}
      <h3 className="text-xl font-bold text-center">Clock In</h3>
      <div className="text-center mt-4">
        <p className="text-lg">{new Date().toLocaleTimeString()}</p>
      </div>
      {clockInMessage && <p className="text-center text-sm text-green-600">{clockInMessage}</p>}

      {/* Total Worked Hours */}
      <div className="text-center mt-4">
        <h4 className="font-bold">Total Worked Hours</h4>
        <p className="text-lg">{convertSecondsToHMM(totalWorkedSeconds)}</p>
      </div>

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

      {/* Break management */}
      <div className="mt-6">
        <h4 className="font-bold">Break Management</h4>
        <div>
          <select value={breakType} onChange={(e) => setBreakType(e.target.value)} className="mt-2 border">
            <option value="" disabled>Select Break Type</option>
            <option value="tea">Tea Break</option>
            <option value="lunch">Lunch Break</option>
          </select>
        </div>
        <textarea
          placeholder="Notes about the break"
          value={breakNotes}
          onChange={(e) => setBreakNotes(e.target.value)}
          className="mt-2 border p-2 w-full"
        ></textarea>
        <button onClick={handleTakeBreak} className="bg-green-500 text-white py-2 px-4 mt-2 rounded" disabled={!isClockedIn || breakActive}>
          Take Break
        </button>
        {breakActive && (
          <div className="mt-4">
            <p>Break Duration: {formatTime(breakDuration)}</p>
            <button onClick={handleEndBreak} className="bg-orange-500 text-white py-2 px-4 mt-2 rounded">
              End Break
            </button>
          </div>
        )}
        {breakExceeded && <p className="text-red-600">Break time exceeded!</p>}
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default ClockInSeconds;
