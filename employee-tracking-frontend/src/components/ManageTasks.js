// src/components/ManageTasks.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import TaskForm from './TaskForm';

const ManageTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, employeesRes, projectsRes] = await Promise.all([
          axios.get('http://localhost:8000/admin-dashboard/api/tasks/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/admin-dashboard/api/employees/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/admin-dashboard/api/projects/', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setTasks(tasksRes.data);
        setEmployees(employeesRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        setError('Error fetching data.');
      }
    };
    fetchData();
  }, [token]);

  const openModal = (task = {}) => {
    setCurrentTask(task);
    setIsEditMode(!!task.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask({});
    setError(null); // Clear error when closing modal
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = isEditMode
        ? await axios.put(`http://localhost:8000/admin-dashboard/api/tasks/${currentTask.id}/`, currentTask, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post('http://localhost:8000/admin-dashboard/api/tasks/', currentTask, {
            headers: { Authorization: `Bearer ${token}` },
          });

      // Update task list
      setTasks((prevTasks) =>
        isEditMode
          ? prevTasks.map((task) => (task.id === response.data.id ? response.data : task))
          : [...prevTasks, response.data]
      );

      closeModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving task.'); // Improved error handling
    }
  };

  const openDeleteConfirm = (task) => {
    setCurrentTask(task);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/admin-dashboard/api/tasks/${currentTask.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.id !== currentTask.id));
      setIsDeleteConfirmOpen(false);
      setCurrentTask({});
    } catch (err) {
      setError(err.response?.data?.detail || 'Error deleting task.'); // Improved error handling
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Tasks</h2>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => openModal()}
      >
        Add Task
      </button>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full mt-6 border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2">No.</th>
            <th className="py-2">Name</th>
            <th className="py-2">Description</th>
            <th className="py-2">Due Date</th>
            <th className="py-2">Status</th>
            <th className="py-2">Assigned To</th>
            <th className="py-2">Project</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id} className="text-center">
              <td className="py-2">{index + 1}</td>
              <td className="py-2">{task.name}</td>
              <td className="py-2">{task.description || '-'}</td>
              <td className="py-2">{task.due_date || '-'}</td>
              <td className="py-2">{task.status}</td>
              <td className="py-2">{task.assigned_to ? `${employees.find(emp => emp.id === task.assigned_to).first_name} ${employees.find(emp => emp.id === task.assigned_to).last_name}` : '-'}</td>
              <td className="py-2">{task.project_id ? projects.find(project => project.id === task.project_id).name : '-'}</td>
              <td className="py-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => openModal(task)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => openDeleteConfirm(task)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Task Form */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6">
            <TaskForm
              currentTask={currentTask}
              setCurrentTask={setCurrentTask}
              handleFormSubmit={handleFormSubmit}
              closeModal={closeModal}
              employees={employees}
              projects={projects}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6">
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            <p>Are you sure you want to delete this task?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTasks;
