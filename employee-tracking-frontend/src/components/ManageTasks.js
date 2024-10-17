import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // Import the authentication context
import TaskModal from './TaskModal'; // Import the modal component
import Toast from './Toast'; // Import the toast component

const ManageTasks = () => {
  const { token } = useAuth(); // Get the auth token from context
  const [tasks, setTasks] = useState([]); // State to hold the list of tasks
  const [users, setUsers] = useState([]); // State to hold the list of users for assigning tasks
  const [error, setError] = useState(null); // State to handle errors
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [currentTask, setCurrentTask] = useState(null); // State to hold the task being edited or created
  const [toastMessage, setToastMessage] = useState(''); // State for toast messages
  const [showToast, setShowToast] = useState(false); // State to control toast visibility

  // Fetch tasks and users when component mounts
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

const handleOpenModal = (task = null) => {
  setCurrentTask(task);
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setCurrentTask(null); // Clear the current task when modal closes
};

const handleTaskSubmit = async (taskData) => {
  try {
    if (currentTask) {
      // Update existing task
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
    const response = await axios.put(
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
    const response = await axios.put(
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

// Delete a task
const handleDeleteTask = async (taskId) => {
  try {
    await axios.delete(`http://localhost:8000/admin-dashboard/api/tasks/${taskId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setToastMessage('Task deleted successfully!');
    setShowToast(true);
  } catch (err) {
    setError('Error deleting task.');
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Tasks</h2>
      <button 
        onClick={() => handleOpenModal()}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition"
      >
        Add Task
      </button>

      {/* Display error message */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Display tasks in a table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Task Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{task.name}</td>
                <td className="px-4 py-2">{task.description}</td>
                <td className="px-4 py-2">{task.due_date}</td>
                <td className="px-4 py-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    className="border border-gray-300 rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="awaiting_approval">Awaiting Approval</option>
                    <option value="extension_approved">Extension Approved</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={task.assigned_to || ''} // Handling unassigned tasks
                    onChange={(e) => handleAssignTask(task.id, e.target.value)}
                    className="border border-gray-300 rounded p-1"
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 flex space-x-3">
                  <button 
                    onClick={() => handleOpenModal(task)} 
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleTaskSubmit}
        task={currentTask}
        users={users} // Pass users for assigning in the modal
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} isOpen={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};

export default ManageTasks;
