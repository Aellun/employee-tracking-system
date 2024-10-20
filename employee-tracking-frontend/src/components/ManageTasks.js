import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import TaskModal from './TaskModal';
import DeleteTaskModal from './DeleteTaskModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from './Toast';
import { format } from 'date-fns';

const ManageTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');
  const [taskLimit, setTaskLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  
  // Fetch tasks and users when component mounts
  useEffect(() => {
    const fetchTasksAndUsers = async () => {
      try {
        const tasksResponse = await axios.get('http://localhost:8000/admin-dashboard/api/tasks/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(tasksResponse.data);

        const usersResponse = await axios.get('http://localhost:8000/admin-dashboard/api/employees/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);
      } catch (err) {
        setError('Error fetching tasks or users.');
      }
    };

    fetchTasksAndUsers();
  }, [token]);

  // Open task modal for editing or creating
  const handleOpenModal = (task = null) => {
    if (task) {
      console.log('Editing task:', task); // Log the task being edited
    } else {
      console.log('Creating a new task'); // Log when creating a new task
    }
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null); // Clear the current task when modal closes
  };

  // Submit task changes (edit/create)
  const handleTaskSubmit = async (taskData) => {
    try {
      if (currentTask) {
        // Update task
        const response = await axios.put(
          `http://localhost:8000/admin-dashboard/api/tasks/${currentTask.id}/`,
          taskData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === currentTask.id ? response.data : task))
        );
        setToastMessage('Task updated successfully!');
      } else {
        // Create new task
        const response = await axios.post(
          'http://localhost:8000/admin-dashboard/api/tasks/',
          taskData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks((prevTasks) => [...prevTasks, response.data]);
        setToastMessage('Task created successfully!');
      }
      setShowToast(true);
    } catch (err) {
      setError('Error creating or updating task.');
    }
  };

  // Update task status
  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/admin-dashboard/api/tasks/${taskId}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: response.data.status } : task
        )
      );
      setToastMessage('Task status updated successfully!');
      setShowToast(true);
    } catch (err) {
      setError('Error updating task status.');
    }
  };

  // Assign or change task assignee
  const handleAssignTask = async (taskId, userId) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/admin-dashboard/api/tasks/${taskId}/`,
        { assigned_to: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, assigned_to: response.data.assigned_to } : task
        )
      );
      setToastMessage('Task assigned successfully!');
      setShowToast(true);
    } catch (err) {
      setError('Error assigning task.');
    }
  };

 // Delete task after confirmation
 const handleDeleteTask = async (taskId) => {
  // Show confirmation dialog
  const confirmed = window.confirm(`Are you sure you want to delete the task: ${taskId}?`);

  if (confirmed) {
    try {
      await axios.delete(`http://localhost:8000/admin-dashboard/api/tasks/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the task from the state after successful deletion
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      setToastMessage(`Task "${taskId}" deleted successfully!`);
      setShowToast(true);

      // Hide the toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

    } catch (err) {
      setError('Error deleting task.');
    }
  }
};

  // Pagination and task filtering
  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  const filteredTasks = tasks
    .filter((task) => {
      return (
        (filterStatus === '' || task.status === filterStatus) &&
        (filterAssignedTo === '' || task.assigned_to === filterAssignedTo) &&
        (filterDueDate === '' || format(new Date(task.due_date), 'yyyy-MM-dd') === filterDueDate)
      );
    })
    .slice((currentPage - 1) * taskLimit, currentPage * taskLimit);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Tasks</h2>

      {/* Add Task Button */}
      <button
        onClick={() => handleOpenModal()} // Open modal for new task
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Task
      </button>

      {/* Task Filters */}
      <div className="mb-4 flex space-x-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="">Filter by Status</option>
          <option value="pending">Pending</option>
          <option value="awaiting_approval">Awaiting Approval</option>
          <option value="extension_approved">Extension Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterAssignedTo}
          onChange={(e) => setFilterAssignedTo(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="">Filter by Assignee</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterDueDate}
          onChange={(e) => setFilterDueDate(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />

        <select
          value={taskLimit}
          onChange={(e) => setTaskLimit(Number(e.target.value))}
          className="border border-gray-300 p-2 rounded"
        >
          <option value={10}>Show 10 tasks</option>
          <option value={50}>Show 50 tasks</option>
          <option value={100}>Show 100 tasks</option>
          <option value={400}>Show 400 tasks</option>
          <option value={500}>Show 500 tasks</option>
        </select>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Task Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => (
              <tr key={task.id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{(currentPage - 1) * taskLimit + index + 1}</td>
                <td className="px-4 py-2">{task.name}</td>
                <td className="px-4 py-2">{task.description}</td>
                <td className="px-4 py-2">{format(new Date(task.due_date), 'MMM dd, yyyy')}</td>
                <td className="px-4 py-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    className="border border-gray-300 p-2 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="awaiting_approval">Awaiting Approval</option>
                    <option value="extension_approved">Extension Approved</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={task.assigned_to}
                    onChange={(e) => handleAssignTask(task.id, e.target.value)}
                    className="border border-gray-300 p-2 rounded"
                  >
                    <option value="">Select Assignee</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(task)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="bg-gray-300 px-4 py-2 rounded">
          Previous
        </button>
        <button onClick={handleNextPage} className="bg-gray-300 px-4 py-2 rounded">
          Next
        </button>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleTaskSubmit}
        currentTask={currentTask}
        users={users}
      />

      

      {/* Toast Notification */}
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default ManageTasks;
