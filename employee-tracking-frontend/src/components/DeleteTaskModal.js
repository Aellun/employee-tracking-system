import React from 'react';
import '../css/DeleteTaskModal.css'; // Import the custom CSS
const DeleteTaskModal = ({ isOpen, onClose, onDelete, task }) => {
  console.log("Modal open state:", isOpen);
  console.log("Task to delete:", task);
  
  // Return null if the modal is not open
  if (!isOpen) return null;


  return (
    <>
      {/* Modal Overlay */}
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-10"></div>

      {/* Modal Content */}
      <div className="modal-container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg z-20">
        <h2 className="text-xl font-bold mb-4">Delete Task</h2>
        <p className="mb-4">Are you sure you want to delete the task "{task?.name}"? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={onClose} // Close modal
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onDelete} // Confirm deletion
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteTaskModal;
