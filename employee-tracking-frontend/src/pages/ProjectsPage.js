import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import ProjectModal from './projectmodals/ProjectModal';
import DeleteConfirmation from './projectmodals/DeleteConfirmation';
import '../css/ManageProjects.css';

const ManageProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  useEffect(() => {
    console.log('Fetching projects...');
    fetchProjects();
  }, [token]);
  

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin-dashboard/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Projects fetched:', response.data);
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
    console.log('Add Project button clicked');
    setNewProject({ name: '', description: '' });
    setEditingProject(null);
    setShowModal(true); // Ensure this line executes correctly
  };
  

  const openEditModal = (project) => {
    console.log('Edit Project button clicked for project:', project);
    setNewProject(project);
    setShowModal(true);
    console.log('Modal state after opening for edit:', { showModal, newProject });
    setEditingProject(project);
  };

  const handleDelete = (projectId) => {
    console.log('Delete Project button clicked for project ID:', projectId);
    setDeleteProjectId(projectId);
    setShowDeleteConfirm(true);
    console.log('Delete confirmation state:', { showDeleteConfirm, deleteProjectId });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/admin-dashboard/api/projects/${deleteProjectId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter((project) => project.id !== deleteProjectId));
      setFilteredProjects(filteredProjects.filter((project) => project.id !== deleteProjectId));
      setShowDeleteConfirm(false);
      console.log('Project deleted:', deleteProjectId);
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleModalSubmit = async (project) => {
    try {
      console.log('Modal submit called with project:', project);
      if (editingProject) {
        const response = await axios.put(
          `http://localhost:8000/admin-dashboard/api/projects/${editingProject.id}/`,
          project,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects(projects.map((p) => (p.id === editingProject.id ? response.data : p)));
        console.log('Project updated:', response.data);
      } else {
        const response = await axios.post('http://localhost:8000/admin-dashboard/api/projects/', project, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects([...projects, response.data]);
        console.log('New project added:', response.data);
      }
      setShowModal(false);
      console.log('Modal closed:', { showModal });
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  return (
    <div className="project-container">
      <h2>Manage Projects</h2>
      <div className="filters">
        <select name="name" value={filterName} onChange={handleFilterChange}>
          <option value="">Filter by Project Name</option>
          {projects.map(project => (
            <option key={project.id} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>
        <select name="description" value={filterDescription} onChange={handleFilterChange}>
          <option value="">Filter by Description</option>
          {projects.map(project => (
            <option key={project.id} value={project.description}>
              {project.description}
            </option>
          ))}
        </select>
      </div>
      <button className="add-button" onClick={openAddModal}>Add Project</button>
      <table className="project-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project) => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.description}</td>
              <td>
                <button className="edit-button" onClick={() => openEditModal(project)}>Edit</button>
                <button className="delete-button" onClick={() => handleDelete(project.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <ProjectModal
          project={newProject}
          onClose={() => {
            console.log('Closing modal...');
            setShowModal(false);
          }}
          onSubmit={handleModalSubmit}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          onClose={() => {
            console.log('Closing delete confirmation...');
            setShowDeleteConfirm(false);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default ManageProjects;
