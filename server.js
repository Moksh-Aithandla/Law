const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// API endpoint for file uploads to Filebase
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    // Get user address from headers
    const userAddress = req.headers['x-user-address'];
    if (!userAddress) {
      return res.status(400).json({ success: false, message: 'User address is required' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Read the file
    const fileData = fs.readFileSync(req.file.path);

    // Create form data for Filebase API
    const formData = new FormData();
    formData.append('file', fileData, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Get Filebase API key from environment variable
    const filebaseApiKey = process.env.FILEBASE_API_KEY || 'YOUR_FILEBASE_API_KEY';

    // Upload to Filebase
    const response = await axios.post('https://api.filebase.io/v1/ipfs', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${filebaseApiKey}`
      }
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    // Return the CID
    return res.json({ 
      success: true, 
      cid: response.data.cid,
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading to Filebase:', error);
    
    // Delete the temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error uploading file to IPFS',
      error: error.message
    });
  }
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});