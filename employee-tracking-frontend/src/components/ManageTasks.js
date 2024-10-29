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
  const [currentTask, setCurrentTask] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'pending',
    assigned_to: '',
    project_id: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, employeesRes, projectsRes] = await Promise.all([
          axios.get('http://localhost:8000/admin-dashboard/api/tasks/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/admin-dashboard/api/employees/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/admin-dashboard/api/projects/', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // Log the fetched data
        console.log('Fetched Tasks:', tasksRes.data);
        console.log('Fetched Employees:', employeesRes.data);
        console.log('Fetched Projects:', projectsRes.data);

        setTasks(tasksRes.data);
        setEmployees(employeesRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        setError('Error fetching data.');
        console.error('Error fetching data:', err);
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
    setCurrentTask({}); // Reset current task
    setError(null); // Clear error when closing modal
  };

  const handleFormSubmit = async (newTask) => {
    try {
      const response = isEditMode
        ? await axios.put(`http://localhost:8000/admin-dashboard/api/tasks/${currentTask.id}/`, newTask, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post('http://localhost:8000/admin-dashboard/api/tasks/', newTask, {
            headers: { Authorization: `Bearer ${token}` },
          });

      console.log('Received response:', response.data);
      setTasks((prevTasks) =>
        isEditMode
          ? prevTasks.map((task) => (task.id === response.data.id ? response.data : task))
          : [...prevTasks, response.data]
      );

      closeModal();
    } catch (err) {
      console.error('Error submitting form:', err.response?.data?.detail || err.message);
      setError(err.response?.data?.detail || 'Error saving task.');
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
      setError(null); // Clear error after successful deletion
    } catch (err) {
      console.error('Error occurred during delete operation:', err);
      setError(err.response?.data?.detail || 'Deleted Successfully!.');
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
        {tasks.map((task, index) => {
              // Log each task to check the project_id
              console.log('Rendering Task:', task);
              const assignedEmployee = employees.find(emp => emp.id === task.assigned_to);
              const project = projects.find(proj => proj.id === task.project);

              return (
                <tr key={task.id} className="text-center">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{task.name}</td>
                  <td className="py-2">{task.description || '-'}</td>
                  <td className="py-2">{task.due_date || '-'}</td>
                  <td className="py-2">{task.status}</td>
                  <td className="py-2">{assignedEmployee ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}` : '-'}</td>
                  <td className="py-2">{project ? project.name : '-'}</td> {/* Make sure to access the project.name */}
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
            );
          })}
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
            {error && <p className="mt-2 text-red-500">{error}</p>}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setError(null); // Clear error if modal is closed without deletion
                }}
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
