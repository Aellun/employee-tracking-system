import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectTaskReport = () => {
    const [projectTasks, setProjectTasks] = useState([]);

    useEffect(() => {
        axios.get('/api/reports/tasks/')
            .then(response => {
                setProjectTasks(response.data);
            })
            .catch(error => {
                console.error('Error fetching project tasks:', error);
            });
    }, []);

    return (
        <div className="report-section">
            <h2>Project Task Report</h2>
            {projectTasks.map(project => (
                <div key={project.project}>
                    <h3>{project.project}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {project.tasks.map(task => (
                                <tr key={task.task_name}>
                                    <td>{task.task_name}</td>
                                    <td>{task.status}</td>
                                    <td>{task.assigned_to}</td>
                                    <td>{task.due_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default ProjectTaskReport;
