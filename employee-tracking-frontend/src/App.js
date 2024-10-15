import React, { useState } from 'react'; 
import RedirectToLocalhost from './RedirectToLocalhost';  // Import the Redirect component
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

function App() {  
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false); // State to manage Time Clock visibility
  const { token, isAdmin } = useAuth(); // Get auth values from context

  return (  
    <Router>  
      <RedirectToLocalhost /> {/* Add the RedirectToLocalhost component here */}

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
          <Route path="/track" element={token ? <TimeTrackerPage /> : <Navigate to="/" />} />
          <Route path="/timesheet" element={token ? <TimesheetPage /> : <Navigate to="/" />} />
          <Route path="/clockin" element={token ? <TimeClock /> : <Navigate to="/" />} />

          {/* Admin Routes */}
          {isAdmin && (
            <>
              <Route path="/admin" element={token ? <AdminHomePage /> : <Navigate to="/" />} />
              <Route path="/admin/employees" element={token ? <EmployeesPage /> : <Navigate to="/" />} />
              <Route path="/admin/projects" element={token ? <ProjectsPage /> : <Navigate to="/" />} />
              <Route path="/admin/reports" element={token ? <ReportsPage /> : <Navigate to="/" />} />
              <Route path="/admin/tasks" element={token ? <AdminTasksPage /> : <Navigate to="/" />} />
              
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
