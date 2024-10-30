import React, { useState, useEffect } from 'react';

const TaskForm = ({ currentTask, setCurrentTask, handleFormSubmit, onClose, employees, projects, isEditMode }) => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [project, setProject] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Log the currentTask prop
  useEffect(() => {
    console.log('Current Task:', currentTask);
    if (currentTask) {
      setTaskName(currentTask.name || '');
      setTaskDescription(currentTask.description || '');
      setDueDate(currentTask.due_date || '');
      setStatus(currentTask.status || 'pending');
      setAssignedTo(currentTask.assigned_to || '');
      setProject(currentTask.project || '');
    }
  }, [currentTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      name: taskName,
      description: taskDescription,
      due_date: dueDate,
      status,
      assigned_to: assignedTo,
      project,
    };

    console.log('Submitting Task:', newTask);

    try {
      await handleFormSubmit(newTask);
      setFeedbackMessage('Task submitted successfully!');
      setFeedbackType('success');

      setTimeout(() => {
        setFeedbackMessage('');
        onClose();
        setCurrentTask({}); // Clear the current task after submission
      }, 2000);
    } catch (error) {
      console.error('Error during form submission:', error);
      setFeedbackMessage('Failed to submit task. Please try again.');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000); // Clear error message after 3 seconds
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    switch (name) {
      case 'taskName':
        setTaskName(value);
        setCurrentTask((prevState) => ({ ...prevState, name: value }));
        break;
      case 'taskDescription':
        setTaskDescription(value);
        setCurrentTask((prevState) => ({ ...prevState, description: value }));
        break;
      case 'dueDate':
        setDueDate(value);
        setCurrentTask((prevState) => ({ ...prevState, due_date: value }));
        break;
      case 'status':
        setStatus(value);
        setCurrentTask((prevState) => ({ ...prevState, status: value }));
        break;
      case 'assignedTo':
        setAssignedTo(value);
        setCurrentTask((prevState) => ({ ...prevState, assigned_to: value }));
        break;
      case 'project':
        setProject(value);
        setCurrentTask((prevState) => ({ ...prevState, project: value }));
        break;
      default:
        console.log('Unknown input field:', name);
    }
  };

  return (
    <div style={overlayStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 className="text-lg font-semibold mb-4">{isEditMode ? 'Edit Task' : 'Add Task'}</h3>

        {feedbackMessage && (
          <div className={`mb-4 text-center ${feedbackType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {feedbackMessage}
          </div>
        )}

        <input
          type="text"
          name="taskName"
          placeholder="Task Name"
          className="w-full px-3 py-2 border rounded"
          value={taskName}
          onChange={handleInputChange}
          required
        />

        <textarea
          name="taskDescription"
          placeholder="Description"
          className="w-full px-3 py-2 border rounded"
          value={taskDescription}
          onChange={handleInputChange}
        />

        <input
          type="date"
          name="dueDate"
          className="w-full px-3 py-2 border rounded"
          value={dueDate}
          onChange={handleInputChange}
          required
          min={new Date().toISOString().split('T')[0]}
        />

        <select
          name="status"
          className="w-full px-3 py-2 border rounded"
          value={status}
          onChange={handleInputChange}
        >
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="extension_approved">Extension Approved</option>
          <option value="awaiting_approval">Awaiting Approval</option>
        </select>

        <select
          name="assignedTo"
          className="w-full px-3 py-2 border rounded"
          value={assignedTo}
          onChange={handleInputChange}
          required
        >
          <option value="" disabled>Select Assigned To</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name}
            </option>
          ))}
        </select>

        <select
          name="project"
          className="w-full px-3 py-2 border rounded"
          value={project}
          onChange={handleInputChange}
        >
          <option value="">Select a project</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => {
              onClose();
              setCurrentTask({});
              setFeedbackMessage('');
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Inline styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const formStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  width: '400px',
};

export default TaskForm;
