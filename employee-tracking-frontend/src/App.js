import React, { useState } from 'react'; 
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';  
import { AuthProvider, useAuth } from './AuthProvider'; // Import the AuthProvider
import Login from './components/Login';  
import TasksPage from './pages/TasksPage';    
import TimesheetPage from './pages/TimesheetPage';  
import EmployeesPage from './pages/EmployeesPage';  
import ProjectsPage from './pages/ProjectsPage';  
import ReportsPage from './pages/ReportsPage'; 
import HomePage from './pages/HomePage';
import AdminHomePage from './pages/AdminHomePage';
import TimeClock from './components/TimeClock';
import AdminTasksPage from './pages/AdminTasksPage';
import LeavePage from './pages/LeavePage';
import AdminDashboard from './components/AdminDashboard'; 
// import ManageEmployees from './components/ManageEmployees';
// import ManageProjects from './components/ManageProjects';
import ManageLeaves from './components/ManageLeaves';
import ManageClockIn from './pages/ManageClockIn';
import ManageTasks from './components/ManageTasks';

import LeavesBalanceReport from './pages/reports/LeaveBalanceReport';
import LeaveRequestReport from './pages/reports/LeaveRequestReport';
import WorkHoursReport from './pages/reports/WorkHoursReport';
import ProjectTaskReport from './pages/reports/ProjectTaskReport';
import BillableHoursReport from './pages/reports/BillableHoursReport';
import PerformanceMetricsReport from './pages/reports/PerformanceMetricsReport';


function App() {  
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false); // State to manage Time Clock visibility
  const { token, isAdmin } = useAuth(); // Get auth values from context

  return (  
    <Router> 
      <div>  
        {/* Render the Time Clock window conditionally */}
        {isTimeClockOpen && (
          <TimeClock onClose={() => setIsTimeClockOpen(false)} /> // Pass the close function as a prop
        )}

        {/* Routes for your application */}
        <Routes>
          {/* If not logged in, redirect to login page */}
          <Route path="/" element={token ? <Navigate to={isAdmin ? "/admin" : "/HomePage"} /> : <Login />} />

          {/* Protected Routes */}
          <Route path="/HomePage" element={token ? <HomePage /> : <Navigate to="/" />} />
          <Route path="/tasks" element={token ? <TasksPage /> : <Navigate to="/" />} />
          <Route path="/timesheet" element={token ? <TimesheetPage /> : <Navigate to="/" />} />
          <Route path="/clockin" element={token ? <TimeClock onClose={() => setIsTimeClockOpen(false)} /> : <Navigate to="/" />} />
          
          {/* Leave Request Form Route */}
          <Route path="/leave" element={token ? <LeavePage /> : <Navigate to="/" />} />
          
          {/* Admin Routes */}
          {isAdmin && (
            <>
              <Route path="/admin" element={<AdminHomePage />} />
              <Route path="/admin/employees" element={<EmployeesPage />} />
              <Route path="/admin/projects" element={<ProjectsPage />} />
              <Route path="/admin/reportspage" element={<ReportsPage />} />
              <Route path="/admin/tasks" element={<AdminTasksPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* New Admin Management Routes */}
              {/* <Route path="/admin/manage-employees" element={<ManageEmployees />} /> */}
              {/* <Route path="/admin/manage-projects" element={<ManageProjects />} /> */}
              <Route path="/admin/manage-tasks" element={<ManageTasks />} /> {/* Ensure it's imported */}
              <Route path="/admin/manage-leaves" element={<ManageLeaves />} />
              <Route path="/admin/manage-clockin" element={<ManageClockIn />} /> {/* Path casing fixed */}
            
              {/* Reports Management Routes */}
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reports/leaves-balance" element={<LeavesBalanceReport />} />
              <Route path="/reports/leaves-request" element={<LeaveRequestReport />} />
              <Route path="/reports/work-hours" element={<WorkHoursReport />} />
              <Route path="/reports/project-task" element={<ProjectTaskReport />} />
              <Route path="/reports/billable-hours" element={<BillableHoursReport />} />
              <Route path="/reports/performance-metrics" element={<PerformanceMetricsReport />} />
            </>
          )}
        </Routes>
      </div>  
    </Router>  
  );  
}  

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
