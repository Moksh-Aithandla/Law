// Client Dashboard JavaScript
import * as blockchainUtils from './blockchain-utils.js';
import * as documentUtils from './document-utils.js';
import { checkAuthorization, logout } from './auth.js';

// DOM elements
let userAvatar;
let userName;
let userRole;
let userAddress;
let profileAvatar;
let profileName;
let profileRole;
let profileEmail;
let profileAddress;
let profileNetwork;
let profileRegistrationDate;
let viewOnEtherscan;
let activeCasesCount;
let documentsCount;
let hearingsCount;
let activityTimeline;
let hearingsTable;
let casesTable;
let casesBody;
let documentsGrid;
let documentCaseSelect;
let caseDetailsCard;
let caseDocumentsGrid;
let caseHearingsBody;
let transactionsBody;
let logoutLink;
let viewTransactionsBtn;
let transactionsModal;
let closeModalBtn;

// Navigation elements
let dashboardLink;
let myCasesLink;
let newCaseLink;
let documentsLink;
let profileLink;
let backToCasesBtn;

// Sections
let dashboardSection;
let myCasesSection;
let newCaseSection;
let documentsSection;
let profileSection;
let caseDetailsSection;

// Forms
let newCaseForm;
let documentUploadForm;
let caseDocumentUploadForm;

// Status elements
let newCaseStatus;
let documentUploadStatus;
let caseDocumentUploadStatus;

// User data
let userData;
let userCases = [];
let userDocuments = [];
let userHearings = [];
let userTransactions = [];

// Initialize dashboard
async function initDashboard() {
  // Check authorization
  if (!checkAuthorization(['client'])) {
    return;
  }
  
  // Get DOM elements
  userAvatar = document.getElementById('user-avatar');
  userName = document.getElementById('user-name');
  userRole = document.getElementById('user-role');
  userAddress = document.getElementById('user-address');
  profileAvatar = document.getElementById('profile-avatar');
  profileName = document.getElementById('profile-name');
  profileRole = document.getElementById('profile-role');
  profileEmail = document.getElementById('profile-email');
  profileAddress = document.getElementById('profile-address');
  profileNetwork = document.getElementById('profile-network');
  profileRegistrationDate = document.getElementById('profile-registration-date');
  viewOnEtherscan = document.getElementById('view-on-etherscan');
  activeCasesCount = document.getElementById('active-cases-count');
  documentsCount = document.getElementById('documents-count');
  hearingsCount = document.getElementById('hearings-count');
  activityTimeline = document.getElementById('activity-timeline');
  hearingsTable = document.getElementById('hearings-table');
  casesTable = document.getElementById('cases-table');
  casesBody = document.getElementById('cases-body');
  documentsGrid = document.getElementById('documents-grid');
  documentCaseSelect = document.getElementById('document-case');
  caseDetailsCard = document.getElementById('case-details-card');
  caseDocumentsGrid = document.getElementById('case-documents-grid');
  caseHearingsBody = document.getElementById('case-hearings-body');
  transactionsBody = document.getElementById('transactions-body');
  logoutLink = document.getElementById('logout-link');
  viewTransactionsBtn = document.getElementById('view-transactions-btn');
  transactionsModal = document.getElementById('transactions-modal');
  closeModalBtn = document.querySelector('.close');
  
  // Navigation elements
  dashboardLink = document.getElementById('dashboard-link');
  myCasesLink = document.getElementById('my-cases-link');
  newCaseLink = document.getElementById('new-case-link');
  documentsLink = document.getElementById('documents-link');
  profileLink = document.getElementById('profile-link');
  backToCasesBtn = document.getElementById('back-to-cases-btn');
  
  // Sections
  dashboardSection = document.getElementById('dashboard-section');
  myCasesSection = document.getElementById('my-cases-section');
  newCaseSection = document.getElementById('new-case-section');
  documentsSection = document.getElementById('documents-section');
  profileSection = document.getElementById('profile-section');
  caseDetailsSection = document.getElementById('case-details-section');
  
  // Forms
  newCaseForm = document.getElementById('new-case-form');
  documentUploadForm = document.getElementById('document-upload-form');
  caseDocumentUploadForm = document.getElementById('case-document-upload-form');
  
  // Status elements
  newCaseStatus = document.getElementById('new-case-status');
  documentUploadStatus = document.getElementById('document-upload-status');
  caseDocumentUploadStatus = document.getElementById('case-document-upload-status');
  
  // Set up event listeners
  if (logoutLink) {
    logoutLink.addEventListener('click', handleLogout);
  }
  
  if (viewTransactionsBtn) {
    viewTransactionsBtn.addEventListener('click', showTransactionsModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideTransactionsModal);
  }
  
  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', function(event) {
    if (event.target == transactionsModal) {
      hideTransactionsModal();
    }
  });
  
  // Navigation event listeners
  if (dashboardLink) {
    dashboardLink.addEventListener('click', showDashboard);
  }
  
  if (myCasesLink) {
    myCasesLink.addEventListener('click', showMyCases);
  }
  
  if (newCaseLink) {
    newCaseLink.addEventListener('click', showNewCase);
  }
  
  if (documentsLink) {
    documentsLink.addEventListener('click', showDocuments);
  }
  
  if (profileLink) {
    profileLink.addEventListener('click', showProfile);
  }
  
  if (backToCasesBtn) {
    backToCasesBtn.addEventListener('click', showMyCases);
  }
  
  // Form event listeners
  if (newCaseForm) {
    newCaseForm.addEventListener('submit', handleNewCase);
  }
  
  if (documentUploadForm) {
    documentUploadForm.addEventListener('submit', handleDocumentUpload);
  }
  
  if (caseDocumentUploadForm) {
    caseDocumentUploadForm.addEventListener('submit', handleCaseDocumentUpload);
  }
  
  // Initialize blockchain
  try {
    await blockchainUtils.initBlockchain();
    await documentUtils.initDocumentUtils();
    
    // Get user data
    userData = JSON.parse(localStorage.getItem('user'));
    
    // Update UI with user data
    updateUserInfo();
    
    // Load data
    await loadDashboardData();
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
}

