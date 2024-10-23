import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthProvider';
import { CSVLink } from 'react-csv'; // For CSV download
import * as XLSX from 'xlsx'; // For Excel download
import jsPDF from 'jspdf'; // For PDF generation
import 'jspdf-autotable'; // For PDF tables
import '../../css/LeaveBalanceReport.css';

const LeaveBalanceReport = () => {
    const [leaveBalances, setLeaveBalances] = useState([]);
    const { token } = useAuth();
    const [filteredBalances, setFilteredBalances] = useState([]);
    const [userFilter, setUserFilter] = useState(''); // For filtering by user
    const [leaveTypeFilter, setLeaveTypeFilter] = useState(''); // For filtering by leave type

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:8000/admin-dashboard/api/reports/leave-balance/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(response => {
                setLeaveBalances(response.data);
                setFilteredBalances(response.data);
            })
            .catch(error => {
                console.error('Error fetching leave balances:', error);
            });
        }
    }, [token]);

    // Filter by user and leave type
    const handleFilterChange = () => {
        setFilteredBalances(leaveBalances.filter(balance =>
            (userFilter === '' || balance.user.toLowerCase().includes(userFilter.toLowerCase())) &&
            (leaveTypeFilter === '' || balance[leaveTypeFilter] > 0)
        ));
    };

    // Download CSV
    const csvHeaders = [
        { label: 'User', key: 'user' },
        { label: 'Annual', key: 'annual' },
        { label: 'Sick', key: 'sick' },
        { label: 'Casual', key: 'casual' },
        { label: 'Maternity', key: 'maternity' },
    ];

    // Download Excel
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredBalances);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Balances');
        XLSX.writeFile(workbook, 'LeaveBalanceReport.xlsx');
    };

    // Generate PDF
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text('Leave Balance Report', 20, 10);
        doc.autoTable({
            head: [['User', 'Annual', 'Sick', 'Casual', 'Maternity']],
            body: filteredBalances.map(balance => [balance.user, balance.annual, balance.sick, balance.casual, balance.maternity]),
        });
        doc.save('LeaveBalanceReport.pdf');
    };

    return (
        <div className="report-section">
            <h2>Leave Balance Report</h2>

            {/* Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Filter by user"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    onBlur={handleFilterChange} // Filter on blur
                />
                <select
                    value={leaveTypeFilter}
                    onChange={(e) => { setLeaveTypeFilter(e.target.value); handleFilterChange(); }}
                >
                    <option value="">Filter by leave type</option>
                    <option value="annual">Annual</option>
                    <option value="sick">Sick</option>
                    <option value="casual">Casual</option>
                    <option value="maternity">Maternity</option>
                </select>
            </div>

            {/* Table */}
            <table className="leave-table">
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
                    {filteredBalances.map(balance => (
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

            {/* Download Buttons */}
            <div className="download-buttons">
                <CSVLink
                    data={filteredBalances}
                    headers={csvHeaders}
                    filename="LeaveBalanceReport.csv"
                    className="btn"
                >
                    Download CSV
                </CSVLink>
                <button onClick={downloadExcel} className="btn">Download Excel</button>
                <button onClick={downloadPDF} className="btn">Download PDF</button>
                <button onClick={() => navigator.clipboard.writeText(JSON.stringify(filteredBalances, null, 2))} className="btn">
                    Copy to Clipboard
                </button>
            </div>
        </div>
    );
};

export default LeaveBalanceReport;
