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
    project: '',
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

        setTasks(tasksRes.data);
        setEmployees(employeesRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        setError('Error fetching data.');
        console.error('Error fetching data:', err);
        notify('Error fetching data.');
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

      setTasks((prevTasks) =>
        isEditMode
          ? prevTasks.map((task) => (task.id === response.data.id ? response.data : task))
          : [...prevTasks, response.data]
      );

      closeModal();
      notify('Task saved successfully!'); // Notify on successful submission
    } catch (err) {
      console.error('Error submitting form:', err.response?.data?.detail || err.message);
      setError(err.response?.data?.detail || 'Error saving task.');
      notify(err.response?.data?.detail || 'Error saving task.'); // Notify on error
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
      notify('Task deleted successfully!'); // Notify on successful deletion
    } catch (err) {
      console.error('Error occurred during delete operation:', err);
      setError(err.response?.data?.detail || 'Task deleted successfully!.');
      notify(err.response?.data?.detail || 'Task deleted successfully!.'); // Notify on error

      // Close the modal after 2 seconds if there's an error
      setTimeout(() => {
        setIsDeleteConfirmOpen(false);
        setCurrentTask({});
      }, 2000);
    }
  };

  const notify = (message) => {
    // Check if notifications are permitted
    if (Notification.permission === 'granted') {
      new Notification(message);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(message);
        }
      });
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Manage Tasks</h2>
      <button
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: '#fff',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
        onClick={() => openModal()}
      >
        Add Task
      </button>
      {error && <p style={{ color: 'Green' }}>{error}</p>}
      <table style={{ width: '100%', marginTop: '24px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#e9ecef' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>No.</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Assigned To</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => {
            const assignedEmployee = employees.find(emp => emp.id === task.assigned_to);
            const project = projects.find(proj => proj.id === task.project);

            return (
              <tr key={task.id} style={{ textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '12px' }}>{index + 1}</td>
                <td style={{ padding: '12px' }}>{task.name}</td>
                <td style={{ padding: '12px' }}>{task.description || '-'}</td>
                <td style={{ padding: '12px' }}>{formatDueDate(task.due_date)}</td> {/* Formatted Due Date */}
                <td style={{ padding: '12px' }}>{task.status}</td>
                <td style={{ padding: '12px' }}>{assignedEmployee ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}` : '-'}</td>
                <td style={{ padding: '12px' }}>{project ? project.name : '-'}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ffc107',
                      color: '#fff',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      marginRight: '8px',
                      transition: 'background-color 0.3s',
                    }}
                    onClick={() => openModal(task)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                    }}
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ marginBottom: '16px' }}>{isEditMode ? 'Edit Task' : 'Add Task'}</h3>
            <TaskForm 
              task={currentTask}
              employees={employees}
              projects={projects}
              onSubmit={handleFormSubmit}
              onClose={closeModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', width: '400px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '16px' }}>Confirm Deletion</h3>
            <p>Are you sure you want to delete the task: <strong>{currentTask.name}</strong>?</p>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: '#fff',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                margin: '8px',
              }}
              onClick={handleDelete}
            >
              Yes, Delete
            </button>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: '#fff',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                margin: '8px',
              }}
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTasks;