// Update user info in UI
function updateUserInfo() {
  if (!userData) return;
  
  // Update sidebar
  if (userAvatar) {
    const initials = getInitials(userData.name);
    userAvatar.textContent = initials;
  }
  
  if (userName) {
    userName.textContent = userData.name;
  }
  
  if (userRole) {
    userRole.textContent = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
  }
  
  if (userAddress) {
    userAddress.textContent = formatAddress(userData.address);
  }
  
  // Update profile
  if (profileAvatar) {
    const initials = getInitials(userData.name);
    profileAvatar.textContent = initials;
  }
  
  if (profileName) {
    profileName.textContent = userData.name;
  }
  
  if (profileRole) {
    profileRole.textContent = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
  }
  
  if (profileEmail) {
    profileEmail.textContent = userData.email;
  }
  
  if (profileAddress) {
    profileAddress.textContent = formatAddress(userData.address);
  }
  
  if (profileNetwork) {
    const network = blockchainUtils.getNetworkInfo();
    profileNetwork.textContent = network.name;
  }
  
  if (viewOnEtherscan) {
    const network = blockchainUtils.getNetworkInfo();
    viewOnEtherscan.href = `${network.explorer}/address/${userData.address}`;
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load cases
    userCases = await blockchainUtils.getUserCases();
    
    // Load documents
    userDocuments = await blockchainUtils.getUserDocuments();
    
    // Update counts
    if (activeCasesCount) {
      activeCasesCount.textContent = userCases.length;
    }
    
    if (documentsCount) {
      documentsCount.textContent = userDocuments.length;
    }
    
    // Load case details
    await loadCaseDetails();
    
    // Load documents
    await loadDocuments();
    
    // Update profile stats
    if (document.getElementById('profile-cases-count')) {
      document.getElementById('profile-cases-count').textContent = userCases.length;
    }
    
    if (document.getElementById('profile-documents-count')) {
      document.getElementById('profile-documents-count').textContent = userDocuments.length;
    }
    
    // Load transactions (placeholder)
    userTransactions = [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'Case Registration',
        date: new Date().toISOString(),
        status: 'Confirmed'
      },
      {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        type: 'Document Upload',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Confirmed'
      }
    ];
    
    if (document.getElementById('profile-transactions-count')) {
      document.getElementById('profile-transactions-count').textContent = userTransactions.length;
    }
    
    // Update transactions table
    updateTransactionsTable();
    
    // Update activity timeline
    updateActivityTimeline();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Load case details
async function loadCaseDetails() {
  try {
    // Clear cases table
    if (casesBody) {
      casesBody.innerHTML = '';
    }
    
    // Clear document case select
    if (documentCaseSelect) {
      // Keep the first option (None)
      documentCaseSelect.innerHTML = '<option value="0">-- None --</option>';
    }
    
    // Load case details
    for (const caseId of userCases) {
      const caseDetails = await blockchainUtils.getCaseDetails(caseId);
      
      // Add to cases table
      if (casesBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${caseId}</td>
          <td>${caseDetails.title}</td>
          <td><span class="status-badge status-${caseDetails.status.toLowerCase()}">${caseDetails.status}</span></td>
          <td>${formatAddress(caseDetails.lawyer)}</td>
          <td>${formatAddress(caseDetails.judge)}</td>
          <td>${formatDate(caseDetails.filingDate)}</td>
          <td>
            <button class="btn btn-small view-case-btn" data-case-id="${caseId}">View</button>
          </td>
        `;
        casesBody.appendChild(row);
        
        // Add event listener to view button
        const viewBtn = row.querySelector('.view-case-btn');
        viewBtn.addEventListener('click', () => {
          viewCase(caseId);
        });
      }
      
      // Add to document case select
      if (documentCaseSelect) {
        const option = document.createElement('option');
        option.value = caseId;
        option.textContent = `Case #${caseId}: ${caseDetails.title}`;
        documentCaseSelect.appendChild(option);
      }
    }
    
    // If no cases, show message
    if (casesBody && userCases.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="7">No cases found</td>';
      casesBody.appendChild(row);
    }
  } catch (error) {
    console.error("Error loading case details:", error);
    if (casesBody) {
      casesBody.innerHTML = '<tr><td colspan="7">Error loading cases</td></tr>';
    }
  }
}

// Load documents
async function loadDocuments() {
  try {
    // Clear documents grid
    if (documentsGrid) {
      documentsGrid.innerHTML = '';
    }
    
    // Load document details
    for (const documentId of userDocuments) {
      const document = await blockchainUtils.getDocument(documentId);
      
      // Add to documents grid
      if (documentsGrid) {
        const documentCard = createDocumentCard(document);
        documentsGrid.appendChild(documentCard);
      }
    }
    
    // If no documents, show message
    if (documentsGrid && userDocuments.length === 0) {
      documentsGrid.innerHTML = '<p>No documents found</p>';
    }
  } catch (error) {
    console.error("Error loading documents:", error);
    if (documentsGrid) {
      documentsGrid.innerHTML = '<p>Error loading documents</p>';
    }
  }
}

// Create document card
function createDocumentCard(document) {
  const card = document.createElement('div');
  card.className = 'document-card';
  
  // Determine icon based on document type
  let icon = 'fa-file';
  if (document.documentType === 'pdf') {
    icon = 'fa-file-pdf';
  } else if (['doc', 'docx'].includes(document.documentType)) {
    icon = 'fa-file-word';
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(document.documentType)) {
    icon = 'fa-file-image';
  }
  
  card.innerHTML = `
    <div class="document-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="document-info">
      <h4>${document.name}</h4>
      <p>${document.description || 'No description'}</p>
      <p class="document-meta">
        <span>Uploaded: ${formatDate(document.uploadDate)}</span>
        ${document.caseId > 0 ? `<span>Case: #${document.caseId}</span>` : ''}
        ${document.isPublic ? '<span class="public-badge">Public</span>' : ''}
      </p>
    </div>
    <div class="document-actions">
      <a href="${documentUtils.getIPFSUrl(document.contentCID)}" target="_blank" class="btn btn-small">View</a>
    </div>
  `;
  
  return card;
}

// View case details
async function viewCase(caseId) {
  try {
    // Show case details section
    showSection(caseDetailsSection);
    
    // Update active navigation
    updateActiveNav(null);
    
    // Set case ID for document upload form
    if (document.getElementById('case-id-for-document')) {
      document.getElementById('case-id-for-document').value = caseId;
    }
    
    // Load case details
    const caseDetails = await blockchainUtils.getCaseDetails(caseId);
    
    // Update case details card
    if (caseDetailsCard) {
      caseDetailsCard.innerHTML = `
        <div class="case-header">
          <h2>${caseDetails.title}</h2>
          <span class="status-badge status-${caseDetails.status.toLowerCase()}">${caseDetails.status}</span>
        </div>
        <div class="case-info">
          <p><strong>Case ID:</strong> ${caseId}</p>
          <p><strong>Type:</strong> ${caseDetails.caseType}</p>
          <p><strong>Filed On:</strong> ${formatDate(caseDetails.filingDate)}</p>
          <p><strong>Last Updated:</strong> ${formatDate(caseDetails.lastUpdated)}</p>
        </div>
        <div class="case-parties">
          <div class="party">
            <h3>Client</h3>
            <p>${formatAddress(caseDetails.client)}</p>
            <a href="${blockchainUtils.getAddressUrl(caseDetails.client)}" target="_blank" class="btn btn-small">View on Etherscan</a>
          </div>
          <div class="party">
            <h3>Lawyer</h3>
            <p>${formatAddress(caseDetails.lawyer)}</p>
            <a href="${blockchainUtils.getAddressUrl(caseDetails.lawyer)}" target="_blank" class="btn btn-small">View on Etherscan</a>
          </div>
          <div class="party">
            <h3>Judge</h3>
            <p>${formatAddress(caseDetails.judge)}</p>
            <a href="${blockchainUtils.getAddressUrl(caseDetails.judge)}" target="_blank" class="btn btn-small">View on Etherscan</a>
          </div>
        </div>
        <div class="case-description">
          <h3>Description</h3>
          <p>${caseDetails.description}</p>
        </div>
      `;
    }
    
    // Load case documents
    const documents = await blockchainUtils.getCaseDocuments(caseId);
    
    // Update case documents grid
    if (caseDocumentsGrid) {
      caseDocumentsGrid.innerHTML = '';
      
      if (documents.length === 0) {
        caseDocumentsGrid.innerHTML = '<p>No documents found for this case</p>';
      } else {
        for (const document of documents) {
          const documentCard = createDocumentCard(document);
          caseDocumentsGrid.appendChild(documentCard);
        }
      }
    }
    
    // Load case hearings
    const hearings = await blockchainUtils.getCaseHearings(caseId);
    
    // Update case hearings table
    if (caseHearingsBody) {
      caseHearingsBody.innerHTML = '';
      
      if (hearings.length === 0) {
        caseHearingsBody.innerHTML = '<tr><td colspan="5">No hearings scheduled for this case</td></tr>';
      } else {
        for (const hearing of hearings) {
          const row = document.createElement('tr');
          const hearingDate = new Date(hearing.scheduledDate * 1000);
          row.innerHTML = `
            <td>${hearingDate.toLocaleDateString()}</td>
            <td>${hearingDate.toLocaleTimeString()}</td>
            <td>${hearing.location}</td>
            <td>${hearing.description}</td>
            <td>${hearing.completed ? '<span class="status-badge status-closed">Completed</span>' : '<span class="status-badge status-registered">Scheduled</span>'}</td>
          `;
          caseHearingsBody.appendChild(row);
        }
      }
    }
  } catch (error) {
    console.error("Error viewing case:", error);
    if (caseDetailsCard) {
      caseDetailsCard.innerHTML = '<p>Error loading case details</p>';
    }
  }
}

// Update transactions table
function updateTransactionsTable() {
  if (!transactionsBody) return;
  
  transactionsBody.innerHTML = '';
  
  if (userTransactions.length === 0) {
    transactionsBody.innerHTML = '<tr><td colspan="5">No transactions found</td></tr>';
    return;
  }
  
  for (const tx of userTransactions) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatAddress(tx.hash)}</td>
      <td>${tx.type}</td>
      <td>${formatDate(tx.date)}</td>
      <td><span class="status-badge status-${tx.status.toLowerCase()}">${tx.status}</span></td>
      <td><a href="${blockchainUtils.getTransactionUrl(tx.hash)}" target="_blank" class="btn btn-small">View</a></td>
    `;
    transactionsBody.appendChild(row);
  }
}

