import React, { useState, useEffect } from 'react';

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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            if (isClockedIn) {
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
    }, [currentTime, isClockedIn, clockInTime]);

    const handleClockIn = () => {
        setIsClockedIn(true);
        setClockInTime(new Date());
    };

    const handleClockOut = () => {
        setIsClockedIn(false);
        // Save clock out logic here (e.g., API call to save data)
    };

    const handleTakeBreak = () => {
        if (!breakNotes) {
            alert('Please add notes before taking a break.');
            return;
        }
        // Handle break logic here (e.g., API call to save break)
        setBreakEnabled(false); // Reset break section after taking a break
    };

    return (
        <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
            <h3 className="text-xl font-bold text-center">Clock In</h3>
            <div className="text-center mt-4">
                <p className="text-lg">{currentTime.toLocaleTimeString()}</p>
            </div>
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
                    disabled={!breakNotes}
                >
                    Take Break
                </button>
            </div>

            <div className="mt-6">
                <p>Total Time: <span className="font-bold">{totalHours.toFixed(2)} hrs</span></p>
                <p>Extra Time: <span className="font-bold">{extraHours.toFixed(2)} hrs</span></p>
            </div>
        </div>
    );
};

export default ClockInSection;
