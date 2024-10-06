import React, { useState, useEffect } from 'react';  
import { toast, ToastContainer } from 'react-toastify';  
import { clockInRecord, clockOutRecord, takeBreakRecord } from '../api'; // Adjust the path as necessary  
import 'react-toastify/dist/ReactToastify.css'; // Ensure you have this line to import the styles for toast notifications  

const getCSRFToken = () => {  
    const name = 'csrftoken=';  
    const decodedCookie = decodeURIComponent(document.cookie);  
    const ca = decodedCookie.split(';');  
    for (let i = 0; i < ca.length; i++) {  
        let c = ca[i];  
        while (c.charAt(0) === ' ') c = c.substring(1); // Remove leading spaces  
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);  
    }  
    return '';  
};  

const JobSection = ({ isClockedIn, onClockInJob, onClockOutJob }) => {  
    const [jobName, setJobName] = useState("");  

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
                    onClick={() => onClockInJob(jobName)}  
                    disabled={!isClockedIn}  
                    className="bg-green-500 text-white py-2 px-4 rounded"  
                >  
                    Clock In Job  
                </button>  
                <button  
                    onClick={() => onClockOutJob(jobName)}  
                    disabled={!isClockedIn}  
                    className="bg-orange-500 text-white py-2 px-4 rounded"  
                >  
                    Clock Out Job  
                </button>  
            </div>  
        </div>  
    );  
};  

const ClockInSection = () => {  
    const [isClockedIn, setIsClockedIn] = useState(false);  
    const [currentTime, setCurrentTime] = useState(new Date());  
    const [recordId, setRecordId] = useState(1); // Assuming a static ID for example  
    const [breakType, setBreakType] = useState("");  
    const [breakNotes, setBreakNotes] = useState("");  
    const [totalHours, setTotalHours] = useState(0); // To keep track of total hours
    const [extraHours, setExtraHours] = useState(0); // To keep track of extra hours

    useEffect(() => {  
        const interval = setInterval(() => {  
            setCurrentTime(new Date());  
        }, 1000);  
        return () => clearInterval(interval);  
    }, []);  

    const handleClockIn = () => {  
        const csrfToken = getCSRFToken();  
        clockInRecord(recordId, csrfToken)  
            .then(response => {  
                console.log(response.data);  
                setIsClockedIn(true);  
                toast.success('Clocked In Successfully');  
            })  
            .catch(error => {  
                console.error(error);  
                toast.error('Error clocking in. Please try again.');  
            });  
    };  

    const handleClockOut = () => {  
        const csrfToken = getCSRFToken();  
        clockOutRecord(recordId, csrfToken)  
            .then(response => {  
                console.log(response.data);  
                setIsClockedIn(false);  
                toast.success('Clocked Out Successfully');  
            })  
            .catch(error => {  
                console.error(error);  
                toast.error('Error clocking out. Please try again.');  
            });  
    };  

    const handleTakeBreak = () => {  
        const csrfToken = getCSRFToken();  
        takeBreakRecord(recordId, breakType, breakNotes, csrfToken)  
            .then(response => {  
                console.log(response.data);  
                setBreakType("");  // Reset break type
                setBreakNotes(""); // Reset break notes
                toast.success('Break Taken Successfully');  
            })  
            .catch(error => {  
                console.error(error);  
                toast.error('Error taking break. Please try again.');  
            });  
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

            <JobSection  
                isClockedIn={isClockedIn}  
                onClockInJob={(jobName) => console.log(`Clocking in job: ${jobName}`)}  
                onClockOutJob={(jobName) => console.log(`Clocking out job: ${jobName}`)}  
            />  

            {/* Break selection */}  
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

            <ToastContainer /> {/* Toast container for notifications */}  
        </div>  
    );  
};  

export default ClockInSection;
