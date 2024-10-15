import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';

const LeaveBalance = () => {
    const { token } = useAuth();
    const [leaveBalance, setLeaveBalance] = useState({});

    useEffect(() => {
        const fetchLeaveBalance = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/leave-balance/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeaveBalance(response.data);
            } catch (error) {
                console.error('Error fetching leave balance:', error);
            }
        };

        fetchLeaveBalance();
    }, [token]);

    return (
        <div>
            <p><strong>Annual Leave:</strong> {leaveBalance.annual}</p>
            <p><strong>Sick Leave:</strong> {leaveBalance.sick}</p>
            <p><strong>Casual Leave:</strong> {leaveBalance.casual}</p>
            <p><strong>Maternity Leave:</strong> {leaveBalance.maternity}</p>
        </div>
    );
};

export default LeaveBalance;
