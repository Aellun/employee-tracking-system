import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv'; // For CSV download
import * as XLSX from 'xlsx'; // For Excel download
import jsPDF from 'jspdf'; // For PDF generation
import 'jspdf-autotable'; // For PDF tables
import { useAuth } from '../../AuthProvider'; // Import the AuthProvider
import '../../css/LeaveRequestReport.css';

const LeaveRequestReport = () => {
    const { token } = useAuth(); // Get the token from AuthProvider
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeeName, setEmployeeName] = useState('');
    const [leaveType, setLeaveType] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const response = await axios.get('http://localhost:8000/admin-dashboard/api/reports/leave-requests/', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the auth token
                    },
                    params: {
                        employee_name: employeeName,
                        leave_type: leaveType,
                        status,
                        start_date: startDate,
                        end_date: endDate,
                    },
                });
                setLeaveRequests(response.data);
            } catch (error) {
                console.error('Error fetching leave requests:', error);
            }
        };

        fetchLeaveRequests();
    }, [employeeName, leaveType, status, startDate, endDate, token]); // Add dependencies for re-fetching

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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
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
