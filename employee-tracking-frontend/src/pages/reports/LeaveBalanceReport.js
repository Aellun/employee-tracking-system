import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthProvider'; // Import the useAuth hook

const LeaveBalanceReport = () => {
    const [leaveBalances, setLeaveBalances] = useState([]);
    const { token } = useAuth(); // Access the token from AuthProvider

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:8000/admin-dashboard/api/reports/leave-balance/', {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            })
            .then(response => {
                setLeaveBalances(response.data);
            })
            .catch(error => {
                console.error('Error fetching leave balances:', error);
            });
        }
    }, [token]); // Effect will run when the token is available

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
