// Document utilities for E-Vault Law Management System
import * as blockchainUtils from './blockchain-utils.js';

// Initialize IPFS client
let ipfs;

// Initialize Firebase (if using Firebase)
let firebaseStorage;

// Initialize document utilities
async function initDocumentUtils() {
  try {
    // Initialize IPFS client
    ipfs = await initIPFS();
    
    // Initialize Firebase (if using Firebase)
    // firebaseStorage = initFirebase();
    
    return true;
  } catch (error) {
    console.error("Error initializing document utilities:", error);
    return false;
  }
}

// Initialize IPFS client
async function initIPFS() {
  try {
    // Using ipfs-http-client
    const { create } = window.IpfsHttpClient;
    // Connect to a public IPFS node
    return create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https'
    });
  } catch (error) {
    console.error("Error initializing IPFS client:", error);
    return null;
  }
}

// Initialize Firebase (if using Firebase)
function initFirebase() {
  // This is a placeholder function that should be implemented if using Firebase
  // For Firebase, you would use the Firebase Storage SDK
  return null;
}

// Upload file to IPFS
async function uploadToIPFS(file) {
  try {
    if (!ipfs) {
      await initDocumentUtils();
    }
    
    // Read file as buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to IPFS
    const result = await ipfs.add(buffer);
    
    return result.path; // This is the IPFS CID
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

// Upload file to Firebase (if using Firebase)
async function uploadToFirebase(file) {
  // This is a placeholder function that should be implemented if using Firebase
  // For Firebase, you would use the Firebase Storage SDK
  throw new Error("Firebase upload not implemented");
}

// Upload document to storage and blockchain
async function uploadDocument(file, caseId, name, description, isPublic = false) {
  try {
    // First, upload the file to IPFS or Firebase
    let contentCID;
    
    // Try IPFS first, fall back to Firebase if IPFS fails
    try {
      contentCID = await uploadToIPFS(file);
    } catch (ipfsError) {
      console.warn("IPFS upload failed, falling back to Firebase:", ipfsError);
      contentCID = await uploadToFirebase(file);
    }
    
    // Then store the reference on the blockchain
    return await blockchainUtils.uploadDocument(
      file,
      caseId,
      name || file.name,
      description || '',
      isPublic
    );
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

// Get document from IPFS
async function getFromIPFS(cid) {
  try {
    if (!ipfs) {
      await initDocumentUtils();
    }
    
    // Get from IPFS
    const stream = ipfs.cat(cid);
    
    // Collect all chunks
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    // Combine chunks
    return new Blob(chunks);
  } catch (error) {
    console.error("Error getting from IPFS:", error);
    throw error;
  }
}

// Get document from Firebase (if using Firebase)
async function getFromFirebase(cid) {
  // This is a placeholder function that should be implemented if using Firebase
  // For Firebase, you would use the Firebase Storage SDK
  throw new Error("Firebase download not implemented");
}

// Get document from storage
async function getDocument(cid) {
  try {
    // Try IPFS first, fall back to Firebase if IPFS fails
    try {
      return await getFromIPFS(cid);
    } catch (ipfsError) {
      console.warn("IPFS download failed, falling back to Firebase:", ipfsError);
      return await getFromFirebase(cid);
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

// Get IPFS gateway URL for a CID
function getIPFSUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`;
}

// Export functions
export {
  initDocumentUtils,
  uploadDocument,
  getDocument,
  getIPFSUrl
};