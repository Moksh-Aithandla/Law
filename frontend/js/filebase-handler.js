// Filebase integration for E-Vault Law Management System
import { getProvider, getSigner, getConnectionStatus } from './metamask-connector.js';
import { filebaseManagerAddress } from '../config.js';

// Filebase gateway URL
const FILEBASE_GATEWAY = 'https://ipfs.filebase.io/ipfs/';

// Contract ABI - will be loaded dynamically
let filebaseManagerABI;
let filebaseManagerContract;

/**
 * Initialize the Filebase handler
 * @returns {Promise<boolean>} True if initialization successful
 */
export async function initFilebaseHandler() {
  try {
    // Load ABI
    const response = await fetch('../abi/FilebaseManager.json');
    filebaseManagerABI = await response.json();
    
    // Get signer
    const signer = getSigner();
    if (!signer) {
      console.error('No signer available. Please connect to MetaMask.');
      return false;
    }
    
    // Create contract instance
    filebaseManagerContract = new ethers.Contract(
      filebaseManagerAddress,
      filebaseManagerABI,
      signer
    );
    
    return true;
  } catch (error) {
    console.error('Error initializing Filebase handler:', error);
    return false;
  }
}

/**
 * Upload a file to Filebase
 * @param {File} file - File to upload
 * @param {Object} metadata - File metadata
 * @param {number} caseId - Associated case ID (0 if none)
 * @param {boolean} isPublic - Whether the file is publicly accessible
 * @returns {Promise<Object>} Upload result with CID and transaction details
 */
export async function uploadToFilebase(file, metadata, caseId = 0, isPublic = false) {
  try {
    // Check connection
    const { isConnected, account } = getConnectionStatus();
    if (!isConnected || !account) {
      throw new Error('Not connected to MetaMask');
    }
    
    // Check file size
    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    
    // For files larger than 5MB, use Filebase directly
    // For smaller files, we could store on-chain, but we'll use Filebase for all for consistency
    
    // Create form data for Filebase upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    // Show upload progress
    const progressElement = document.getElementById('upload-progress');
    if (progressElement) {
      progressElement.style.display = 'block';
      progressElement.value = 0;
    }
    
    // Upload to Filebase via proxy server
    const uploadResponse = await fetch('/api/upload-to-filebase', {
      method: 'POST',
      body: formData,
      headers: {
        'X-User-Address': account
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    const contentCID = uploadResult.cid;
    
    // Update progress
    if (progressElement) {
      progressElement.value = 50;
    }
    
    // Store reference in smart contract
    const tx = await filebaseManagerContract.storeDocument(
      file.name,
      metadata?.description || '',
      contentCID,
      file.type,
      fileSizeInBytes,
      caseId,
      isPublic
    );
    
    // Update progress
    if (progressElement) {
      progressElement.value = 75;
    }
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Update progress
    if (progressElement) {
      progressElement.value = 100;
      setTimeout(() => {
        progressElement.style.display = 'none';
      }, 2000);
    }
    
    // Get document ID from event logs
    const event = receipt.events.find(e => e.event === 'DocumentStored');
    const documentId = event.args.documentId.toNumber();
    
    return {
      success: true,
      documentId,
      cid: contentCID,
      url: `${FILEBASE_GATEWAY}${contentCID}`,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error uploading to Filebase:', error);
    
    // Hide progress
    const progressElement = document.getElementById('upload-progress');
    if (progressElement) {
      progressElement.style.display = 'none';
    }
    
    throw error;
  }
}

/**
 * Get document details from Filebase Manager
 * @param {number} documentId - Document ID
 * @returns {Promise<Object>} Document details
 */
export async function getFilebaseDocument(documentId) {
  try {
    const document = await filebaseManagerContract.getDocument(documentId);
    
    return {
      id: document.documentId.toNumber(),
      name: document.name,
      description: document.description,
      cid: document.contentCID,
      url: `${FILEBASE_GATEWAY}${document.contentCID}`,
      type: document.documentType,
      size: document.fileSize.toNumber(),
      owner: document.owner,
      uploadDate: new Date(document.uploadDate.toNumber() * 1000),
      caseId: document.caseId.toNumber(),
      isPublic: document.isPublic
    };
  } catch (error) {
    console.error('Error getting Filebase document:', error);
    throw error;
  }
}

/**
 * Get all documents for a user
 * @param {string} userAddress - User address (defaults to connected account)
 * @returns {Promise<Array<Object>>} Array of document details
 */
export async function getUserFilebaseDocuments(userAddress = null) {
  try {
    const { account } = getConnectionStatus();
    const address = userAddress || account;
    
    if (!address) {
      throw new Error('No user address provided');
    }
    
    const documentIds = await filebaseManagerContract.getUserDocuments(address);
    const documents = [];
    
    for (const id of documentIds) {
      const document = await getFilebaseDocument(id.toNumber());
      documents.push(document);
    }
    
    return documents;
  } catch (error) {
    console.error('Error getting user Filebase documents:', error);
    throw error;
  }
}

/**
 * Get all documents for a case
 * @param {number} caseId - Case ID
 * @returns {Promise<Array<Object>>} Array of document details
 */
export async function getCaseFilebaseDocuments(caseId) {
  try {
    const documentIds = await filebaseManagerContract.getCaseDocuments(caseId);
    const documents = [];
    
    for (const id of documentIds) {
      const document = await getFilebaseDocument(id.toNumber());
      documents.push(document);
    }
    
    return documents;
  } catch (error) {
    console.error('Error getting case Filebase documents:', error);
    throw error;
  }
}