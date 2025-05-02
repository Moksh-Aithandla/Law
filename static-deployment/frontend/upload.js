// Document Upload Module for E-Vault Law Management System
import { initMetaMask, getCurrentAccount, getDocumentStorageContract, getExplorerUrl } from './improved-metamask.js';

// Global variables
let selectedFile = null;
let isUploading = false;
let userCases = [];

// DOM elements
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const filePreview = document.getElementById('file-preview');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const fileType = document.getElementById('file-type');
const removeFileBtn = document.getElementById('remove-file');
const submitButton = document.getElementById('submit-button');
const statusContainer = document.getElementById('status-container');
const statusMessage = document.getElementById('status-message');
const linksContainer = document.getElementById('links-container');
const ipfsLinkText = document.getElementById('ipfs-link');
const txLinkText = document.getElementById('tx-link');
const copyIpfsLinkBtn = document.getElementById('copy-ipfs-link');
const copyTxLinkBtn = document.getElementById('copy-tx-link');
const openIpfsLinkBtn = document.getElementById('open-ipfs-link');
const openTxLinkBtn = document.getElementById('open-tx-link');
const caseIdSelect = document.getElementById('case-id');
const documentName = document.getElementById('document-name');
const documentDescription = document.getElementById('document-description');
const isPublicCheckbox = document.getElementById('is-public');

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize MetaMask
    await initMetaMask();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user's cases
    await loadUserCases();
});

// Set up event listeners
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelection);
    
    // Drag and drop events
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });
    
    dropArea.addEventListener('drop', handleFileDrop);
    
    // Click on drop area to trigger file input
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Remove file button
    removeFileBtn.addEventListener('click', removeSelectedFile);
    
    // Form submission
    uploadForm.addEventListener('submit', handleFormSubmit);
    
    // Copy buttons
    copyIpfsLinkBtn.addEventListener('click', () => copyToClipboard(ipfsLinkText.textContent));
    copyTxLinkBtn.addEventListener('click', () => copyToClipboard(txLinkText.textContent));
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userAddress');
        window.location.href = 'index.html';
    });
}

// Load user's cases
async function loadUserCases() {
    try {
        const account = getCurrentAccount();
        if (!account) return;
        
        // Get case manager contract
        const caseManagerContract = getCaseManagerContract();
        if (!caseManagerContract) return;
        
        // Get user role from localStorage
        const userRole = localStorage.getItem('userRole');
        
        // Get cases based on user role
        let cases;
        if (userRole === 'client') {
            cases = await caseManagerContract.getClientCases(account);
        } else if (userRole === 'lawyer') {
            cases = await caseManagerContract.getLawyerCases(account);
        } else if (userRole === 'judge') {
            cases = await caseManagerContract.getJudgeCases(account);
        } else {
            return;
        }
        
        // Store cases
        userCases = cases.map(c => parseInt(c.toString()));
        
        // Populate case select
        populateCaseSelect(userCases);
    } catch (error) {
        console.error('Error loading user cases:', error);
    }
}

// Populate case select dropdown
async function populateCaseSelect(caseIds) {
    // Clear existing options except the first one
    while (caseIdSelect.options.length > 1) {
        caseIdSelect.remove(1);
    }
    
    // If no cases, return
    if (!caseIds || caseIds.length === 0) return;
    
    try {
        const caseManagerContract = getCaseManagerContract();
        
        // Add each case to the select
        for (const caseId of caseIds) {
            try {
                const caseDetails = await caseManagerContract.getCaseDetails(caseId);
                const option = document.createElement('option');
                option.value = caseId;
                option.textContent = `Case #${caseId} - ${caseDetails.title || 'Untitled Case'}`;
                caseIdSelect.appendChild(option);
            } catch (error) {
                console.error(`Error loading case #${caseId}:`, error);
            }
        }
    } catch (error) {
        console.error('Error populating case select:', error);
    }
}

// Handle file drop
function handleFileDrop(e) {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelection();
    }
}

// Handle file selection
function handleFileSelection() {
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    
    // Validate file type
    const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/msword',
        'image/jpeg',
        'image/png'
    ];
    
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload a PDF, DOCX, JPG, or PNG file.');
        fileInput.value = '';
        return;
    }
    
    // Validate file size (max 10MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
        showError('File is too large. Please upload a file smaller than 10MB.');
        fileInput.value = '';
        return;
    }
    
    // Store selected file
    selectedFile = file;
    
    // Update file preview
    updateFilePreview(file);
    
    // Enable submit button
    submitButton.disabled = false;
}

// Update file preview
function updateFilePreview(file) {
    // Set file name
    fileName.textContent = file.name;
    
    // Set file size
    const sizeInKB = Math.round(file.size / 1024);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    fileSize.textContent = sizeInKB < 1024 ? `${sizeInKB} KB` : `${sizeInMB} MB`;
    
    // Set file type
    let typeText;
    switch (file.type) {
        case 'application/pdf':
            typeText = 'PDF';
            fileName.parentElement.querySelector('i').className = 'fas fa-file-pdf';
            break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
            typeText = 'Word Document';
            fileName.parentElement.querySelector('i').className = 'fas fa-file-word';
            break;
        case 'image/jpeg':
        case 'image/png':
            typeText = file.type.split('/')[1].toUpperCase();
            fileName.parentElement.querySelector('i').className = 'fas fa-file-image';
            break;
        default:
            typeText = 'Unknown';
            fileName.parentElement.querySelector('i').className = 'fas fa-file';
    }
    fileType.textContent = typeText;
    
    // Show file preview
    filePreview.style.display = 'block';
}

