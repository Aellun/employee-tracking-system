import React, { useState } from 'react';

const TaskForm = ({ currentTask, setCurrentTask, handleFormSubmit, closeModal, employees, projects, isEditMode }) => {
  const [taskName, setTaskName] = useState(currentTask.name || '');
  const [taskDescription, setTaskDescription] = useState(currentTask.description || '');
  const [dueDate, setDueDate] = useState(currentTask.due_date || '');
  const [status, setStatus] = useState(currentTask.status || 'pending');
  const [assignedTo, setAssignedTo] = useState(currentTask.assigned_to || '');
  const [project, setProject] = useState(currentTask.project || '');
  
  // New state for feedback message
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      name: taskName,
      description: taskDescription,
      due_date: dueDate,
      status: status,
      assigned_to: assignedTo,
      project: project,
    };

    console.log('Form submitted', newTask);
    
    // Try to submit the task and provide feedback
    try {
      await handleFormSubmit(newTask); // Await the submission if it's a promise
      
      // Provide success feedback
      setFeedbackMessage('Task submitted successfully!');
      setFeedbackType('success');
    } catch (error) {
      // Provide error feedback
      setFeedbackMessage('Failed to submit task. Please try again.');
      setFeedbackType('error');
    }

    // Reset the form and close the modal after a short delay
    setTimeout(() => {
      setCurrentTask({});
      closeModal();
      setFeedbackMessage(''); // Clear feedback message
    }, 2000); // Feedback will show for 2 seconds
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch(name) {
      case 'taskName':
        setTaskName(value);
        setCurrentTask(prevState => ({ ...prevState, name: value }));
        break;
      case 'taskDescription':
        setTaskDescription(value);
        setCurrentTask(prevState => ({ ...prevState, description: value }));
        break;
      case 'dueDate':
        setDueDate(value);
        setCurrentTask(prevState => ({ ...prevState, due_date: value }));
        break;
      case 'status':
        setStatus(value);
        setCurrentTask(prevState => ({ ...prevState, status: value }));
        break;
      case 'assignedTo':
        setAssignedTo(value);
        setCurrentTask(prevState => ({ ...prevState, assigned_to: value }));
        break;
      case 'project':
        setProject(value);
        setCurrentTask(prevState => ({ ...prevState, project: value }));
        break;
      default:
        console.log('Unknown input field:', name);
    }
  };

  return (
    <div style={overlayStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 className="text-lg font-semibold mb-4">{isEditMode ? 'Edit Task' : 'Add Task'}</h3>

        {/* Feedback Message */}
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
          value={dueDate || ''}
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
              closeModal();
              setCurrentTask({}); // Reset the form on close
              setFeedbackMessage(''); // Clear feedback message on close
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Inline styles for the overlay and form
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000, // Ensure it appears on top of other elements
};

const formStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  width: '400px', // Adjust width as necessary
};

export default TaskForm;