// Update activity timeline
function updateActivityTimeline() {
  if (!activityTimeline) return;
  
  activityTimeline.innerHTML = '';
  
  if (userTransactions.length === 0) {
    const item = document.createElement('li');
    item.className = 'timeline-item';
    item.innerHTML = '<p class="timeline-date">No recent activity</p>';
    activityTimeline.appendChild(item);
    return;
  }
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...userTransactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Show only the 5 most recent transactions
  const recentTransactions = sortedTransactions.slice(0, 5);
  
  for (const tx of recentTransactions) {
    const item = document.createElement('li');
    item.className = 'timeline-item';
    item.innerHTML = `
      <p class="timeline-date">${formatDate(tx.date)}</p>
      <p class="timeline-content">${tx.type}</p>
      <p class="timeline-hash">
        <a href="${blockchainUtils.getTransactionUrl(tx.hash)}" target="_blank">
          ${formatAddress(tx.hash)} <i class="fas fa-external-link-alt"></i>
        </a>
      </p>
    `;
    activityTimeline.appendChild(item);
  }
}

// Handle new case submission
async function handleNewCase(event) {
  event.preventDefault();
  
  try {
    // Get form values
    const title = document.getElementById('case-title').value;
    const description = document.getElementById('case-description').value;
    const caseType = document.getElementById('case-type').value;
    const lawyerAddress = document.getElementById('lawyer-address').value;
    const initialDocument = document.getElementById('initial-document').files[0];
    
    // Validate form
    if (!title || !description || !caseType || !lawyerAddress) {
      newCaseStatus.textContent = "Please fill in all required fields";
      newCaseStatus.className = "status-message error";
      return;
    }
    
    // Validate lawyer address
    if (!ethers.utils.isAddress(lawyerAddress)) {
      newCaseStatus.textContent = "Invalid lawyer address";
      newCaseStatus.className = "status-message error";
      return;
    }
    
    // Update status
    newCaseStatus.textContent = "Registering case...";
    newCaseStatus.className = "status-message";
    
    // Register case
    const caseId = await blockchainUtils.registerCase(
      title,
      description,
      caseType,
      lawyerAddress
    );
    
    // Upload initial document if provided
    if (initialDocument) {
      newCaseStatus.textContent = "Case registered! Uploading initial document...";
      
      await documentUtils.uploadDocument(
        initialDocument,
        caseId,
        `Initial Document - ${title}`,
        `Initial document for case: ${title}`,
        true
      );
    }
    
    // Update status
    newCaseStatus.textContent = "Case registered successfully!";
    newCaseStatus.className = "status-message success";
    
    // Reset form
    document.getElementById('new-case-form').reset();
    
    // Reload data
    await loadDashboardData();
    
    // Show cases after a delay
    setTimeout(() => {
      showMyCases();
    }, 2000);
  } catch (error) {
    console.error("Error registering case:", error);
    newCaseStatus.textContent = "Error registering case: " + error.message;
    newCaseStatus.className = "status-message error";
  }
}

