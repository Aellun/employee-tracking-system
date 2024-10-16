import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // Import the authentication context

const ManageTasks = () => {
  const { token } = useAuth(); // Get the auth token from context
  const [tasks, setTasks] = useState([]); // State to hold the list of tasks
  const [users, setUsers] = useState([]); // State to hold the list of users for assigning tasks
  const [error, setError] = useState(null); // State to handle errors

  // Fetch tasks and users when component mounts
  useEffect(() => {
    const fetchTasksAndUsers = async () => {
      try {
        const tasksResponse = await axios.get('/api/tasks/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(tasksResponse.data);

        const usersResponse = await axios.get('/api/users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);
      } catch (err) {
        setError('Error fetching tasks or users.');
      }
    };

    fetchTasksAndUsers();
  }, [token]);

  // Update task status
  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const response = await axios.put(
        `/api/tasks/${taskId}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: response.data.status } : task
        )
      );
    } catch (err) {
      setError('Error updating task status.');
    }
  };

  // Assign or change task assignee
  const handleAssignTask = async (taskId, userId) => {
    try {
      const response = await axios.put(
        `/api/tasks/${taskId}/`,
        { assigned_to: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, assigned_to: response.data.assigned_to } : task
        )
      );
    } catch (err) {
      setError('Error assigning task.');
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError('Error deleting task.');
    }
  };

  return (
    <div>
      <h2>Manage Tasks</h2>

      {/* Display error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display tasks in a table */}
      <table>
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.name}</td>
              <td>{task.description}</td>
              <td>{task.due_date}</td>
              <td>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="awaiting_approval">Awaiting Approval</option>
                  <option value="extension_approved">Extension Approved</option>
                </select>
              </td>
              <td>
                <select
                  value={task.assigned_to}
                  onChange={(e) => handleAssignTask(task.id, e.target.value)}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageTasks;
