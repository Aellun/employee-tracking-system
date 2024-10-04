import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper function to get the CSRF token from the cookies
const getCSRFToken = () => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken'.length + 1) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

const ClockInSection = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState(null);
    const [totalHours, setTotalHours] = useState(0);
    const [extraHours, setExtraHours] = useState(0);
    const [jobName, setJobName] = useState('');
    const [breakType, setBreakType] = useState('tea');
    const [breakNotes, setBreakNotes] = useState('');
    const [breakEnabled, setBreakEnabled] = useState(false);

    // Update current time every second and calculate total hours
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            if (isClockedIn && clockInTime) {
                const now = new Date();
                const hoursWorked = (now - clockInTime) / 1000 / 3600;
                setTotalHours(hoursWorked);
                if (hoursWorked > 8) {
                    setExtraHours(hoursWorked - 8);
                } else {
                    setExtraHours(0);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isClockedIn, clockInTime]);

    // Handle clock in
    const handleClockIn = () => {
        const csrfToken = getCSRFToken();  // Get the CSRF token
        axios.post(
            'http://localhost:8000/api/clock-in-records/clock_in/', 
            {}, // If your POST body requires additional data, add it here
            {
                headers: {
                    'X-CSRFToken': csrfToken, // Include the CSRF token in headers
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include Bearer token if using Token Authentication
                }
            }
        )
        .then(response => {
            console.log(response.data);
            setIsClockedIn(true);
            setClockInTime(new Date());
        })
        .catch(error => {
            console.error(error);
        });
    };

    // Handle clock out
    const handleClockOut = () => {
        const csrfToken = getCSRFToken();  // Get the CSRF token
        const recordId = 1;  // Use appropriate record ID
        axios.post(
            `http://localhost:8000/api/clock-in-records/${recordId}/clock_out/`,
            {},
            {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        )
        .then(response => {
            console.log(response.data);
            setIsClockedIn(false);
            setClockInTime(null);
        })
        .catch(error => {
            console.error(error);
        });
    };

    // Handle taking a break
    const handleTakeBreak = () => {
        const csrfToken = getCSRFToken();
        const recordId = 1;  // Use the appropriate record ID
        axios.post(
            `http://localhost:8000/api/clock-in-records/${recordId}/take_break/`,
            {
                break_type: breakType,
                break_notes: breakNotes
            },
            {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            }
        )
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
    };

    return (
        <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
            <h3 className="text-xl font-bold text-center">Clock In</h3>
            
            {/* Display current time */}
            <div className="text-center mt-4">
                <p className="text-lg">{currentTime.toLocaleTimeString()}</p>
            </div>
            
            {/* Clock In and Clock Out buttons */}
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
                    disabled={!isClockedIn}
                >
                    Clock Out
                </button>
            </div>

            {/* Job input */}
            <div className="mt-6">
                <input 
                    type="text" 
                    value={jobName} 
                    onChange={(e) => setJobName(e.target.value)} 
                    placeholder="Enter Job Name" 
                    className="border border-gray-300 rounded p-2 w-full"
                />
                <div className="flex justify-between mt-2">
                    <button 
                        className="bg-green-500 text-white py-1 px-3 rounded" 
                        disabled={!isClockedIn}
                    >
                        Clock In Job
                    </button>
                    <button 
                        className="bg-yellow-500 text-white py-1 px-3 rounded" 
                        disabled={!isClockedIn}
                    >
                        Clock Out Job
                    </button>
                </div>
            </div>

            {/* Break selection */}
            <div className="mt-6">
                <select 
                    value={breakType} 
                    onChange={(e) => setBreakType(e.target.value)} 
                    className="border border-gray-300 rounded p-2 w-full"
                >
                    <option value="tea">Tea Break</option>
                    <option value="lunch">Lunch Break</option>
                </select>
                <textarea 
                    value={breakNotes} 
                    onChange={(e) => setBreakNotes(e.target.value)} 
                    placeholder="Add notes before break" 
                    className="border border-gray-300 rounded p-2 w-full mt-2"
                />
                <button 
                    onClick={handleTakeBreak} 
                    className="bg-purple-500 text-white py-2 px-4 rounded mt-2" 
                    disabled={!breakNotes || !isClockedIn}
                >
                    Take Break
                </button>
            </div>

            {/* Display total and extra hours */}
            <div className="mt-6">
                <p>Total Time: <span className="font-bold">{totalHours.toFixed(2)} hrs</span></p>
                <p>Extra Time: <span className="font-bold">{extraHours.toFixed(2)} hrs</span></p>
            </div>
        </div>
    );
};

export default ClockInSection;
