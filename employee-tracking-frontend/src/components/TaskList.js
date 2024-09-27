import React from 'react';

const TaskList = ({ tasks }) => {
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
