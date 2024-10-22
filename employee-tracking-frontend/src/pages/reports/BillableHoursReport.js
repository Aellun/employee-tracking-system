import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BillableHoursReport = () => {
    const [billableHours, setBillableHours] = useState([]);

    useEffect(() => {
        axios.get('/api/reports/billable-hours/')
            .then(response => {
                setBillableHours(response.data);
            })
            .catch(error => {
                console.error('Error fetching billable hours:', error);
            });
    }, []);

    return (
        <div className="report-section">
            <h2>Billable Hours Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Task</th>
                        <th>Hours</th>
                        <th>Billable Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {billableHours.map(entry => (
                        <tr key={entry.employee}>
                            <td>{entry.employee}</td>
                            <td>{entry.task}</td>
                            <td>{entry.hours}</td>
                            <td>{entry.billable_hours}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BillableHoursReport;