// Remove selected file
function removeSelectedFile() {
    selectedFile = null;
    fileInput.value = '';
    filePreview.style.display = 'none';
    submitButton.disabled = true;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Check if file is selected
    if (!selectedFile) {
        showError('Please select a file to upload.');
        return;
    }
    
    // Get form values
    const name = documentName.value.trim();
    const description = documentDescription.value.trim();
    const caseId = parseInt(caseIdSelect.value);
    const isPublic = isPublicCheckbox.checked;
    
    // Validate form
    if (!name) {
        showError('Please enter a document name.');
        return;
    }
    
    // Check if user is connected
    const account = getCurrentAccount();
    if (!account) {
        showError('No wallet connected. Please connect your MetaMask wallet.');
        return;
    }
    
    // Set uploading state
    isUploading = true;
    updateUploadingState(true);
    showLoading('Uploading document to IPFS...');
    
    try {
        // Upload to Filebase IPFS
        const ipfsCid = await uploadToFilebase(selectedFile);
        
        // Show IPFS upload success
        showLoading('Document uploaded to IPFS. Storing reference in blockchain...');
        
        // Store document reference in contract
        const txHash = await storeDocumentInContract(name, description, ipfsCid, getFileExtension(selectedFile.name), caseId, isPublic);
        
        // Show success message
        showSuccess('Document successfully uploaded and stored in the blockchain!');
        
        // Show links
        showLinks(ipfsCid, txHash);
        
        // Reset form
        resetForm();
    } catch (error) {
        console.error('Error uploading document:', error);
        showError(`Error uploading document: ${error.message || 'Unknown error'}`);
    } finally {
        // Reset uploading state
        isUploading = false;
        updateUploadingState(false);
    }
}

// Upload file to Filebase IPFS
async function uploadToFilebase(file) {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to Filebase via proxy server
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload to IPFS');
    }
    
    const data = await response.json();
    return data.cid;
}

// Store document reference in contract
async function storeDocumentInContract(name, description, contentCid, documentType, caseId, isPublic) {
    try {
        // Get document storage contract
        const documentStorageContract = getDocumentStorageContract();
        
        // Call storeDocument function
        const tx = await documentStorageContract.storeDocument(
            name,
            description,
            contentCid,
            documentType,
            caseId,
            isPublic
        );
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        
        // Return transaction hash
        return receipt.transactionHash;
    } catch (error) {
        console.error('Error storing document in contract:', error);
        throw new Error('Failed to store document reference in blockchain');
    }
}

// Get file extension
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Show links
function showLinks(ipfsCid, txHash) {
    // Set IPFS link
    const ipfsUrl = `https://ipfs.filebase.io/ipfs/${ipfsCid}`;
    ipfsLinkText.textContent = ipfsUrl;
    openIpfsLinkBtn.href = ipfsUrl;
    
    // Set transaction link
    const chainId = parseInt(ethereum.chainId, 16);
    const txUrl = getExplorerUrl(chainId, txHash);
    txLinkText.textContent = txUrl;
    openTxLinkBtn.href = txUrl;
    
    // Show links container
    linksContainer.style.display = 'block';
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            // Show copied message
            const button = event.currentTarget;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            // Reset after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

// Reset form
function resetForm() {
    documentName.value = '';
    documentDescription.value = '';
    caseIdSelect.value = '0';
    isPublicCheckbox.checked = false;
    removeSelectedFile();
}

// Update uploading state
function updateUploadingState(uploading) {
    if (uploading) {
        submitButton.innerHTML = '<span class="spinner"></span> Uploading...';
        submitButton.disabled = true;
    } else {
        submitButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Document';
        submitButton.disabled = !selectedFile;
    }
    
    // Disable form inputs during upload
    documentName.disabled = uploading;
    documentDescription.disabled = uploading;
    caseIdSelect.disabled = uploading;
    isPublicCheckbox.disabled = uploading;
    fileInput.disabled = uploading;
    dropArea.style.pointerEvents = uploading ? 'none' : 'auto';
    removeFileBtn.style.pointerEvents = uploading ? 'none' : 'auto';
}

// Show error message
function showError(message) {
    statusContainer.style.display = 'block';
    statusMessage.className = 'status-message status-error';
    statusMessage.textContent = message;
    linksContainer.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    statusContainer.style.display = 'block';
    statusMessage.className = 'status-message status-success';
    statusMessage.textContent = message;
}

// Show loading message
function showLoading(message) {
    statusContainer.style.display = 'block';
    statusMessage.className = 'status-message status-loading';
    statusMessage.textContent = message;
    linksContainer.style.display = 'none';
}

// Helper function to get case manager contract
function getCaseManagerContract() {
    try {
        // Import from improved-metamask.js
        return window.caseManagerContract;
    } catch (error) {
        console.error('Error getting case manager contract:', error);
        return null;
    }
}
