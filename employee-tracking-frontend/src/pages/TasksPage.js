import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from '../components/TaskList';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/tasks/')  // Django API endpoint for tasks
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  return (
    <div>
      <h1>Task List</h1>
      <TaskList tasks={tasks} />
    </div>
  );
};

export default TasksPage;
