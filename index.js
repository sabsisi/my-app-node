const express = require('express');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware pour parser le JSON dans le corps des requêtes
app.use(express.json());

// Clé secrète (en prod: mettre dans .env)
const SECRET_KEY = crypto.randomBytes(32);
const IV_LENGTH = 16;

// Permet de servir tous les fichiers du dossier courant (HTML, CSS, JS...)
app.use(express.static(path.join(__dirname)));

function encrypt(buffer) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

function decrypt(buffer) {
  const iv = buffer.slice(0, IV_LENGTH);
  const authTag = buffer.slice(IV_LENGTH, IV_LENGTH + 16);
  const encryptedText = buffer.slice(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encryptedText), decipher.final()]);
}

// Route d'accueil : envoie le fichier passeword.html (attention au nom du fichier !)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'passeword.html'));
});

// Route chiffrement
app.post('/encrypt', upload.single('file'), (req, res) => {
  const encryptedBuffer = encrypt(req.file.buffer);
  res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname}.enc"`);
  res.send(encryptedBuffer);
});

// Route déchiffrement
app.post('/decrypt', upload.single('file'), (req, res) => {
  const decryptedBuffer = decrypt(req.file.buffer);
  const originalName = req.file.originalname.replace(/\.enc$/, '');
  res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
  res.send(decryptedBuffer);
});

// Nouvelle route pour le formulaire POST JSON
app.post('/api/message', (req, res) => {
  const { nom, message } = req.body;
  console.log(`Message reçu de ${nom} : ${message}`);
  res.send('Merci pour votre message !');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur prêt sur le port ${PORT}`);
});
