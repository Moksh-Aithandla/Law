const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure AWS SDK for Filebase
const s3 = new AWS.S3({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  accessKeyId: process.env.FILEBASE_API_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  signatureVersion: 'v4'
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Filebase Proxy API is running' });
});

// Upload file to Filebase
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);
    
    // Get user address from header for access control
    const userAddress = req.headers['x-user-address'];
    if (!userAddress) {
      return res.status(400).json({ error: 'User address is required' });
    }

    // Upload to Filebase
    const params = {
      Bucket: process.env.FILEBASE_BUCKET,
      Key: `${userAddress}/${req.file.filename}`,
      Body: fileContent,
      ContentType: req.file.mimetype,
      Metadata: {
        'user-address': userAddress,
        'original-name': req.file.originalname,
        'upload-date': new Date().toISOString()
      }
    };

    const uploadResult = await s3.upload(params).promise();
    
    // Clean up temporary file
    fs.unlinkSync(filePath);

    // Extract CID from the ETag or Location
    let cid = '';
    if (uploadResult.ETag) {
      // Remove quotes from ETag
      cid = uploadResult.ETag.replace(/"/g, '');
    } else if (uploadResult.Location) {
      // Extract CID from Location URL
      const locationParts = uploadResult.Location.split('/');
      cid = locationParts[locationParts.length - 1];
    }

    res.json({
      success: true,
      cid: cid,
      url: `https://ipfs.filebase.io/ipfs/${cid}`,
      key: uploadResult.Key,
      metadata: params.Metadata
    });
  } catch (error) {
    console.error('Error uploading to Filebase:', error);
    res.status(500).json({ error: 'Failed to upload file to Filebase' });
  }
});

// Get file from Filebase
app.get('/api/file/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    // Redirect to IPFS gateway
    res.redirect(`https://ipfs.filebase.io/ipfs/${cid}`);
  } catch (error) {
    console.error('Error getting file from Filebase:', error);
    res.status(500).json({ error: 'Failed to get file from Filebase' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Filebase Proxy server running on port ${PORT}`);
});