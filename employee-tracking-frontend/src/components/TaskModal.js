import React, { useState, useEffect } from 'react';
import '../css/modal.css'; // Import the custom CSS

const TaskModal = ({ isOpen, onClose, onSubmit, currentTask, users }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Populate the form fields when editing a task
  useEffect(() => {
    if (currentTask) {
      setName(currentTask.name);
      setDescription(currentTask.description);
      setDueDate(currentTask.due_date ? currentTask.due_date.split('T')[0] : '');
      setStatus(currentTask.status);
      setAssignedTo(currentTask.assigned_to);
    }
  }, [currentTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { name, description, due_date: dueDate, status, assigned_to: assignedTo };
    onSubmit(taskData);
    
    // Clear the form data after submission
    setName('');
    setDescription('');
    setDueDate('');
    setStatus('');
    setAssignedTo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className={`modal-overlay ${isOpen ? 'active' : ''}`}></div>

      {/* Modal Content */}
      <div className={`modal-container ${isOpen ? 'active' : ''}`}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>

        <h2 className="text-center text-xl font-semibold text-gray-800 mb-4">
          {currentTask ? 'Edit Task' : 'Add Task'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-bold text-gray-700">Task Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold text-gray-700">Description</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold text-gray-700">Due Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={dueDate}
              min={today}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold text-gray-700">Status</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="pending">Pending</option>
              <option value="awaiting_approval">Awaiting Approval</option>
              <option value="extension_approved">Extension Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold text-gray-700">Assigned To</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            >
              <option value="">Select Assignee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mr-4"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TaskModal;
