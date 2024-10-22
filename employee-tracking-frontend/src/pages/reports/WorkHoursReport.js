import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkHoursReport = () => {
    const [workHours, setWorkHours] = useState([]);

    useEffect(() => {
        axios.get('/api/reports/work-hours/')
            .then(response => {
                setWorkHours(response.data);
            })
            .catch(error => {
                console.error('Error fetching work hours:', error);
            });
    }, []);

    return (
        <div className="report-section">
            <h2>Work Hours Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Clocked In</th>
                        <th>Clocked Out</th>
                        <th>Hours Worked</th>
                        <th>Extra Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {workHours.map(record => (
                        <tr key={record.user}>
                            <td>{record.user}</td>
                            <td>{record.clocked_in}</td>
                            <td>{record.clocked_out || 'Still clocked in'}</td>
                            <td>{record.hours_worked}</td>
                            <td>{record.extra_hours}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkHoursReport;
