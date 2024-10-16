import React from 'react';  
import { Link, useNavigate } from 'react-router-dom';  
import { useAuth } from '../AuthProvider';  
import { FaUser, FaCog, FaUserFriends, FaProjectDiagram, FaChartLine, FaTasks, FaCalendarAlt, FaClock } from 'react-icons/fa';  

const AdminHomePage = () => {  
  const { logout, token } = useAuth();  
  const navigate = useNavigate();  

  const handleLogout = () => {  
    logout();  
    navigate('/');  
  };  

  return (  
    <div className="flex flex-col h-screen">  
      <div className="flex flex-grow">  
        {/* Sidebar */}  
        <aside className="w-64 bg-gray-800 text-white flex flex-col">  
          <div className="p-6 border-b border-gray-700">  
            <h2 className="text-xl font-bold">Admin Panel</h2>  
          </div>  
          <nav className="flex-grow px-4 py-6 space-y-4">  
            <Link to="/admin/employees" className="flex items-center space-x-2 py-2 px-4 rounded hover:text-orange-400 transition-colors duration-200">  
              <FaUserFriends />  
              <span>Employees</span>  
            </Link>  
            <Link to="/admin/projects" className="flex items-center space-x-2 py-2 px-4 rounded hover:text-orange-400 transition-colors duration-200">  
              <FaProjectDiagram />  
              <span>Projects</span>  
            </Link>  
            <Link to="/admin/reports" className="flex items-center space-x-2 py-2 px-4 rounded hover:text-orange-400 transition-colors duration-200">  
              <FaChartLine />  
              <span>Reports</span>  
            </Link>  
            <Link to="/admin/manage-tasks" className="flex items-center space-x-2 py-2 px-4 rounded hover:text-orange-400 transition-colors duration-200">  
              <FaTasks />  
              <span>Manage Tasks</span>  
            </Link>  
            <Link to="/admin/manage-leaves" className="flex items-center space-x-2 py-2 px-4 rounded hover:text-orange-400 transition-colors duration-200">  
              <FaCalendarAlt />  
              <span>Manage Leaves</span>  
            </Link>  
            <Link to="/clockin" className="flex items-center space-x-2 py-2 px-4 rounded hover:text-orange-400 transition-colors duration-200">  
              <FaClock />  
              <span>Clock In</span>  
            </Link>  
          </nav>  
          <div className="p-4 border-t border-gray-700">  
            {token && (  
              <button  
                onClick={handleLogout}  
                className="w-full bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-all"  
              >  
                Logout  
              </button>  
            )}  
          </div>  
        </aside>  

        {/* Main Content Area */}  
        <div className="flex flex-col flex-grow">  
          {/* Navbar */}  
          <nav className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center">  
            <h1 className="text-lg font-semibold">Admin Employee Management System</h1>  
            <div className="flex items-center space-x-4">  
              <Link to="/settings" className="flex items-center space-x-2 hover:text-orange-400 transition-colors duration-200">  
                <FaUser className="text-orange-400" />  
                <span>Admin</span>  
              </Link>  
              <Link to="/settings" className="flex items-center space-x-2 hover:text-orange-400 transition-colors duration-200">  
                <FaCog />  
                <span>Settings</span>  
              </Link>  
            </div>  
          </nav>  

          {/* Main Content */}  
          <div className="flex-grow p-8 bg-gray-100">  
            <h1 className="text-3xl font-bold mb-4">Welcome to the Admin Dashboard</h1>  
            <p className="text-lg">  
              Here you can manage employees, projects, reports, tasks, and leaves. Use the navigation on the left to access different sections.  
            </p>  
          </div>  

          {/* Footer */}  
          <footer className="bg-gray-900 text-white text-center p-4 border-t border-gray-700">  
            <p className="hover:text-orange-400 transition-colors duration-200">  
              &copy; {new Date().getFullYear()} Admin Employee Management System. All rights reserved.  
            </p>  
          </footer>  
        </div>  
      </div>  
    </div>  
  );  
};  

export default AdminHomePage;