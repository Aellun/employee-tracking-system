import React, { useState } from 'react';  
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';  
import Navbar from './components/Navbar';
import Login from './components/Login';  
import TasksPage from './pages/TasksPage';  
import TimeTrackerPage from './pages/TimeTrackerPage';  
import TimesheetPage from './pages/TimesheetPage';  
import AdminNavbar from './components/AdminNavbar';  
import EmployeesPage from './pages/EmployeesPage';  
import ProjectsPage from './pages/ProjectsPage';  
import ReportsPage from './pages/ReportsPage';  
import HomePage from './pages/HomePage'; // Home page for employees
import AdminHomePage from './pages/AdminHomePage'; // Admin home page
import TimeClock from './components/TimeClock';
import AdminTasksPage from './pages/AdminTasksPage';

function App() {  
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false); // State to manage Time Clock visibility
  const isAdmin = true; // Example: change based on user role  
  const token = localStorage.getItem('token'); // Check if user is logged in

  return (  
    <Router>  
      <div>  
        {/* Only show Navbar or AdminNavbar if the user is logged in */}
        {token && (window.location.pathname.startsWith('/admin') ? <AdminNavbar /> : <Navbar />)}  
        
        {/* Render the Time Clock window conditionally */}
        {isTimeClockOpen && (
          <TimeClock onClose={() => setIsTimeClockOpen(false)} /> // Pass the close function as a prop
        )}
        
        <Routes>  
          {/* If not logged in, redirect to login page */}
          <Route path="/" element={token ? <Navigate to={isAdmin ? "/admin" : "/HomePage"} /> : <Login />} />
          
          {/* Protected Routes */}
          <Route path="/HomePage" element={token ? <HomePage /> : <Navigate to="/" />} />  
          <Route path="/tasks" element={token ? <TasksPage /> : <Navigate to="/" />} />  
          <Route path="/track" element={token ? <TimeTrackerPage /> : <Navigate to="/" />} />  
          <Route path="/timesheet" element={token ? <TimesheetPage /> : <Navigate to="/" />} />
          <Route path="/clockin" element={token ? <TimeClock /> : <Navigate to="/" />} />  
          
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

export default App;  
