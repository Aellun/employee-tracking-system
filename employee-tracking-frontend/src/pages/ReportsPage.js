import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LeaveBalanceReport from './reports/LeaveBalanceReport';
import LeaveRequestReport from './reports/LeaveRequestReport';
import WorkHoursReport from './reports/WorkHoursReport';
import ProjectTaskReport from './reports/ProjectTaskReport';
import BillableHoursReport from './reports/BillableHoursReport';
import PerformanceMetricsReport from './reports/PerformanceMetricsReport';
import '../css/ReportsPage.css';
const ReportsPage = () => {
    return (
        <div className="reports-page">
            <header className="navbar">
                <h1>Reports</h1>
            </header>
            <div className="container">
                <aside className="sidebar">
                    <ul>
                        <li><Link to="/reports/leaves-balance">Leave Balance Report</Link></li>
                        <li><Link to="/reports/leaves-request">Leave Request Report</Link></li>
                        <li><Link to="/reports/work-hours">Work Hours Report</Link></li>
                        <li><Link to="/reports/project-task">Project Task Report</Link></li>
                        <li><Link to="/reports/billable-hours">Billable Hours Report</Link></li>
                        <li><Link to="/reports/performance-metrics">Performance Metrics Report</Link></li>
                    </ul>
                </aside>
                <main className="main-content">
                    <Routes>
                        <Route path="/leaves-balance" element={<LeaveBalanceReport />} />
                        <Route path="/leaves-request" element={<LeaveRequestReport />} />
                        <Route path="/work-hours" element={<WorkHoursReport />} />
                        <Route path="/project-task" element={<ProjectTaskReport />} />
                        <Route path="/billable-hours" element={<BillableHoursReport />} />
                        <Route path="/performance-metrics" element={<PerformanceMetricsReport />} />
                    </Routes>
                </main>
            </div>
            <footer className="footer">
                <p>© 2024 Employee Tracking System</p>
            </footer>
        </div>
    );
};

export default ReportsPage;