// Handle document upload
async function handleDocumentUpload(event) {
  event.preventDefault();
  
  try {
    // Get form values
    const name = document.getElementById('document-name').value;
    const description = document.getElementById('document-description').value;
    const caseId = parseInt(document.getElementById('document-case').value);
    const file = document.getElementById('document-file').files[0];
    const isPublic = document.getElementById('document-public').checked;
    
    // Validate form
    if (!file) {
      documentUploadStatus.textContent = "Please select a file to upload";
      documentUploadStatus.className = "status-message error";
      return;
    }
    
    // Update status
    documentUploadStatus.textContent = "Uploading document...";
    documentUploadStatus.className = "status-message";
    
    // Upload document
    await documentUtils.uploadDocument(
      file,
      caseId,
      name || file.name,
      description || '',
      isPublic
    );
    
    // Update status
    documentUploadStatus.textContent = "Document uploaded successfully!";
    documentUploadStatus.className = "status-message success";
    
    // Reset form
    document.getElementById('document-upload-form').reset();
    
    // Reload data
    await loadDashboardData();
  } catch (error) {
    console.error("Error uploading document:", error);
    documentUploadStatus.textContent = "Error uploading document: " + error.message;
    documentUploadStatus.className = "status-message error";
  }
}

// Handle case document upload
async function handleCaseDocumentUpload(event) {
  event.preventDefault();
  
  try {
    // Get form values
    const caseId = parseInt(document.getElementById('case-id-for-document').value);
    const name = document.getElementById('case-document-name').value;
    const description = document.getElementById('case-document-description').value;
    const file = document.getElementById('case-document-file').files[0];
    const isPublic = document.getElementById('case-document-public').checked;
    
    // Validate form
    if (!file) {
      caseDocumentUploadStatus.textContent = "Please select a file to upload";
      caseDocumentUploadStatus.className = "status-message error";
      return;
    }
    
    // Update status
    caseDocumentUploadStatus.textContent = "Uploading document...";
    caseDocumentUploadStatus.className = "status-message";
    
    // Upload document
    await documentUtils.uploadDocument(
      file,
      caseId,
      name || file.name,
      description || '',
      isPublic
    );
    
    // Update status
    caseDocumentUploadStatus.textContent = "Document uploaded successfully!";
    caseDocumentUploadStatus.className = "status-message success";
    
    // Reset form
    document.getElementById('case-document-upload-form').reset();
    document.getElementById('case-id-for-document').value = caseId;
    
    // Reload case details
    await viewCase(caseId);
  } catch (error) {
    console.error("Error uploading document:", error);
    caseDocumentUploadStatus.textContent = "Error uploading document: " + error.message;
    caseDocumentUploadStatus.className = "status-message error";
  }
}

