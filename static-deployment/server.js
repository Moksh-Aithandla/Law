const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the main HTML file for all routes (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`E-Vault Law Management System server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
