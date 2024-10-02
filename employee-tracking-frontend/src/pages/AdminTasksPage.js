import React, { useState } from 'react';

const AdminTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  const handleAddTask = () => {
    setTasks([...tasks, { name: taskName, subtasks: [] }]);
    setTaskName('');
  };

  return (
    <div>
      <h1>Manage Tasks</h1>
      <input 
        type="text" 
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="New task name"
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminTasksPage;
