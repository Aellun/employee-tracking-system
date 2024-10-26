import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import '../css/ReportsPage.css';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [visualizationData, setVisualizationData] = useState({
    task_completion_rate: 0,
    leave_approval_rate: 0,
    avg_hours_worked: 0,
    leave_request_rate: 0,
  });

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:8000/admin-dashboard/api/aggregated-reports/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          const { task_statistics, leave_statistics, average_hours_worked } = response.data;
          const task_completion_rate = (task_statistics.completed / task_statistics.total_tasks) * 100 || 0;
          const leave_request_rate = (leave_statistics.approved / leave_statistics.total_leave_requests) * 100 || 0;

          setVisualizationData({
            task_completion_rate,
            leave_request_rate,
            avg_hours_worked: average_hours_worked,
            leave_approval_rate: (leave_statistics.approved / leave_statistics.total_leave_requests) * 100 || 0,
          });
          
          console.log('Fetched Data for Visualization:', response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching visualization data:', error);
          setLoading(false);
        });
    }
  }, [token]);

  if (loading) {
    return <p>Loading visualizations...</p>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <header className="bg-gray-900 text-white py-4 text-center">
        <h1 className="text-2xl">Reports</h1>
      </header>

      {/* Container: Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-gray-100 w-64 p-4 overflow-y-auto shadow-lg">
          <ul className="space-y-4">
            <li><Link to="/reports/leaves-balance" className="block p-2 rounded hover:bg-gray-200">Leave Balance Report</Link></li>
            <li><Link to="/reports/leaves-request" className="block p-2 rounded hover:bg-gray-200">Leave Request Report</Link></li>
            <li><Link to="/reports/work-hours" className="block p-2 rounded hover:bg-gray-200">Work Hours Report</Link></li>
            <li><Link to="/reports/project-task" className="block p-2 rounded hover:bg-gray-200">Project Task Report</Link></li>
            {/* <li><Link to="/reports/billable-hours" className="block p-2 rounded hover:bg-gray-200">Billable Hours Report</Link></li> */}
            <li><Link to="/reports/performance-metrics" className="block p-2 rounded hover:bg-gray-200">Performance Metrics Report</Link></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-white">
          <h2 className="text-2xl mb-6">Visualizations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Completion Rate Pie Chart */}
            <div className="mb-10 text-center bg-gray-50 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Task Completion Rate</h3>
              <PieChart width={400} height={400}>
                <Pie
                  data={[
                    { name: 'Completed', value: visualizationData.task_completion_rate },
                    { name: 'Remaining', value: 100 - visualizationData.task_completion_rate },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#82ca9d"
                />
                <Tooltip />
              </PieChart>
            </div>

            {/* Leave Approval Rate Bar Chart */}
            <div className="mb-10 text-center bg-gray-50 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Leave Approval Rates</h3>
              <BarChart width={600} height={300} data={[
                { name: 'Approved', value: visualizationData.leave_approval_rate },
                { name: 'Pending', value: 100 - visualizationData.leave_approval_rate },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>

            {/* Average Hours Worked Bar Chart */}
            <div className="mb-10 text-center bg-gray-50 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Average Hours Worked</h3>
              <BarChart width={600} height={300} data={[
                { name: 'Avg Hours Worked', value: visualizationData.avg_hours_worked },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </div>

            {/* Leave Request Rate Pie Chart */}
            {/* <div className="mb-10 text-center bg-gray-50 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Leave Request Rate</h3>
              <PieChart width={400} height={400}>
                <Pie
                  data={[
                    { name: 'Leave Requests', value: visualizationData.leave_request_rate },
                    { name: 'Other', value: 100 - visualizationData.leave_request_rate },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#ffc658"
                />
                <Tooltip />
              </PieChart>
            </div> */}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-3">
        <p>© 2024 Employee Tracking System</p>
      </footer>
    </div>
  );
};

export default ReportsPage;
