const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());

// API endpoints
app.get('/api/users', (req, res) => {
  const usersPath = path.join(__dirname, 'frontend', 'users.json');
  if (fs.existsSync(usersPath)) {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    res.json(users);
  } else {
    res.status(404).json({ error: 'Users data not found' });
  }
});

app.get('/api/cases', (req, res) => {
  const casesPath = path.join(__dirname, 'frontend', 'data', 'cases.json');
  if (fs.existsSync(casesPath)) {
    const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
    res.json(cases);
  } else {
    res.status(404).json({ error: 'Cases data not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});