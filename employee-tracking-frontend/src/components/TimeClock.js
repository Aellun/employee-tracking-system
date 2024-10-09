// src/components/ClockIn.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clockInRecord, clockOutRecord, takeBreakRecord } from '../api';

const getAuthToken = () => {
    console.log("Auth Token:", getAuthToken);
  return localStorage.getItem('getAuthToken') || null;
};

const calculateTotalHours = (clockInTime, clockOutTime) => {
  const startTime = new Date(clockInTime);
  const endTime = new Date(clockOutTime);
  const diffMs = endTime - startTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  return hours;
};

const calculateExtraHours = (totalHours) => {
  const overtimeThreshold = 8;
  const extraHours = totalHours > overtimeThreshold ? totalHours - overtimeThreshold : 0;
  return extraHours;
};

const ClockInSeconds = ({ onClockIn, onClockOut, onTakeBreak }) => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recordId, setRecordId] = useState(1);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [breakType, setBreakType] = useState('');
  const [breakNotes, setBreakNotes] = useState('');

  const authToken = getAuthToken();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = useCallback(async () => {
    if (!authToken) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await clockInRecord(authToken);
      setRecordId(response.data.id);
      setIsClockedIn(true);
      setClockInTime(new Date().toISOString());
      toast.success('Clocked In Successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error clocking in. Please try again.');
    }
  }, []);

  const handleClockOut = useCallback(async () => {
    if (!isClockedIn) {
      toast.error('You are not currently clocked in.');
      return;
    }

    try {
      const response = await clockOutRecord(authToken, recordId);
      setIsClockedIn(false);
      setClockOutTime(new Date().toISOString());
      toast.success('Clocked Out Successfully');
    } catch (error) {
      toast.error('Error clocking out. Please try again.');
    }
  }, [isClockedIn, authToken, recordId]);

  const handleTakeBreak = useCallback(async () => {
    if (!isClockedIn || !breakType || !breakNotes) {
      toast.error('Please fill in all required fields for the break.');
      return;
    }

    try {
      await takeBreakRecord(authToken, recordId, breakType, breakNotes);
      setBreakType('');
      setBreakNotes('');
      toast.success('Break Taken Successfully');
    } catch (error) {
      toast.error('Error taking break. Please try again.');
    }
  }, [isClockedIn, authToken, recordId, breakType, breakNotes]);

  const totalHours = calculateTotalHours(clockInTime, clockOutTime);
  const extraHours = calculateExtraHours(totalHours);

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-center">Clock In</h3>
      <div className="text-center mt-4">
        <p className="text-lg">{currentTime.toLocaleTimeString()}</p>
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={handleClockIn} className="bg-blue-500 text-white py-2 px-4 rounded" disabled={!authToken}>
          Clock In
        </button>
        <button onClick={handleClockOut} className="bg-red-500 text-white py-2 px-4 rounded" disabled={!isClockedIn}>
          Clock Out
        </button>
      </div>

      <JobSection
        isClockedIn={isClockedIn}
        onClockIn={(jobName) => onClockIn(jobName)}
        onClockOut={(jobName) => onClockOut(jobName)}
      />

      <BreakSelection
        breakType={breakType}
        setBreakType={setBreakType}
        breakNotes={breakNotes}
        setBreakNotes={setBreakNotes}
      />
      <button onClick={handleTakeBreak} className="bg-purple-500 text-white py-2 px-4 rounded mt-2" disabled={!isClockedIn || !breakType || !breakNotes}>
        Take Break
      </button>

      <TimeTracking
        totalHours={totalHours.toFixed(2)}
        extraHours={extraHours.toFixed(2)}
        breakType={breakType}
        breakNotes={breakNotes}
      />

      <ToastContainer />
    </div>
  );
};

const JobSection = ({ isClockedIn, onClockIn, onClockOut }) => {
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
        <button onClick={() => onClockIn(jobName)} className="bg-green-500 text-white py-2 px-4 rounded" disabled={!isClockedIn}>
          Clock In Job
        </button>
        <button onClick={() => onClockOut(jobName)} className="bg-orange-500 text-white py-2 px-4 rounded" disabled={!isClockedIn}>
          Clock Out Job
        </button>
      </div>
    </div>
  );
};

const BreakSelection = ({ breakType, setBreakType, breakNotes, setBreakNotes }) => {
  return (
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
};

const TimeTracking = ({ totalHours, extraHours, breakType, breakNotes }) => {
  return (
    <div className="mt-6">
      <p>Total Time: <span className="font-bold">{totalHours} hrs</span></p>
      <p>Extra Hours: <span className="font-bold">{extraHours} hrs</span></p>
      <p>Break Type: <span className="font-bold">{breakType}</span></p>
      <p>Break Notes: <span className="font-bold">{breakNotes}</span></p>
    </div>
  );
};

export default ClockInSeconds;
