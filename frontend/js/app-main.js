/**
 * E-Vault Law Management System - Main Application Script
 * This file handles the core functionality of the application with improved error handling and user experience
 */

// Import MetaMask connector
import * as MetaMask from './improved-metamask.js';

// Global variables
let userRegistryContract;
let caseManagerContract;
let ipfsManagerContract;
let currentUser = null;
let isLoggedIn = false;

// Contract addresses - will be updated from config.js
let USER_REGISTRY_ADDRESS;
let CASE_MANAGER_ADDRESS;
let IPFS_MANAGER_ADDRESS;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
  console.log('E-Vault Law Management System initializing...');
  
  try {
    // Import contract addresses from config.js
    const config = await import('../config.js');
    USER_REGISTRY_ADDRESS = config.userRegistryAddress;
    CASE_MANAGER_ADDRESS = config.caseManagerAddress;
    IPFS_MANAGER_ADDRESS = config.ipfsManagerAddress;
    
    console.log('Contract addresses loaded:', {
      UserRegistry: USER_REGISTRY_ADDRESS,
      CaseManager: CASE_MANAGER_ADDRESS,
      IPFSManager: IPFS_MANAGER_ADDRESS
    });
    
    // Initialize the application
    await initApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show home section by default
    showSection('home-section');
    
    // Check if user is already logged in
    checkLoggedInUser();
    
  } catch (error) {
    console.error('Error initializing application:', error);
    showError('Failed to initialize application. Please refresh the page and try again.');
  }
});

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Initialize MetaMask
    await MetaMask.initMetaMask();
    
    // Add connection listener
    MetaMask.addConnectionListener(handleConnectionChange);
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize notifications
    initNotifications();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
    showError('Error initializing application. Please refresh the page and try again.');
  }
}

/**
 * Handle connection status change
 * @param {Object} status - Connection status object
 */
async function handleConnectionChange(status) {
  console.log('Connection status changed:', status);
  
  if (status.isConnected && status.provider && status.signer) {
    // Initialize contracts when connected
    await initContracts(status.provider, status.signer);
  } else {
    // Reset contracts when disconnected
    userRegistryContract = null;
    caseManagerContract = null;
    ipfsManagerContract = null;
    
    // Log out user if they were logged in
    if (isLoggedIn) {
      handleLogout();
    }
  }
}

/**
 * Initialize contracts
 * @param {ethers.providers.Web3Provider} provider - Ethers provider
 * @param {ethers.Signer} signer - Ethers signer
 */
async function initContracts(provider, signer) {
  try {
    // Load contract ABIs
    const userRegistryABI = await fetchContractABI('UserRegistry');
    const caseManagerABI = await fetchContractABI('CaseManager');
    const ipfsManagerABI = await fetchContractABI('IPFSManager');
    
    // Create contract instances
    userRegistryContract = new ethers.Contract(USER_REGISTRY_ADDRESS, userRegistryABI, signer);
    caseManagerContract = new ethers.Contract(CASE_MANAGER_ADDRESS, caseManagerABI, signer);
    ipfsManagerContract = new ethers.Contract(IPFS_MANAGER_ADDRESS, ipfsManagerABI, signer);
    
    console.log('Contracts initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing contracts:', error);
    showError('Error initializing contracts. Please refresh the page and try again.');
    return false;
  }
}

/**
 * Fetch contract ABI from the server
 * @param {string} contractName - Name of the contract
 * @returns {Array} Contract ABI
 */
