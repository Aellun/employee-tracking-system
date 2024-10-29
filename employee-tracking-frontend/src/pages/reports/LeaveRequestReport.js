import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv'; // For CSV download
import * as XLSX from 'xlsx'; // For Excel download
import jsPDF from 'jspdf'; // For PDF generation
import 'jspdf-autotable'; // For PDF tables
import { useAuth } from '../../AuthProvider';
import '../../css/LeaveRequestReport.css';

const LeaveRequestReport = () => {
    const { token } = useAuth(); // Get the token from AuthProvider
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeeName, setEmployeeName] = useState('');
    const [leaveType, setLeaveType] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            setLoading(true);
            setError('');
            try {
                // Date range validation
                if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                    setError("Start date cannot be later than end date");
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:8000/admin-dashboard/api/reports/leave-requests/', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the auth token
                    },
                    params: {
                        employeeName, // CamelCase parameter as expected by backend
                        leaveType,
                        status,
                        startDate,
                        endDate,
                    },
                });
                setLeaveRequests(response.data);
            } catch (error) {
                setError('Error fetching leave requests.');
                console.error('Error fetching leave requests:', error);
            }
            setLoading(false);
        };

        const delayDebounceFn = setTimeout(() => {
            fetchLeaveRequests(); // Fetch the leave requests after a delay
        }, 300); // 300ms debounce delay

        return () => clearTimeout(delayDebounceFn); // Cleanup debounce
    }, [employeeName, leaveType, status, startDate, endDate, token]);

    // Export to Excel
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(leaveRequests);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'LeaveRequests');
        XLSX.writeFile(wb, 'leave_requests.xlsx');
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Employee Name", "Email", "Leave Type", "Start Date", "End Date", "Status", "Reason"];
        const tableRows = leaveRequests.map(req => [
            req.employee_name,
            req.employee_email,
            req.leave_type,
            req.start_date,
            req.end_date,
            req.status,
            req.reason,
        ]);

        doc.autoTable(tableColumn, tableRows);
        doc.save('leave_requests.pdf');
    };

    return (
        <div className="report-section">
            <h2>Leave Request Report</h2>

            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Employee Name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                />
                <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                >
                    <option value="">Leave Type</option>
                    <option value="annual">Annual</option>
                    <option value="sick">Sick</option>
                    <option value="casual">Casual</option>
                    {/* Add other leave types as needed */}
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                </select>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button onClick={exportToExcel}>Export to Excel</button>
                <CSVLink data={leaveRequests} filename={'leave_requests.csv'}>
                    <button>Export to CSV</button>
                </CSVLink>
                <button onClick={exportToPDF}>Export to PDF</button>
            </div>

            {/* Loading and Error Handling */}
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            <table id="leaveRequestsTable">
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
                        <tr key={`${request.employee_email}-${request.start_date}`}>
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
