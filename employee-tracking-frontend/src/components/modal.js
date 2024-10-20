import React, { useState, useEffect } from 'react';
import '../css/modal.css'; // Ensure to add your styles

const Modal = ({ isOpen, onClose, task, onSubmit, users }) => {
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    due_date: '',
    assigned_to: '',
    status: 'pending', // Default status
  });

  useEffect(() => {
    if (task) {
      setTaskData({
        name: task.name,
        description: task.description,
        due_date: task.due_date,
        assigned_to: task.assigned_to,
        status: task.status,
      });
    } else {
      setTaskData({
        name: '',
        description: '',
        due_date: '',
        assigned_to: '',
        status: 'pending',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(taskData);
  };

  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{task ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Task Name:</label>
            <input
              type="text"
              name="name"
              value={taskData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Due Date:</label>
            <input
              type="date"
              name="due_date"
              value={taskData.due_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Status:</label>
            <select
              name="status"
              value={taskData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="awaiting_approval">Awaiting Approval</option>
              <option value="extension_approved">Extension Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label>Assign To:</label>
            <select
              name="assigned_to"
              value={taskData.assigned_to}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