async function fetchContractABI(contractName) {
  try {
    const response = await fetch(`/abi/${contractName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${contractName} ABI: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.abi;
  } catch (error) {
    console.error(`Error fetching ${contractName} ABI:`, error);
    throw error;
  }
}

/**
 * Set up event listeners for UI elements
 */
function setupEventListeners() {
  // Navigation links
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      showSection(sectionId);
      
      // Update active state in navigation
      document.querySelectorAll('nav a').forEach(navLink => {
        navLink.classList.remove('active');
      });
      link.classList.add('active');
      
      // Close mobile menu if open
      const navMenu = document.querySelector('nav ul');
      if (navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
      }
    });
  });
  
  // Connect MetaMask buttons
  document.querySelectorAll('.connect-metamask-btn').forEach(button => {
    button.addEventListener('click', MetaMask.connectMetaMask);
  });
  
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }
  
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister();
    });
  }
  
  // Role selection in registration
  const roleSelect = document.getElementById('register-role');
  if (roleSelect) {
    roleSelect.addEventListener('change', function() {
      const idField = document.getElementById('id-field');
      if (idField) {
        if (this.value === 'lawyer' || this.value === 'judge') {
          idField.style.display = 'block';
        } else {
          idField.style.display = 'none';
        }
      }
    });
  }
  
  // Logout button
  document.querySelectorAll('.logout-btn').forEach(button => {
    button.addEventListener('click', handleLogout);
  });
  
  // Close notification buttons
  document.querySelectorAll('.close-notification').forEach(button => {
    button.addEventListener('click', function() {
      const notification = this.closest('.notification');
      if (notification) {
        notification.classList.remove('show');
      }
    });
  });
  
  // View blockchain button
  const viewBlockchainBtn = document.getElementById('view-blockchain-btn');
  if (viewBlockchainBtn) {
    viewBlockchainBtn.addEventListener('click', () => {
      // Show blockchain info modal or section
      showBlockchainInfo();
    });
  }
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('nav ul');
  
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target) && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
      }
    });
  }
}

/**
 * Initialize notifications
 */
function initNotifications() {
  // Add show/hide animations to notifications
  document.querySelectorAll('.notification').forEach(notification => {
    // Add click handler to close button
    const closeButton = notification.querySelector('.close-notification');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
      });
    }
  });
}

/**
 * Show a specific section and hide others
 * @param {string} sectionId - ID of the section to show
 */
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('main > section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show the requested section
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update page title
    updatePageTitle(sectionId);
  }
}

/**
 * Update page title based on current section
 * @param {string} sectionId - ID of the current section
 */
function updatePageTitle(sectionId) {
  let title = 'E-Vault Law Management System';
  
  switch (sectionId) {
    case 'home-section':
      title = 'Home - E-Vault Law';
      break;
    case 'login-section':
      title = 'Login - E-Vault Law';
      break;
    case 'register-section':
      title = 'Register - E-Vault Law';
      break;
    case 'dashboard-section':
      title = 'Dashboard - E-Vault Law';
      break;
    case 'cases-section':
      title = 'Cases - E-Vault Law';
      break;
    case 'documents-section':
      title = 'Documents - E-Vault Law';
      break;
  }
  
  document.title = title;
}

/**
 * Handle login form submission
 */
async function handleLogin() {
  const status = MetaMask.getConnectionStatus();
  
  if (!status.isConnected) {
    showError('Please connect your MetaMask wallet first.');
    return;
  }
  
  if (!userRegistryContract) {
    showError('Contract not initialized. Please refresh the page and try again.');
    return;
  }
  
  try {
    // Show loading state
    const loginButton = document.getElementById('login-submit');
    const originalText = loginButton.innerHTML;
    loginButton.innerHTML = '<span class="spinner"></span> Logging in...';
    loginButton.disabled = true;
    
    // Check if user is registered
    const isRegistered = await userRegistryContract.isUserRegistered(status.account);
    
    if (!isRegistered) {
      showError('This wallet address is not registered. Please register first.');
      loginButton.innerHTML = originalText;
      loginButton.disabled = false;
      return;
    }
    
    // Get user details
    const user = await userRegistryContract.getUserDetails(status.account);
    
    // Store user in session
    currentUser = {
      address: status.account,
      name: user.name,
      email: user.email,
      role: getUserRole(user.role),
      isActive: user.isActive
    };
    
    // Check if user is active
    if (!user.isActive) {
      showError('Your account is not active. Please contact the administrator.');
      loginButton.innerHTML = originalText;
      loginButton.disabled = false;
      return;
    }
    
    // Set logged in state
    isLoggedIn = true;
    
    // Update UI for logged in user
    updateUIForLoggedInUser();
    
    // Show success message
    showSuccess(`Welcome back, ${currentUser.name}!`);
    
    // Redirect to dashboard
    showSection('dashboard-section');
    
  } catch (error) {
    console.error('Login error:', error);
    showError('Error during login. Please try again.');
  } finally {
    // Reset button state
    const loginButton = document.getElementById('login-submit');
    if (loginButton) {
      loginButton.innerHTML = 'Login with MetaMask';
      loginButton.disabled = false;
    }
  }
}

/**
 * Handle register form submission
 */
async function handleRegister() {
  const status = MetaMask.getConnectionStatus();
  
  if (!status.isConnected) {
    showError('Please connect your MetaMask wallet first.');
    return;
  }
  
  if (!userRegistryContract) {
    showError('Contract not initialized. Please refresh the page and try again.');
    return;
  }
  
  // Get form values
  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const roleSelect = document.getElementById('register-role');
  const idInput = document.getElementById('register-id');
  
  if (!nameInput || !emailInput || !roleSelect) {
    showError('Registration form is incomplete. Please refresh the page and try again.');
    return;
  }
  
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const role = roleSelect.value;
  const id = idInput ? idInput.value.trim() : '';
  
  // Validate inputs
  if (!name) {
    showError('Please enter your name.');
    nameInput.focus();
    return;
  }
  
  if (!email) {
    showError('Please enter your email.');
    emailInput.focus();
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address.');
    emailInput.focus();
    return;
  }
  
  if (!role) {
    showError('Please select your role.');
    roleSelect.focus();
    return;
  }
  
  if ((role === 'lawyer' || role === 'judge') && !id) {
    showError(`Please enter your ${role === 'lawyer' ? 'bar' : 'judicial'} ID.`);
    idInput.focus();
    return;
  }
  
  try {
    // Show loading state
    const registerButton = document.getElementById('register-submit');
    const originalText = registerButton.innerHTML;
    registerButton.innerHTML = '<span class="spinner"></span> Registering...';
    registerButton.disabled = true;
    
    // Check if user is already registered
    const isRegistered = await userRegistryContract.isUserRegistered(status.account);
    
    if (isRegistered) {
      showError('This wallet address is already registered. Please login instead.');
      registerButton.innerHTML = originalText;
      registerButton.disabled = false;
      return;
    }
    
    // Convert role to numeric value
    const roleValue = getRoleValue(role);
    
    // Register user
    const tx = await userRegistryContract.registerUser(name, email, roleValue, id || '');
    
    // Wait for transaction to be mined
    showInfo('Registration transaction submitted. Please wait for confirmation...');
    await tx.wait();
    
    // Show success message
    showSuccess('Registration successful! You can now login with your wallet.');
    
    // Clear form
    nameInput.value = '';
    emailInput.value = '';
    roleSelect.value = '';
    if (idInput) idInput.value = '';
    
    // Switch to login section
    showSection('login-section');
    
  } catch (error) {
    console.error('Registration error:', error);
    showError('Error during registration. Please try again.');
  } finally {
    // Reset button state
    const registerButton = document.getElementById('register-submit');
    if (registerButton) {
      registerButton.innerHTML = 'Register with MetaMask';
      registerButton.disabled = false;
    }
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  // Clear user data
  currentUser = null;
  isLoggedIn = false;
  
  // Update UI
  updateUIForLoggedOutUser();
  
  // Show success message
  showSuccess('You have been logged out successfully.');
  
  // Redirect to home
  showSection('home-section');
}

/**
 * Check if user is already logged in
 */
function checkLoggedInUser() {
  // This would typically check a session or local storage
  // For now, we'll just check if we have a currentUser
  if (currentUser) {
    isLoggedIn = true;
    updateUIForLoggedInUser();
  }
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser() {
  // Show logged in elements
  document.querySelectorAll('.logged-in-only').forEach(element => {
    element.style.display = 'block';
  });
  
  // Hide logged out elements
  document.querySelectorAll('.logged-out-only').forEach(element => {
    element.style.display = 'none';
  });
  
  // Update user info
  document.querySelectorAll('.user-name').forEach(element => {
    element.textContent = currentUser.name;
  });
  
  document.querySelectorAll('.user-role').forEach(element => {
    element.textContent = currentUser.role;
  });
  
  document.querySelectorAll('.user-email').forEach(element => {
    element.textContent = currentUser.email;
  });
  
  document.querySelectorAll('.user-address').forEach(element => {
    element.textContent = currentUser.address;
  });
  
  // Set avatar initial
  document.querySelectorAll('.avatar').forEach(element => {
    element.textContent = currentUser.name.charAt(0).toUpperCase();
  });
  
  // Load user-specific data
  loadUserDashboard();
}

/**
 * Update UI for logged out user
 */
function updateUIForLoggedOutUser() {
  // Hide logged in elements
  document.querySelectorAll('.logged-in-only').forEach(element => {
    element.style.display = 'none';
  });
  
  // Show logged out elements
  document.querySelectorAll('.logged-out-only').forEach(element => {
    element.style.display = 'block';
  });
  
  // Clear user info
  document.querySelectorAll('.user-name, .user-role, .user-email, .user-address').forEach(element => {
    element.textContent = '';
  });
  
  // Clear avatar
  document.querySelectorAll('.avatar').forEach(element => {
    element.textContent = '';
  });
}

/**
 * Load user dashboard data
 */
async function loadUserDashboard() {
  if (!isLoggedIn || !currentUser || !caseManagerContract) {
    return;
  }
  
  try {
    // Show loading state
    const dashboardContent = document.querySelector('.dashboard-content');
    if (dashboardContent) {
      dashboardContent.innerHTML = '<div class="loading"><span class="spinner"></span> Loading dashboard data...</div>';
    }
    
    // Load cases based on user role
    let cases = [];
    
    switch (currentUser.role.toLowerCase()) {
      case 'client':
        cases = await caseManagerContract.getCasesByClient(currentUser.address);
        break;
      case 'lawyer':
        cases = await caseManagerContract.getCasesByLawyer(currentUser.address);
        break;
      case 'judge':
        cases = await caseManagerContract.getCasesByJudge(currentUser.address);
        break;
    }
    
    // Load documents
    const documents = await ipfsManagerContract.getDocumentsByUser(currentUser.address);
    
    // Update dashboard stats
    updateDashboardStats(cases.length, documents.length);
    
    // Update recent cases table
    updateRecentCasesTable(cases.slice(0, 5));
    
    // Update recent documents table
    updateRecentDocumentsTable(documents.slice(0, 5));
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Error loading dashboard data. Please refresh the page and try again.');
  } finally {
    // Remove loading state
    const loadingElement = document.querySelector('.dashboard-content .loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

/**
 * Update dashboard statistics
 * @param {number} caseCount - Number of cases
 * @param {number} documentCount - Number of documents
 */
function updateDashboardStats(caseCount, documentCount) {
  const casesCountElement = document.getElementById('cases-count');
  const documentsCountElement = document.getElementById('documents-count');
  
  if (casesCountElement) {
    casesCountElement.textContent = caseCount;
  }
  
  if (documentsCountElement) {
    documentsCountElement.textContent = documentCount;
  }
}

/**
 * Update recent cases table
 * @param {Array} cases - Array of case objects
 */
function updateRecentCasesTable(cases) {
  const recentCasesTable = document.getElementById('recent-cases-table');
  if (!recentCasesTable) return;
  
  const tbody = recentCasesTable.querySelector('tbody');
  if (!tbody) return;
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  if (cases.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="text-center">No cases found</td>';
    tbody.appendChild(row);
    return;
  }
  
  // Add case rows
  cases.forEach(caseItem => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${caseItem.caseNumber || caseItem.id}</td>
      <td>${caseItem.title}</td>
      <td><span class="status status-${caseItem.status.toLowerCase()}">${caseItem.status}</span></td>
      <td>
        <a href="#" class="action-btn view-btn" data-case-id="${caseItem.id}"><i class="fas fa-eye"></i> View</a>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  // Add event listeners to view buttons
  recentCasesTable.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const caseId = button.getAttribute('data-case-id');
      viewCase(caseId);
    });
  });
}

/**
 * Update recent documents table
 * @param {Array} documents - Array of document objects
 */
function updateRecentDocumentsTable(documents) {
  const recentDocsTable = document.getElementById('recent-docs-table');
  if (!recentDocsTable) return;
  
  const tbody = recentDocsTable.querySelector('tbody');
  if (!tbody) return;
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  if (documents.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="text-center">No documents found</td>';
    tbody.appendChild(row);
    return;
  }
  
  // Add document rows
  documents.forEach(doc => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${doc.name}</td>
      <td>${formatDate(doc.uploadDate)}</td>
      <td>${doc.caseNumber || 'N/A'}</td>
      <td>
        <a href="#" class="action-btn view-btn" data-doc-id="${doc.id}"><i class="fas fa-eye"></i> View</a>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  // Add event listeners to view buttons
  recentDocsTable.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const docId = button.getAttribute('data-doc-id');
      viewDocument(docId);
    });
  });
}

/**
 * View case details
 * @param {string} caseId - Case ID
 */
function viewCase(caseId) {
  // Redirect to case details page
  window.location.href = `/case-details.html?id=${caseId}`;
}

/**
 * View document
 * @param {string} docId - Document ID
 */
function viewDocument(docId) {
  // Redirect to document viewer
  window.location.href = `/view.html?id=${docId}`;
}

/**
 * Show blockchain information
 */
function showBlockchainInfo() {
  // This would typically show a modal with blockchain information
  // For now, we'll just show an info message
  showInfo('Blockchain information will be displayed here.');
}

/**
 * Format date string
 * @param {number|string} timestamp - Unix timestamp or date string
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

/**
 * Get user role name from numeric value
 * @param {number} roleValue - Numeric role value
 * @returns {string} Role name
 */
function getUserRole(roleValue) {
  switch (Number(roleValue)) {
    case 0:
      return 'Client';
    case 1:
      return 'Lawyer';
    case 2:
      return 'Judge';
    default:
      return 'Unknown';
  }
}

/**
 * Get numeric role value from name
 * @param {string} roleName - Role name
 * @returns {number} Role value
 */
function getRoleValue(roleName) {
  switch (roleName.toLowerCase()) {
    case 'client':
      return 0;
    case 'lawyer':
      return 1;
    case 'judge':
      return 2;
    default:
      return 0;
  }
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Show error notification
 * @param {string} message - Error message
 */
function showError(message) {
  showNotification('error', message);
}

/**
 * Show success notification
 * @param {string} message - Success message
 */
function showSuccess(message) {
  showNotification('success', message);
}

/**
 * Show info notification
 * @param {string} message - Info message
 */
function showInfo(message) {
  showNotification('info', message);
}

/**
 * Show notification
 * @param {string} type - Notification type: 'error', 'success', or 'info'
 * @param {string} message - Message to display
 */
function showNotification(type, message) {
  const notificationElement = document.getElementById(`${type}-message`);
  if (!notificationElement) return;
  
  const messageText = notificationElement.querySelector('.message-text');
  if (messageText) {
    messageText.textContent = message;
  }
  
  // Show notification
  notificationElement.classList.add('show');
  
  // Hide after 5 seconds
  setTimeout(() => {
    notificationElement.classList.remove('show');
  }, 5000);
}