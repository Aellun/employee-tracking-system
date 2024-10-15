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
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Leave Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 font-semibold">Annual Leave</p>
                        <p className="text-3xl font-bold text-blue-500">{leaveBalance.annual ?? 0}</p>
                    </div>
                    <div className="text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c3.866 0 7-3.134 7-7S15.866 5 12 5 5 8.134 5 12s3.134 7 7 7z" />
                        </svg>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 font-semibold">Sick Leave</p>
                        <p className="text-3xl font-bold text-green-500">{leaveBalance.sick ?? 0}</p>
                    </div>
                    <div className="text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 font-semibold">Casual Leave</p>
                        <p className="text-3xl font-bold text-yellow-500">{leaveBalance.casual ?? 0}</p>
                    </div>
                    <div className="text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 6v-6" />
                        </svg>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 font-semibold">Maternity Leave</p>
                        <p className="text-3xl font-bold text-pink-500">{leaveBalance.maternity ?? 0}</p>
                    </div>
                    <div className="text-pink-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveBalance;
