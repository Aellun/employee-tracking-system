// TasksPage.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider'; // Adjust the import path as necessary

const TasksPage = () => {
    const { token } = useAuth(); // Get the token from AuthProvider
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTasks(data); // Set the tasks data to state
            } catch (error) {
                setError(error.message); // Handle any errors
            }
        };

        if (token) {
            fetchTasks(); // Fetch tasks only if token exists
        }
    }, [token]); // Dependency on token to refetch if it changes

    // Render the tasks or any error message
    return (
        <div>
            <h1>Your Tasks</h1>
            {error && <p>Error: {error}</p>}
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>{task.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default TasksPage;
