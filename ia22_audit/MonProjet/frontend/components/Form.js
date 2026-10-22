import React, { useState } from 'react';

const Form = () => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Faire quelque chose avec la valeur du username
    console.log(username);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nom d'utilisateur:</label>
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <button type="submit">Soumettre</button>
    </form>
  );
};

export default Form;
