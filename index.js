const express = require('express');
const path = require('path');

const app = express();

// Permet de servir tous les fichiers du dossier courant (HTML, CSS, JS...)
app.use(express.static(path.join(__dirname)));

// Route d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'passeword.html'));
});

const PORT = process.env.PORT || 3000;  // Utilise le port du cloud ou 3000 en local
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur prêt sur le port ${PORT}`);
});