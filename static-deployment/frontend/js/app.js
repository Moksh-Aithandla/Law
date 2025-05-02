// Main application JavaScript for E-Vault Law Management System
import * as blockchainUtils from './blockchain-utils.js';
import * as documentUtils from './document-utils.js';
import { initAuth, getLoggedInUser, redirectToDashboard } from './auth.js';

// Export the initApp function for use in index.js
export { initApp };

// DOM elements
let homeLink;
let loginLink;
let registerLink;
let viewTransactionsBtn;
let loginBtn;
let registerBtn;
let viewCasesBtn;
let viewBlockchainBtn;
let toLoginLink;
let toRegisterLink;
let backToHomeBtn;
let backToCasesBtn;
let backToHomeFromBlockchainBtn;
let transactionsModal;
let closeModalBtn;

// Sections
let homeSection;
let loginSection;
let registerSection;
let allCasesSection;
let caseDetailsSection;
let blockchainSection;

// Initialize application
async function initApp() {
  console.log("Initializing E-Vault Law Management System...");
  
  // Get DOM elements
  homeLink = document.getElementById('home-link');
  loginLink = document.getElementById('login-link');
  registerLink = document.getElementById('register-link');
  viewTransactionsBtn = document.getElementById('view-transactions-btn');
  loginBtn = document.getElementById('login-btn');
  registerBtn = document.getElementById('register-btn');
  viewCasesBtn = document.getElementById('view-cases-btn');
  viewBlockchainBtn = document.getElementById('view-blockchain-btn');
  toLoginLink = document.getElementById('to-login');
  toRegisterLink = document.getElementById('to-register');
  backToHomeBtn = document.getElementById('back-to-home');
  backToCasesBtn = document.getElementById('back-to-cases');
  backToHomeFromBlockchainBtn = document.getElementById('back-to-home-from-blockchain');
  transactionsModal = document.getElementById('transactions-modal');
  closeModalBtn = document.querySelector('.close');
  
  // Sections
  homeSection = document.getElementById('home-section');
  loginSection = document.getElementById('login-section');
  registerSection = document.getElementById('register-section');
  allCasesSection = document.getElementById('all-cases-section');
  caseDetailsSection = document.getElementById('case-details-section');
  blockchainSection = document.getElementById('blockchain-section');
  
  console.log("Setting up event listeners...");
  
  // Set up event listeners
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      showHome();
    });
  }
  
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showLogin();
    });
  }
  
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegister();
    });
  }
  
  if (viewTransactionsBtn) {
    viewTransactionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showTransactionsModal();
    });
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
  
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showLogin();
    });
  }
  
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showRegister();
    });
  }
  
  if (viewCasesBtn) {
    viewCasesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAllCases();
    });
  }
  
  if (viewBlockchainBtn) {
    viewBlockchainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showBlockchainInfo();
    });
  }
  
  if (toLoginLink) {
    toLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showLogin();
    });
  }
  
  if (toRegisterLink) {
    toRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegister();
    });
  }
  
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showHome();
    });
  }
  
  if (backToCasesBtn) {
    backToCasesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAllCases();
    });
  }
  
  if (backToHomeFromBlockchainBtn) {
    backToHomeFromBlockchainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showHome();
    });
  }
  
  console.log("Initializing authentication...");
  
  // Initialize authentication
  try {
    await initAuth();
    console.log("Authentication initialized successfully");
    
    // Check if user is logged in
    const user = getLoggedInUser();
    if (user) {
      console.log("User is logged in:", user);
      // Update navigation
      updateNavForLoggedInUser(user);
      
      // If on login or register page, redirect to dashboard
      const currentPath = window.location.pathname;
      if (currentPath === '/login.html' || currentPath === '/register.html') {
        redirectToDashboard(user.role);
      }
    }
  } catch (error) {
    console.error("Error initializing authentication:", error);
  }
  
  console.log("Initializing blockchain connection...");
  
  // Initialize blockchain
  try {
    const blockchainInitialized = await blockchainUtils.initBlockchain();
    
    if (blockchainInitialized) {
      console.log("Blockchain initialized successfully");
      
      // Update wallet status
      const walletStatus = document.getElementById('wallet-status');
      if (walletStatus) {
        const account = blockchainUtils.getCurrentAccount();
        if (account) {
          walletStatus.textContent = `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
          walletStatus.style.display = 'inline-block';
          walletStatus.classList.add('wallet-connected');
        }
      }
      
      // Load public cases
      console.log("Loading public cases...");
      await loadPublicCases();
    } else {
      console.warn("Blockchain initialization failed or was skipped");
    }
  } catch (error) {
    console.error("Error initializing blockchain:", error);
  }
  
  console.log("Application initialization complete");
}

// Update navigation for logged in user
function updateNavForLoggedInUser(user) {
  if (loginLink) {
    loginLink.innerHTML = `<i class="fas fa-tachometer-alt"></i> Dashboard`;
    loginLink.href = `/${user.role}-dashboard.html`;
  }
  
  if (registerLink) {
    registerLink.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
    registerLink.href = "#";
    registerLink.id = "logout-link";
    registerLink.addEventListener('click', handleLogout);
  }
}

// Handle logout
function handleLogout(event) {
  event.preventDefault();
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Show home section
function showHome() {
  showSection(homeSection);
}

// Show login section
function showLogin() {
  showSection(loginSection);
}

// Show register section
function showRegister() {
  showSection(registerSection);
}

// Show all cases section
function showAllCases() {
  showSection(allCasesSection);
}

// Show case details section
function showCaseDetails(caseId) {
  showSection(caseDetailsSection);
  loadCaseDetails(caseId);
}

// Show blockchain info section
function showBlockchainInfo() {
  showSection(blockchainSection);
}

// Show transactions modal
function showTransactionsModal() {
  if (transactionsModal) {
    transactionsModal.style.display = 'block';
    loadTransactions();
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
    homeSection,
    loginSection,
    registerSection,
    allCasesSection,
    caseDetailsSection,
    blockchainSection
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

// Load public cases
async function loadPublicCases() {
  const casesBody = document.getElementById('all-cases-body');
  if (!casesBody) return;
  
  try {
    // Get case count
    const caseCount = await blockchainUtils.getCaseCount();
    
    // Clear cases table
    casesBody.innerHTML = '';
    
    // If no cases, show message
    if (caseCount === 0) {
      casesBody.innerHTML = '<tr><td colspan="7">No public cases found</td></tr>';
      return;
    }
    
    // Load case details
    for (let i = 1; i <= caseCount; i++) {
      const caseDetails = await blockchainUtils.getCaseDetails(i);
      
      // Add to cases table
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i}</td>
        <td>${caseDetails.title}</td>
        <td><span class="status-badge status-${caseDetails.status.toLowerCase()}">${caseDetails.status}</span></td>
        <td>${formatAddress(caseDetails.client)}</td>
        <td>${formatAddress(caseDetails.lawyer)}</td>
        <td>${formatAddress(caseDetails.judge)}</td>
        <td>
          <button class="btn btn-small view-case-btn" data-case-id="${i}">View</button>
        </td>
      `;
      casesBody.appendChild(row);
      
      // Add event listener to view button
      const viewBtn = row.querySelector('.view-case-btn');
      viewBtn.addEventListener('click', () => {
        showCaseDetails(i);
      });
    }
  } catch (error) {
    console.error("Error loading public cases:", error);
    casesBody.innerHTML = '<tr><td colspan="7">Error loading public cases</td></tr>';
  }
}

// Load case details
async function loadCaseDetails(caseId) {
  const caseDetailsContent = document.getElementById('case-details-content');
  const caseDocumentsList = document.getElementById('case-documents-list');
  
  if (!caseDetailsContent || !caseDocumentsList) return;
  
  try {
    // Get case details
    const caseDetails = await blockchainUtils.getCaseDetails(caseId);
    
    // Update case details content
    caseDetailsContent.innerHTML = `
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
    
    // Get case documents
    const documents = await blockchainUtils.getCaseDocuments(caseId);
    
    // Update case documents list
    if (documents.length === 0) {
      caseDocumentsList.innerHTML = '<p>No public documents available for this case</p>';
    } else {
      caseDocumentsList.innerHTML = '<ul class="documents-list"></ul>';
      const documentsList = caseDocumentsList.querySelector('.documents-list');
      
      for (const doc of documents) {
        // Only show public documents
        if (!doc.isPublic) continue;
        
        const li = document.createElement('li');
        li.className = 'document-item';
        
        // Determine icon based on document type
        let icon = 'fa-file';
        if (doc.documentType === 'pdf') {
          icon = 'fa-file-pdf';
        } else if (['doc', 'docx'].includes(doc.documentType)) {
          icon = 'fa-file-word';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(doc.documentType)) {
          icon = 'fa-file-image';
        }
        
        li.innerHTML = `
          <i class="fas ${icon}"></i>
          <span>${doc.name}</span>
          <span class="document-date">Uploaded on ${formatDate(doc.uploadDate)}</span>
          <a href="${documentUtils.getIPFSUrl(doc.contentCID)}" target="_blank" class="btn btn-small">View</a>
        `;
        
        documentsList.appendChild(li);
      }
      
      // If no public documents, show message
      if (documentsList.children.length === 0) {
        caseDocumentsList.innerHTML = '<p>No public documents available for this case</p>';
      }
    }
  } catch (error) {
    console.error("Error loading case details:", error);
    caseDetailsContent.innerHTML = '<p>Error loading case details</p>';
    caseDocumentsList.innerHTML = '<p>Error loading documents</p>';
  }
}

// Load transactions
async function loadTransactions() {
  const transactionsBody = document.getElementById('transactions-body');
  if (!transactionsBody) return;
  
  // Check if user is logged in
  const user = getLoggedInUser();
  if (!user) {
    transactionsBody.innerHTML = '<tr><td colspan="5">Connect your wallet to view your transactions</td></tr>';
    return;
  }
  
  try {
    // Initialize blockchain if not already initialized
    await blockchainUtils.initBlockchain();
    
    // Get user transactions (placeholder)
    const transactions = [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'User Registration',
        date: new Date().toISOString(),
        status: 'Confirmed'
      },
      {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        type: 'Case Registration',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Confirmed'
      }
    ];
    
    // Clear transactions table
    transactionsBody.innerHTML = '';
    
    // If no transactions, show message
    if (transactions.length === 0) {
      transactionsBody.innerHTML = '<tr><td colspan="5">No transactions found</td></tr>';
      return;
    }
    
    // Add transactions to table
    for (const tx of transactions) {
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
  } catch (error) {
    console.error("Error loading transactions:", error);
    transactionsBody.innerHTML = '<tr><td colspan="5">Error loading transactions</td></tr>';
  }
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);