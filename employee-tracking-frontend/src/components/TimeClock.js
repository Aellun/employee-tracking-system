import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clockInRecord, clockOutRecord, takeBreakRecord, checkActiveClockIn, endBreakRecord, checkActiveBreak } from '../api';
import { useAuth } from '../AuthProvider'; // Import the AuthProvider


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
  const { token, userId } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [breakActive, setBreakActive] = useState(false);
  const [breakId, setBreakId] = useState(null); // Track the break ID
  const [breakType, setBreakType] = useState('');
  const [breakNotes, setBreakNotes] = useState('');
  const [breakDuration, setBreakDuration] = useState(0);
  const [breakExceeded, setBreakExceeded] = useState(false);
  const [workingSeconds, setWorkingSeconds] = useState(0); // Track working seconds
  const [clockInMessage, setClockInMessage] = useState(''); // Track clock-in message
  const [totalWorkedSeconds, setTotalWorkedSeconds] = useState(0); // Track total worked seconds

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

  useEffect(() => {   
    console.log("User ID from Auth:", userId); // Debugging line  

    const fetchActiveClockInAndBreak = async () => {  
        if (!token || !userId) return; // Ensure token and userId are available  
  
        try {  
            const response = await checkActiveClockIn(token);  
            console.log("Response from checkActiveClockIn:", response); // Debugging line  

            // Check if there is an active clock-in for the logged-in user  
            if (response.active && response.user_id == userId) {  
                const clockInTime = response.time_clocked_in;  
                const activeRecordId = response.record_id;  

                if (clockInTime) {  
                    const parsedTime = new Date(clockInTime);  
                    if (!isNaN(parsedTime.getTime())) {  
                        setIsClockedIn(true);  
                        setClockInTime(parsedTime);  
                        setRecordId(activeRecordId);  
  
                        // Fetch any active break for this clock-in  
                        const breakResponse = await checkActiveBreak(token, activeRecordId);  
                        console.log("Response from checkActiveBreak:", breakResponse); // Debugging line  

                        // Check if breakResponse is active and matches the record_id  
                        if (breakResponse.active && breakResponse.record_id === activeRecordId) {  
                            const breakData = breakResponse;  
                            setBreakActive(true);  
                            setBreakType(breakData.break_type || '');  
                            setBreakNotes(breakData.break_notes || '');  
                            setBreakId(breakData.break_id);  
  
                            // Calculate the elapsed break time since `break_start_time`  
                            const breakStartTime = new Date(breakData.break_start_time);  
                            const elapsedBreakSeconds = Math.floor((Date.now() - breakStartTime.getTime()) / 1000);  
                            setBreakDuration(elapsedBreakSeconds);  
                        }  

                        // Store clock-in and break data in localStorage  
                        localStorage.setItem('clockInTime', parsedTime.toISOString());  
                        localStorage.setItem('recordId', activeRecordId);  
                        localStorage.setItem('breakActive', breakResponse.active && breakResponse.user_id == userId ? 'true' : 'false');  
                    }  
                }  
            }  
        } catch (error) {  
            console.error('Detailed error:', error);  
            toast.error('Error checking active clock-in or break.');  
        }  
    };  
  
    fetchActiveClockInAndBreak();  
}, [token, userId]); // Rerun if token or userId changes


  

  // Update `handleEndBreak` to send break ID
  const handleEndBreak = async () => {
    const authToken = getAuthToken();
    if (!authToken) {
      toast.error('Authentication failed.');
      return;
    }

    try {
      await endBreakRecord(authToken, breakId); // Pass the break ID to the API
      setBreakActive(false);
      setBreakDuration(0);
      setBreakNotes(''); // Clear break notes after ending the break
      setClockInMessage(''); // Clear any break-related message
      toast.success('Break ended successfully.');
    } catch (error) {
      toast.error('Error ending break. Please try again.');
    }
  };

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

        // Clock out logic with correct recordId  
        const response = await clockOutRecord(authToken, currentRecordId);  
        if (response.message === 'Clocked out successfully') {  
            setIsClockedIn(false);  
            setRecordId(null);  
            setClockInTime(null);  
            setWorkingSeconds(0); // Reset working time after clock-out  
            setClockInMessage('');  
            localStorage.removeItem('clockInTime');  
            localStorage.removeItem('recordId');  
            localStorage.removeItem('totalWorkedSeconds'); // Remove total worked seconds  
            toast.success('Clocked out successfully.');  
        } else {  
            toast.error('Clock-out failed.');  
        }  
    } catch {  
        toast.error('Error clocking out. Please try again.');  
    }  
  }, [isClockedIn, recordId]); // Pass recordId as dependency
  

  // Break handler
  const handleTakeBreak = useCallback(async (breakType, breakNotes) => {
    const authToken = getAuthToken();
    if (!isClockedIn || !authToken || breakActive) {
        toast.error('Cannot take a break right now.');
        return;
    }

    // Log to verify values
    console.log('Taking break with:', {
        recordId,
        breakType,
        breakNotes
    });

    try {
        // Adjusted the order of parameters
        const response = await takeBreakRecord(authToken, recordId, breakType, breakNotes);
        if (response?.message === 'Break started successfully') {
            setBreakActive(true);
            setBreakType(breakType);
            setBreakNotes(breakNotes);
            setBreakId(response.break_id); // Store the new break ID
            setBreakDuration(0); // Reset break timer
            toast.success('Break started successfully.');
        } else {
            toast.error('Failed to start break.');
        }
    } catch (error) {
        console.error('Error starting break:', error);
        toast.error('Error starting break. Please try again.');
    }
}, [isClockedIn, recordId, breakActive]);

  
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
        <button 
        onClick={() => handleTakeBreak(breakType, breakNotes)} 
        className="bg-green-500 text-white py-2 px-4 mt-2 rounded" 
        disabled={!isClockedIn || breakActive}
         >
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
