import React, { useState, useEffect } from 'react';
import '../../css/ProjectModal.css';

const ProjectModal = ({ project = {}, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    setFormData(project);
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{project.id ? 'Edit Project' : 'Add New Project'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            aria-label="Project Name"
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={formData.description || ''}
            onChange={handleChange}
            required
            aria-label="Project Description"
          />
          <div className="button-group">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
