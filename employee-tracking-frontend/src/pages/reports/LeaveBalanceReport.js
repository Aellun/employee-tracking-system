import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveBalanceReport = () => {
    const [leaveBalances, setLeaveBalances] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/admin-dashboard/api/reports/leave-balance/')
            .then(response => {
                setLeaveBalances(response.data);
            })
            .catch(error => {
                console.error('Error fetching leave balances:', error);
            });
    }, []);

    return (
        <div className="report-section">
            <h2>Leave Balance Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Annual</th>
                        <th>Sick</th>
                        <th>Casual</th>
                        <th>Maternity</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveBalances.map(balance => (
                        <tr key={balance.user}>
                            <td>{balance.user}</td>
                            <td>{balance.annual}</td>
                            <td>{balance.sick}</td>
                            <td>{balance.casual}</td>
                            <td>{balance.maternity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveBalanceReport;
