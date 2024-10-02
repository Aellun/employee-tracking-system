import React, { useState } from 'react';  
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
import TimeClock from './components/TimeClock';
import AdminTasksPage from './pages/AdminTasksPage';

function App() {  
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false); // State to manage Time Clock visibility
  const isAdmin = true; // Example: change based on user role  

  return (  
    <Router>  
      <div>  
        {window.location.pathname.startsWith('/admin') ? <AdminNavbar /> : <Navbar />}  
        
        {/* Render the Time Clock window conditionally */}
        {isTimeClockOpen && (
          <TimeClock onClose={() => setIsTimeClockOpen(false)} /> // Pass the close function as a prop
        )}
        
        <Routes>  
          <Route path="/" element={<HomePage />} />  
          <Route path="/tasks" element={<TasksPage />} />  
          <Route path="/track" element={<TimeTrackerPage />} />  
          <Route path="/timesheet" element={<TimesheetPage />} />
          <Route path="/clockin" element={<TimeClock />} />  
          {isAdmin && (  
            <>  
              <Route path="/admin" element={<AdminHomePage />} />  
              <Route path="/admin/employees" element={<EmployeesPage />} />  
              <Route path="/admin/projects" element={<ProjectsPage />} />  
              <Route path="/admin/reports" element={<ReportsPage />} /> 
              <Route path="/admin/tasks" element={<AdminTasksPage />} /> 
            </>  
          )}  
        </Routes>  
      </div>  
    </Router>  
  );  
}  

export default App;  
