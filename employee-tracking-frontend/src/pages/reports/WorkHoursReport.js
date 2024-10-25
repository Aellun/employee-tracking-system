import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv'; // For CSV download
import * as XLSX from 'xlsx'; // For Excel download
import jsPDF from 'jspdf'; // For PDF generation
import 'jspdf-autotable'; // For PDF tables
import { useAuth } from '../../AuthProvider';
import '../../css/workedhoursreport.css';

const WorkHoursReport = () => {
    const [workHours, setWorkHours] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:8000/admin-dashboard/api/employees/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching users:', error));
        }
    }, [token]);

    const fetchWorkHours = () => {
        const params = { user: selectedUser, start_date: startDate, end_date: endDate };
        
        axios.get('http://localhost:8000/admin-dashboard/api/reports/work-hours/', {
            headers: { Authorization: `Bearer ${token}` },
            params
        })
        .then(response => setWorkHours(response.data))
        .catch(error => console.error('Error fetching work hours:', error));
    };

    useEffect(() => {
        if (token) fetchWorkHours();
    }, [token]);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(workHours);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkHours');
        XLSX.writeFile(workbook, 'WorkHoursReport.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Work Hours Report', 20, 10);
        doc.autoTable({ html: '#work-hours-table' });
        doc.save('WorkHoursReport.pdf');
    };

    return (
        <div className="report-section">
            <h2>Work Hours Report</h2>
            
            <div className="filters">
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="">All Users</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                    ))}
                </select>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <button onClick={fetchWorkHours}>Filter</button>
            </div>

            {/* Export Buttons */}
            <div className="export-buttons">
                <CSVLink data={workHours} filename="WorkHoursReport.csv">Export to CSV</CSVLink>
                <button onClick={exportToExcel}>Export to Excel</button>
                <button onClick={exportToPDF}>Export to PDF</button>
            </div>

            <table id="work-hours-table">
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
                    {workHours.map((record, index) => (
                        <tr key={index}>
                            <td>{record.user}</td>
                            <td>{record.clocked_in}</td>
                            <td>{record.clocked_out}</td>
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
