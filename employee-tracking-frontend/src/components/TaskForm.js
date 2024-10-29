// src/components/TaskForm.js
import React from 'react';

const TaskForm = ({ currentTask, setCurrentTask, handleFormSubmit, closeModal, employees, projects, isEditMode }) => (
  <form onSubmit={handleFormSubmit} className="space-y-4 p-8">
    <h3 className="text-lg font-semibold mb-4">{isEditMode ? 'Edit Task' : 'Add Task'}</h3>
    <input
      type="text"
      placeholder="Task Name"
      className="w-full px-3 py-2 border rounded"
      value={currentTask.name || ''}
      onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
      required
    />
    <textarea
      placeholder="Description"
      className="w-full px-3 py-2 border rounded"
      value={currentTask.description || ''}
      onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
    />
    <input
      type="date"
      className="w-full px-3 py-2 border rounded"
      value={currentTask.due_date || ''}
      onChange={(e) => setCurrentTask({ ...currentTask, due_date: e.target.value })}
      required
      min={new Date().toISOString().split('T')[0]} // Restrict to present and future dates
    />
    <select
      className="w-full px-3 py-2 border rounded"
      value={currentTask.status || 'Pending'}
      onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
    >
      <option value="Pending">Pending</option>
      <option value="Completed">Completed</option>
      <option value="In Progress">In Progress</option>
      <option value="Extension Approved">Extension Approved</option>
      <option value="Waiting Approval">Waiting Approval</option>
    </select>
    <select
      className="w-full px-3 py-2 border rounded"
      value={currentTask.assigned_to || ''}
      onChange={(e) => setCurrentTask({ ...currentTask, assigned_to: e.target.value })}
      required
    >
      <option value="" enabled>Select Assigned To</option>
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.first_name} {employee.last_name}
        </option>
      ))}
    </select>
    <select
      className="w-full px-3 py-2 border rounded"
      value={currentTask.project_id || ''}
      onChange={(e) => setCurrentTask({ ...currentTask, project_id: e.target.value })}
      required
    >
      <option value="" enabled>Select Project</option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
    <div className="flex justify-end space-x-4">
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save
      </button>
      <button
        type="button"
        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        onClick={closeModal}
      >
        Cancel
      </button>
    </div>
  </form>
);

export default TaskForm;
