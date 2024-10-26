import React from 'react';
import '../../css/DeleteConfirmation.css';

const DeleteConfirmation = ({ onClose, onConfirm }) => (
  <div className="modal-overlay">
    <div className="confirmation-modal">
      <p>Are you sure you want to delete this project?</p>
      <button onClick={onConfirm}>Yes, Delete</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  </div>
);

export default DeleteConfirmation;
