import React from 'react';  
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  
import Navbar from './components/Navbar';  
import TasksPage from './pages/TasksPage';  
import TimeTrackerPage from './pages/TimeTrackerPage';  
import TimesheetPage from './pages/TimesheetPage';  
import AdminNavbar from './components/AdminNavbar';  
import EmployeesPage from './pages/EmployeesPage';  
import ProjectsPage from './pages/ProjectsPage';  
import ReportsPage from './pages/ReportsPage';  
import HomePage from './pages/HomePage'; // Home page for employees
import AdminHomePage from './pages/AdminHomePage'; // Admin home page

function App() {  
  // Replace this with your actual authentication logic  
  const isAdmin = true; // Example: change based on user role  

  return (  
    <Router>  
      <div>  
        {/* Render appropriate navbar based on the route */}
        {window.location.pathname.startsWith('/admin') ? <AdminNavbar /> : <Navbar />}  
        
        <Routes>  
          {/* Public Home Route for employees */}  
          <Route path="/" element={<HomePage />} /> {/* Home page for employees */}  

          {/* Public Routes for employees */}  
          <Route path="/tasks" element={<TasksPage />} />  
          <Route path="/track" element={<TimeTrackerPage />} />  
          <Route path="/timesheet" element={<TimesheetPage />} />  

          {/* Admin Routes */}  
          {isAdmin && (  
            <>  
              <Route path="/admin" element={<AdminHomePage />} /> {/* Admin landing page */}  
              <Route path="/admin/employees" element={<EmployeesPage />} />  
              <Route path="/admin/projects" element={<ProjectsPage />} />  
              <Route path="/admin/reports" element={<ReportsPage />} />  
            </>  
          )}  
        </Routes>  
      </div>  
    </Router>  
  );  
}  

export default App;  
