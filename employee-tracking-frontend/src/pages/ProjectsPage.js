import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';

// Toast Component for Notifications
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={toastStyle}>
      {message}
    </div>
  );
};

const ManageProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin-dashboard/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") setFilterName(value);
    else setFilterDescription(value);

    setFilteredProjects(
      projects.filter((project) =>
        project.name.toLowerCase().includes(value.toLowerCase()) ||
        project.description.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const openAddModal = () => {
    setNewProject({ name: '', description: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (project) => {
    setNewProject(project);
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (projectId) => {
    setDeleteProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      if (editingProject) {
        // Edit project
        const response = await axios.put(
          `http://localhost:8000/admin-dashboard/api/projects/${editingProject.id}/`,
          newProject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects((prevProjects) =>
          prevProjects.map((p) => (p.id === editingProject.id ? response.data : p))
        );
        setFilteredProjects((prevProjects) =>
          prevProjects.map((p) => (p.id === editingProject.id ? response.data : p))
        );
        setToastMessage("Edit successful!");
      } else {
        // Add new project
        const response = await axios.post('http://localhost:8000/admin-dashboard/api/projects/', newProject, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects((prevProjects) => [...prevProjects, response.data]);
        setFilteredProjects((prevProjects) => [...prevProjects, response.data]);
        setToastMessage("Project added successfully!");
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/admin-dashboard/api/projects/${deleteProjectId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== deleteProjectId));
      setFilteredProjects((prevProjects) => prevProjects.filter((project) => project.id !== deleteProjectId));
      setToastMessage("Delete successful!");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Manage Projects</h1>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <div style={filterContainerStyle}>
        <select
          name="name"
          value={filterName}
          onChange={handleFilterChange}
          style={dropdownStyle}
        >
          <option value="">Filter by Name</option>
          {projects.map((project) => (
            <option key={project.id} value={project.name}>{project.name}</option>
          ))}
        </select>
        <select
          name="description"
          value={filterDescription}
          onChange={handleFilterChange}
          style={dropdownStyle}
        >
          <option value="">Filter by Description</option>
          {projects.map((project) => (
            <option key={project.id} value={project.description}>{project.description}</option>
          ))}
        </select>
      </div>

      <button
        onClick={openAddModal}
        style={{
          ...buttonStyle('add'), 
          width: '240px',
        }}
      >
        Add Project
      </button>


      <table style={{ width: '90%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project, index) => (
            <tr key={project.id}>
              <td>{index + 1}</td>
              <td>{project.name}</td>
              <td>{project.description}</td>
              <td>
              <div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => openEditModal(project)}
    style={{
      ...buttonStyle('edit'),
      width: '100px',
    }}>
    Edit</button>
  <button
    onClick={() => openDeleteModal(project.id)}
    style={{
      ...buttonStyle('delete'),
      width: '100px',
    }}>
    Delete</button>
</div>


              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Modal */}
      {isAddModalOpen && (
  <div style={overlayStyle} onClick={() => setIsAddModalOpen(false)}>
    <div style={{ ...modalStyle, borderLeft: '5px solid #4caf50' }} onClick={(e) => e.stopPropagation()}>
      <h2 style={{ ...modalHeaderStyle, color: '#4caf50' }}>Add New Project</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={newProject.name}
        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Project Description"
        value={newProject.description}
        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
        style={inputStyle}
      />
      <button onClick={handleModalSubmit} style={buttonStyle('confirm')}>Save Project</button>
      <button onClick={() => setIsAddModalOpen(false)} style={buttonStyle('cancel')}>Cancel</button>
    </div>
  </div>
)}


      {/* Edit Modal */}
      {isEditModalOpen && (
  <div style={overlayStyle} onClick={() => setIsEditModalOpen(false)}>
    <div style={{ ...modalStyle, borderLeft: '5px solid #1a73e8' }} onClick={(e) => e.stopPropagation()}>
      <h2 style={{ ...modalHeaderStyle, color: '#1a73e8' }}>Edit Project</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={newProject.name}
        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Project Description"
        value={newProject.description}
        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
        style={inputStyle}
      />
      <button onClick={handleModalSubmit} style={buttonStyle('confirm')}>Update Project</button>
      <button onClick={() => setIsEditModalOpen(false)} style={buttonStyle('cancel')}>Cancel</button>
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
  <div style={overlayStyle} onClick={() => setIsDeleteModalOpen(false)}>
    <div style={{ ...modalStyle, borderLeft: '5px solid #f44336' }} onClick={(e) => e.stopPropagation()}>
      <h2 style={{ ...modalHeaderStyle, color: '#f44336' }}>Confirm Delete</h2>
      <p>Are you sure you want to delete this project?</p>
      <button onClick={confirmDelete} style={buttonStyle('delete')}>Yes, Delete</button>
      <button onClick={() => setIsDeleteModalOpen(false)} style={buttonStyle('cancel')}>Cancel</button>
    </div>
  </div>
)}

    </div>
  );
};

// Styles and helper functions

// Toast notification style
const toastStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  backgroundColor: '#4caf50',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  zIndex: 1000,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  fontSize: '16px',
  fontWeight: '500',
};

// General button style function with color variants
const buttonStyle = (type) => ({
  backgroundColor:
    type === 'confirm' ? '#4caf50' :
    type === 'cancel' ? '#9e9e9e' :
    type === 'add' ? '#4caf50' :
    type === 'delete' ? '#f44336' :
    type === 'edit' ? '#1a73e8' : '#616161',

  color: '#fff',
  padding: '10px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  fontSize: '16px',
  fontWeight: '500',
  marginRight: type === 'confirm' || type === 'add' ? '10px' : '0',
  ':hover': {
    backgroundColor:
      type === 'confirm' ? '#388e3c' : 
      type === 'cancel' ? '#757575' :
      type === 'add' ? '#43a047' :
      type === 'delete' ? '#d32f2f' : 
      type === 'edit' ? '#1665c1' : '#424242',
  },
});

// Modal container and overlay styling
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

// Individual modal styles
const modalStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '8px',
  width: '400px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
};

const modalHeaderStyle = {
  fontSize: '1.6em',
  color: '#333',
  marginBottom: '20px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: '12px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '16px',
};

// Additional layout and filter styles
const filterContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const dropdownStyle = {
  padding: '10px 12px',
  marginRight: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

export default ManageProjects;
