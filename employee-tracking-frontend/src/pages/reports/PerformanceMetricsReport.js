import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PerformanceMetricsReport = () => {
    const [metrics, setMetrics] = useState({});

    useEffect(() => {
        axios.get('/api/reports/performance-metrics/')
            .then(response => {
                setMetrics(response.data);
            })
            .catch(error => {
                console.error('Error fetching performance metrics:', error);
            });
    }, []);

    return (
        <div className="report-section">
            <h2>Performance Metrics Report</h2>
            <p>Total Completed: {metrics.total_completed}</p>
            <p>Total Pending: {metrics.total_pending}</p>
            <p>Total In Progress: {metrics.total_in_progress}</p>
        </div>
    );
};

export default PerformanceMetricsReport;