// Show dashboard section
function showDashboard() {
  showSection(dashboardSection);
  updateActiveNav(dashboardLink);
}

// Show my cases section
function showMyCases() {
  showSection(myCasesSection);
  updateActiveNav(myCasesLink);
}

// Show new case section
function showNewCase() {
  showSection(newCaseSection);
  updateActiveNav(newCaseLink);
}

// Show documents section
function showDocuments() {
  showSection(documentsSection);
  updateActiveNav(documentsLink);
}

// Show profile section
function showProfile() {
  showSection(profileSection);
  updateActiveNav(profileLink);
}

// Show transactions modal
function showTransactionsModal() {
  if (transactionsModal) {
    transactionsModal.style.display = 'block';
  }
}

// Hide transactions modal
function hideTransactionsModal() {
  if (transactionsModal) {
    transactionsModal.style.display = 'none';
  }
}

// Show section
function showSection(section) {
  // Hide all sections
  const sections = [
    dashboardSection,
    myCasesSection,
    newCaseSection,
    documentsSection,
    profileSection,
    caseDetailsSection
  ];
  
  for (const s of sections) {
    if (s) {
      s.style.display = 'none';
    }
  }
  
  // Show selected section
  if (section) {
    section.style.display = 'block';
  }
}

// Update active navigation
function updateActiveNav(activeLink) {
  // Remove active class from all links
  const links = [
    dashboardLink,
    myCasesLink,
    newCaseLink,
    documentsLink,
    profileLink
  ];
  
  for (const link of links) {
    if (link) {
      link.classList.remove('active');
    }
  }
  
  // Add active class to selected link
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Handle logout
function handleLogout(event) {
  event.preventDefault();
  logout();
  window.location.href = '/';
}

// Helper function to format address
function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to format date
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

// Helper function to get initials from name
function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);