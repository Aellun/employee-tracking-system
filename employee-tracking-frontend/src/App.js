import React, { useState } from 'react'; 
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';  
import { AuthProvider, useAuth } from './AuthProvider'; // Import the AuthProvider
import Login from './components/Login';  
import TasksPage from './pages/TasksPage';  
import TimeTrackerPage from './pages/TimeTrackerPage';  
import TimesheetPage from './pages/TimesheetPage';  
import EmployeesPage from './pages/EmployeesPage';  
import ProjectsPage from './pages/ProjectsPage';  
import ReportsPage from './pages/ReportsPage';  
import HomePage from './pages/HomePage'; // Home page for employees
import AdminHomePage from './pages/AdminHomePage'; // Admin home page
import TimeClock from './components/TimeClock';
import AdminTasksPage from './pages/AdminTasksPage';
import LeaveRequestForm from './components/LeaveRequestForm';
import LeavePage from './pages/LeavePage';
import AdminDashboard from './components/AdminDashboard'; // New admin dashboard component
import ManageUsers from './components/ManageUsers'; // Component for managing users
import ManageProjects from './components/ManageProjects'; // Component for managing projects
import ManageTasks from './components/ManageTasks'; // Component for managing tasks
import ManageLeaves from './components/ManageLeaves'; // Component for managing leave requests

function App() {  
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false); // State to manage Time Clock visibility
  const { token, isAdmin } = useAuth(); // Get auth values from context

  return (  
    <Router> {/* Replaced HashRouter with BrowserRouter */}
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
          <Route path="/clockin" element={token ? <TimeClock /> : <Navigate to="/" />} />
          
          {/* Leave Request Form Route */}
          <Route path="/leave" element={token ? <LeavePage /> : <Navigate to="/" />} />
          
          {/* Admin Routes */}
          {isAdmin && (
            <>
              <Route path="/admin" element={token ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="/admin/employees" element={token ? <EmployeesPage /> : <Navigate to="/" />} />
              <Route path="/admin/projects" element={token ? <ProjectsPage /> : <Navigate to="/" />} />
              <Route path="/admin/reports" element={token ? <ReportsPage /> : <Navigate to="/" />} />
              <Route path="/admin/tasks" element={token ? <AdminTasksPage /> : <Navigate to="/" />} />
              
              {/* New Admin Management Routes */}
              <Route path="/admin/manage-users" element={token ? <ManageUsers /> : <Navigate to="/" />} />
              <Route path="/admin/manage-projects" element={token ? <ManageProjects /> : <Navigate to="/" />} />
              <Route path="/admin/manage-tasks" element={token ? <ManageTasks /> : <Navigate to="/" />} />
              <Route path="/admin/manage-leaves" element={token ? <ManageLeaves /> : <Navigate to="/" />} />
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
