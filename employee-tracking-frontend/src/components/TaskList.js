import React from 'react';

const TaskList = ({ tasks }) => {
  if (tasks.length === 0) {
    return <p>No tasks available</p>;
  }

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p>Due Date: {new Date(task.due_date).toLocaleString()}</p>
          <p>Status: {task.completed ? "Completed" : "Pending"}</p>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
