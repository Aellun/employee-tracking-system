import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveRequestReport = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        axios.get('/api/reports/leave-requests/')
            .then(response => {
                setLeaveRequests(response.data);
            })
            .catch(error => {
                console.error('Error fetching leave requests:', error);
            });
    }, []);

    return (
        <div className="report-section">
            <h2>Leave Request Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Employee Name</th>
                        <th>Email</th>
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map(request => (
                        <tr key={request.employee_email}>
                            <td>{request.employee_name}</td>
                            <td>{request.employee_email}</td>
                            <td>{request.leave_type}</td>
                            <td>{request.start_date}</td>
                            <td>{request.end_date}</td>
                            <td>{request.status}</td>
                            <td>{request.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveRequestReport;
