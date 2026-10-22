import React, { useState } from 'react';
import Form from './Form';
import List from './List';

const Dashboard = () => {
  const [users, setUsers] = useState([]);

  const addUser = (username) => {
    setUsers([...users, username]);
  };

  return (
    <div>
      <h1>Tableau de bord</h1>
      <Form addUser={addUser} />
      <List users={users} />
    </div>
  );
};

export default Dashboard;
