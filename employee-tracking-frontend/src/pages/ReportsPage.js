import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LeaveBalanceReport from './reports/LeaveBalanceReport';
import LeaveRequestReport from './reports/LeaveRequestReport';
import WorkHoursReport from './reports/WorkHoursReport';
import ProjectTaskReport from './reports/ProjectTaskReport';
import PerformanceMetricsReport from './reports/PerformanceMetricsReport';
import BillableHoursReport from './reports/BillableHoursReport';

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // You could load some common info here, or handle loading states
        setLoading(false);
    }, []);

    return (
        <div className="reports-page">
            <h1>Reports Dashboard</h1>

            {loading ? (
                <p>Loading reports...</p>
            ) : (
                <>
                    <LeaveBalanceReport />
                    <LeaveRequestReport />
                    <WorkHoursReport />
                    <ProjectTaskReport />
                    <BillableHoursReport />
                    <PerformanceMetricsReport />
                </>
            )}
        </div>
    );
};

export default ReportsPage;
