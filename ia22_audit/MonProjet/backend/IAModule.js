const analyzeUserData = (users) => {
  // Implémentez une fonction d'analyse de données utilisateur
  return users.map(user => {
    // Exemple : ajout d'une note d'analyse
    user.analysis = `Analyse de ${user.username}`;
    return user;
  });
};
module.exports = { analyzeUserData };
