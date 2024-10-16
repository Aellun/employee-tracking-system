import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // To access token for authentication

const ManageProjects = () => {
  const { token } = useAuth(); // Get token from the context
  const [projects, setProjects] = useState([]); // State to store the list of projects
  const [newProject, setNewProject] = useState({ name: '', description: '' }); // State for new project form
  const [editingProject, setEditingProject] = useState(null); // State for editing a project
  const [error, setError] = useState(null);

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data);
      } catch (err) {
        setError('Error fetching projects');
      }
    };

    fetchProjects();
  }, [token]);

  // Handle input changes for new project
  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Add new project
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/projects/', newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects((prevState) => [...prevState, response.data]);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      setError('Error adding project');
    }
  };

  // Handle input changes for editing project
  const handleEditProjectChange = (e) => {
    const { name, value } = e.target;
    setEditingProject((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Start editing project
  const startEditProject = (project) => {
    setEditingProject(project);
  };

  // Save edited project
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/projects/${editingProject.id}/`, editingProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects((prevState) =>
        prevState.map((project) =>
          project.id === editingProject.id ? response.data : project
        )
      );
      setEditingProject(null); // Reset editing state
    } catch (err) {
      setError('Error updating project');
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`/api/projects/${projectId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects((prevState) => prevState.filter((project) => project.id !== projectId));
    } catch (err) {
      setError('Error deleting project');
    }
  };

  return (
    <div>
      <h2>Manage Projects</h2>
      
      {/* Error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Form to add new project */}
      <form onSubmit={handleAddProject}>
        <h3>Add New Project</h3>
        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={newProject.name}
          onChange={handleNewProjectChange}
          required
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={newProject.description}
          onChange={handleNewProjectChange}
          required
        ></textarea>
        <button type="submit">Add Project</button>
      </form>

      {/* List of projects */}
      <h3>Existing Projects</h3>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <strong>{project.name}</strong>: {project.description}
            <button onClick={() => startEditProject(project)}>Edit</button>
            <button onClick={() => handleDeleteProject(project.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Editing form */}
      {editingProject && (
        <form onSubmit={handleSaveProject}>
          <h3>Edit Project</h3>
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={editingProject.name}
            onChange={handleEditProjectChange}
            required
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={editingProject.description}
            onChange={handleEditProjectChange}
            required
          ></textarea>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditingProject(null)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default ManageProjects;
