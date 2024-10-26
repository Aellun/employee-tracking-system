import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';

const ManageProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
        const response = await axios.put(
          `http://localhost:8000/admin-dashboard/api/projects/${editingProject.id}/`,
          newProject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects(projects.map((p) => (p.id === editingProject.id ? response.data : p)));
        setSuccessMessage("Edit successful!");
      } else {
        const response = await axios.post('http://localhost:8000/admin-dashboard/api/projects/', newProject, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects([...projects, response.data]);
        setSuccessMessage("Project added successfully!");
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const confirmDelete = async () => {
    try {
      // Make the DELETE request
      await axios.delete(`http://localhost:8000/admin-dashboard/api/projects/${deleteProjectId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Update the projects state by filtering out the deleted project
      setProjects(projects.filter((project) => project.id !== deleteProjectId));
      setFilteredProjects(filteredProjects.filter((project) => project.id !== deleteProjectId));
  
      // Set success message for deletion
      setSuccessMessage("Delete successful!");
  
      // Close the delete modal
      setIsDeleteModalOpen(false);
  
      // Clear the success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };
  

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Manage Projects</h1>

      {successMessage && <div style={successMessageStyle}>{successMessage}</div>}

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

      <button onClick={openAddModal} style={addButtonStyle}>
        Add Project
      </button>

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
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
                <button onClick={() => openEditModal(project)} style={editButtonStyle}>
                  Edit
                </button>
                <button onClick={() => openDeleteModal(project.id)} style={deleteButtonStyle}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={overlayStyle} onClick={() => setIsAddModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalHeaderStyle}>Add New Project</h2>
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
            <button onClick={handleModalSubmit} style={confirmButtonStyle}>Save Project</button>
            <button onClick={() => setIsAddModalOpen(false)} style={cancelButtonStyle}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={overlayStyle} onClick={() => setIsEditModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalHeaderStyle}>Edit Project</h2>
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
            <button onClick={handleModalSubmit} style={confirmButtonStyle}>Update Project</button>
            <button onClick={() => setIsEditModalOpen(false)} style={cancelButtonStyle}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={overlayStyle} onClick={() => setIsDeleteModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalHeaderStyle}>Confirm Delete</h2>
            <p>Are you sure you want to delete this project?</p>
            <button onClick={confirmDelete} style={confirmButtonStyle}>Yes, Delete</button>
            <button onClick={() => setIsDeleteModalOpen(false)} style={cancelButtonStyle}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const successMessageStyle = {
  color: 'green',
  marginBottom: '20px',
};

const filterContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const dropdownStyle = {
  padding: '10px',
  marginRight: '10px',
};

const addButtonStyle = {
  backgroundColor: '#4caf50',
  color: '#fff',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginBottom: '20px',
};

const editButtonStyle = {
  backgroundColor: '#1a73e8',
  color: '#fff',
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginRight: '5px',
};

const deleteButtonStyle = {
  backgroundColor: '#f44336',
  color: '#fff',
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

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

const modalStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  minWidth: '300px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
};

const modalHeaderStyle = {
  marginBottom: '15px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const confirmButtonStyle = {
  backgroundColor: '#1a73e8',
  color: '#fff',
  padding: '10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginRight: '5px',
};

const cancelButtonStyle = {
  backgroundColor: '#f44336',
  color: '#fff',
  padding: '10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

export default ManageProjects;
