import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/list-users')
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));
  }, []);

  const deleteUser = (id) => {
    axios.post(`/api/delete-user/${id}`)
      .then(() => setUsers(users.filter(user => user.id !== id)))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h1>Manage Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUsers;
