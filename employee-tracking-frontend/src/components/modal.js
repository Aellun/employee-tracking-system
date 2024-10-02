// modal.js
import React from 'react';
import './css/modal.css'; // Ensure to add your styles

const Modal = ({ isOpen, onClose, title, content, actions }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        {content}
        <div className="modal-actions">{actions}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
