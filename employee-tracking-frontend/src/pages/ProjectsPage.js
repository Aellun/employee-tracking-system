import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/admin_dashboard/projects/')
      .then(response => setProjects(response.data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects.map(project => (
          <li key={project.id}>{project.name} - {project.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsPage;
