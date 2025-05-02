// Document upload functionality for E-Vault Law Management System
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const uploadDocumentForm = document.getElementById('upload-document-form');
  const documentFileInput = document.getElementById('document-file');
  const uploadDocumentBtn = document.getElementById('upload-document-btn');
  const uploadStatus = document.getElementById('upload-status');
  
  // Add document upload functionality
  if (uploadDocumentForm) {
    uploadDocumentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Check if blockchain is initialized
      if (!window.blockchainUtils) {
        alert('Blockchain utilities not available. Please refresh the page and try again.');
        return;
      }
      
      // Get the file
      const file = documentFileInput.files[0];
      if (!file) {
        uploadStatus.textContent = 'Please select a file to upload';
        uploadStatus.className = 'error';
        return;
      }
      
      // Get the case ID
      const caseId = document.getElementById('case-id').value;
      if (!caseId) {
        uploadStatus.textContent = 'Case ID not found';
        uploadStatus.className = 'error';
        return;
      }
      
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        uploadStatus.textContent = 'You must be logged in to upload documents';
        uploadStatus.className = 'error';
        return;
      }
      
      try {
        // Initialize blockchain if not already initialized
        if (!window.ethereum) {
          uploadStatus.textContent = 'MetaMask not detected. Please install MetaMask to upload documents.';
          uploadStatus.className = 'error';
          return;
        }
        
        // Update status
        uploadStatus.textContent = 'Connecting to blockchain...';
        uploadStatus.className = '';
        
        await window.blockchainUtils.initBlockchain();
        
        // Update status
        uploadStatus.textContent = 'Uploading to blockchain...';
        
        // Upload directly to blockchain
        const result = await window.blockchainUtils.uploadDocumentToBlockchain(file, caseId, user.name);
        
        // Update status
        uploadStatus.textContent = 'Document uploaded successfully!';
        uploadStatus.className = 'success';
        
        // Clear file input
        documentFileInput.value = '';
        
        // Refresh document list
        await refreshDocumentList(caseId);
        
        // Show success message
        setTimeout(() => {
          uploadStatus.textContent = '';
        }, 5000);
      } catch (error) {
        console.error('Error uploading document:', error);
        uploadStatus.textContent = 'Error uploading document: ' + error.message;
        uploadStatus.className = 'error';
      }
    });
  }
  
  // Function to refresh document list
  async function refreshDocumentList(caseId) {
    try {
      const documentsList = document.getElementById('case-documents-list');
      if (!documentsList) return;
      
      // Get case details from blockchain
      const caseDetails = await window.blockchainUtils.getCaseFromBlockchain(caseId);
      
      // Clear current list
      documentsList.innerHTML = '';
      
      // Add documents to list
      if (caseDetails.documents && caseDetails.documents.length > 0) {
        caseDetails.documents.forEach(doc => {
          const li = document.createElement('li');
          li.className = 'document-item';
          
          const icon = document.createElement('i');
          icon.className = 'fas fa-file-pdf';
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = doc.name;
          
          const dateSpan = document.createElement('span');
          dateSpan.className = 'document-date';
          dateSpan.textContent = `Uploaded on ${doc.uploadDate} by ${doc.uploadedBy}`;
          
          const viewBtn = document.createElement('a');
          viewBtn.href = doc.url;
          viewBtn.target = '_blank';
          viewBtn.className = 'btn btn-small';
          viewBtn.textContent = 'View';
          
          li.appendChild(icon);
          li.appendChild(nameSpan);
          li.appendChild(dateSpan);
          li.appendChild(viewBtn);
          
          documentsList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No documents available for this case';
        documentsList.appendChild(li);
      }
    } catch (error) {
      console.error('Error refreshing document list:', error);
    }
  }
  
  // Add document upload button to case details page
  function addDocumentUploadToCase() {
    const caseDetailsContent = document.getElementById('case-details-content');
    if (!caseDetailsContent) return;
    
    // Check if we're viewing a case
    const caseIdElement = document.getElementById('case-id');
    if (!caseIdElement) return;
    
    const caseId = caseIdElement.value;
    if (!caseId) return;
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Only lawyers, judges, and the client who submitted the case can upload documents
    const caseSubmittedBy = document.querySelector('[data-submitted-by]');
    const caseAssignedTo = document.querySelector('[data-assigned-to]');
    const caseJudge = document.querySelector('[data-judge]');
    
    if (!caseSubmittedBy || !caseAssignedTo || !caseJudge) return;
    
    const submittedBy = caseSubmittedBy.getAttribute('data-submitted-by');
    const assignedTo = caseAssignedTo.getAttribute('data-assigned-to');
    const judge = caseJudge.getAttribute('data-judge');
    
    if (
      (user.role === 'client' && user.name === submittedBy) ||
      (user.role === 'lawyer' && user.name === assignedTo) ||
      (user.role === 'judge' && user.name === judge)
    ) {
      // Add document upload form
      const uploadForm = document.createElement('div');
      uploadForm.className = 'document-upload-form';
      uploadForm.innerHTML = `
        <h3>Upload Document</h3>
        <form id="upload-document-form">
          <input type="hidden" id="case-id" value="${caseId}">
          <div class="form-group">
            <label for="document-file">Select Document</label>
            <input type="file" id="document-file" accept=".pdf,.doc,.docx,.txt">
          </div>
          <div class="form-group">
            <button type="submit" class="btn" id="upload-document-btn">Upload Document</button>
          </div>
          <p id="upload-status"></p>
        </form>
      `;
      
      caseDetailsContent.appendChild(uploadForm);
    }
  }
  
  // Initialize document upload when viewing case details
  const viewCaseButtons = document.querySelectorAll('.view-case-btn');
  if (viewCaseButtons.length > 0) {
    viewCaseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Wait for case details to load
        setTimeout(addDocumentUploadToCase, 1000);
      });
    });
  }
});