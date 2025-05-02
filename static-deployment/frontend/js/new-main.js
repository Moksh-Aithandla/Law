// E-Vault Law Management System - Main Application Script
// This file handles the core functionality of the application

// Global variables
let provider;
let signer;
let userRegistryContract;
let caseManagerContract;
let ipfsManagerContract;
let currentAccount = null;
let currentChainId = null;
let isConnected = false;
let currentUser = null;

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
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is detected');
      
      // Set up event listeners for MetaMask
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
      
      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
        
        // Get current chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        await handleChainChanged(chainId);
      } else {
        updateUI(false, null, null);
      }
    } else {
      console.log('MetaMask is not installed');
      showMetaMaskNotInstalledWarning();
      updateUI(false, null, null);
    }
  } catch (error) {
    console.error('Error initializing application:', error);
    showError('Error initializing application. Please refresh the page and try again.');
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
    });
  });
  
  // Connect MetaMask buttons
  document.querySelectorAll('.connect-metamask-btn').forEach(button => {
    button.addEventListener('click', connectMetaMask);
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
  
  // Close error message
  document.querySelectorAll('.close-error').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
      });
    });
  });
}

/**
 * Connect to MetaMask
 */
async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    showMetaMaskNotInstalledWarning();
    return false;
  }
  
  try {
    // Update UI to show connecting state
    updateConnectingState(true);
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await handleAccountsChanged(accounts);
    
    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    await handleChainChanged(chainId);
    
    // Check if we need to switch networks
    await switchToSepoliaNetwork();
    
    // Update UI to show connected state
    updateConnectingState(false);
    
    return true;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    updateConnectingState(false);
    
    if (error.code === 4001) {
      // User rejected the request
      showError('Please connect to MetaMask to use this application.');
    } else {
      showError('Error connecting to MetaMask. Please try again.');
    }
    return false;
  }
}

/**
 * Update UI during connection process
 */
function updateConnectingState(isConnecting) {
  document.querySelectorAll('.connect-metamask-btn').forEach(button => {
    if (isConnecting) {
      button.innerHTML = '<span class="spinner"></span> Connecting...';
      button.disabled = true;
    } else {
      button.innerHTML = '<img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask"><span>Connect with MetaMask</span>';
      button.disabled = false;
    }
  });
}

/**
 * Switch to Sepolia network
 */
async function switchToSepoliaNetwork() {
  if (!window.ethereum || !currentChainId) return false;
  
  // Sepolia testnet
  const targetChainId = 11155111;
  
  // Convert to hex for MetaMask
  const targetChainIdHex = '0x' + targetChainId.toString(16);
  
  // If already on Sepolia, return
  if (currentChainId === targetChainIdHex) return true;
  
  try {
    // Try to switch to Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainIdHex }],
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add Sepolia network to MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChainIdHex,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sepolia network to MetaMask:', addError);
        showError('Error adding Sepolia network to MetaMask. Please try again or add it manually.');
        return false;
      }
    } else {
      console.error('Error switching to Sepolia network:', switchError);
      showError('Error switching to Sepolia network. Please try again or switch manually in MetaMask.');
      return false;
    }
  }
}

/**
 * Handle accounts changed event
 */
async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    currentAccount = null;
    isConnected = false;
    provider = null;
    signer = null;
    
    // Clear user session if logged in
    if (currentUser) {
      handleLogout();
    }
  } else {
    // User connected or switched accounts
    const newAccount = accounts[0];
    
    // If account changed while logged in, log out for security
    if (currentAccount && currentAccount !== newAccount && currentUser) {
      showError('Account changed. Please log in again for security reasons.');
      handleLogout();
    }
    
    currentAccount = newAccount;
    isConnected = true;
    
    // Initialize ethers provider and signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    // Initialize contracts
    await initContracts();
  }
  
  updateUI(isConnected, currentAccount, currentChainId);
}

/**
 * Handle chain changed event
 */
async function handleChainChanged(chainId) {
  currentChainId = chainId;
  
  if (isConnected) {
    // Reinitialize provider and contracts for the new chain
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    await initContracts();
    
    // Check if we're on Sepolia
    const chainIdDecimal = parseInt(chainId, 16);
    if (chainIdDecimal !== 11155111 && currentUser) {
      showError('Please switch to Sepolia network to use this application.');
    }
  }
  
  updateUI(isConnected, currentAccount, currentChainId);
}

/**
 * Handle disconnect event
 */
function handleDisconnect() {
  currentAccount = null;
  isConnected = false;
  provider = null;
  signer = null;
  userRegistryContract = null;
  caseManagerContract = null;
  ipfsManagerContract = null;
  
  // Clear user session if logged in
  if (currentUser) {
    handleLogout();
  }
  
  updateUI(false, null, currentChainId);
}

/**
 * Initialize contract instances
 */
async function initContracts() {
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
 * Update UI based on connection status
 */
function updateUI(connected, account, chainId) {
  // Update wallet status
  document.querySelectorAll('.wallet-status').forEach(element => {
    if (connected && account) {
      element.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
      element.classList.remove('wallet-disconnected');
      element.classList.add('wallet-connected');
    } else {
      element.textContent = 'Not Connected';
      element.classList.remove('wallet-connected');
      element.classList.add('wallet-disconnected');
    }
  });
  
  // Update network info
  document.querySelectorAll('.network-info').forEach(element => {
    if (chainId) {
      const chainIdDecimal = parseInt(chainId, 16);
      let networkName = 'Unknown Network';
      
      switch (chainIdDecimal) {
        case 1:
          networkName = 'Ethereum Mainnet';
          break;
        case 11155111:
          networkName = 'Sepolia';
          break;
        case 31337:
          networkName = 'Localhost';
          break;
        default:
          networkName = `Chain ID: ${chainIdDecimal}`;
      }
      
      element.textContent = networkName;
      
      // Highlight if not on Sepolia
      if (chainIdDecimal !== 11155111) {
        element.classList.add('wrong-network');
      } else {
        element.classList.remove('wrong-network');
      }
    } else {
      element.textContent = 'Not Connected';
      element.classList.add('wrong-network');
    }
  });
  
  // Update MetaMask buttons
  document.querySelectorAll('.connect-metamask-btn').forEach(button => {
    if (connected) {
      button.innerHTML = '<img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask"><span>Connected</span>';
      button.classList.add('connected');
    } else {
      button.innerHTML = '<img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask"><span>Connect with MetaMask</span>';
      button.classList.remove('connected');
    }
  });
  
  // Enable/disable register button based on connection
  const registerSubmit = document.getElementById('register-submit');
  if (registerSubmit) {
    registerSubmit.disabled = !connected;
    
    const helpText = document.querySelector('.help-text');
    if (helpText) {
      helpText.textContent = connected ? 'Fill in your details to register' : 'Connect MetaMask to enable registration';
    }
  }
  
  // Update login button
  const loginSubmit = document.getElementById('login-submit');
  if (loginSubmit) {
    loginSubmit.disabled = !connected;
  }
  
  // Update user info if logged in
  updateUserInfo();
}

/**
 * Show a specific section and hide others
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
  }
  
  // Update active navigation link
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
    
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('active');
    }
  });
  
  // Special handling for dashboard sections
  if (sectionId.includes('dashboard')) {
    // Load dashboard data
    loadDashboardData(sectionId);
  }
}

/**
 * Handle login form submission
 */
async function handleLogin() {
  // Check if MetaMask is connected
  if (!isConnected || !currentAccount) {
    showError('Please connect to MetaMask first.');
    return;
  }
  
  // Check if we're on Sepolia
  const chainIdDecimal = parseInt(currentChainId, 16);
  if (chainIdDecimal !== 11155111) {
    showError('Please switch to Sepolia network to use this application.');
    return;
  }
  
  try {
    // Show loading state
    const loginSubmit = document.getElementById('login-submit');
    if (loginSubmit) {
      loginSubmit.innerHTML = '<span class="spinner"></span> Logging in...';
      loginSubmit.disabled = true;
    }
    
    // Verify user on blockchain
    const userEmail = await userRegistryContract.getUserEmail(currentAccount);
    
    if (!userEmail || userEmail === '') {
      showError('This wallet address is not registered. Please register first.');
      resetLoginForm();
      return;
    }
    
    // Get user details from API
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    const user = users.find(u => u.walletAddress && u.walletAddress.toLowerCase() === currentAccount.toLowerCase());
    
    if (!user) {
      // Create a basic user if not found in the API but exists on blockchain
      user = {
        name: 'Blockchain User',
        email: userEmail,
        role: 'client', // Default role
        walletAddress: currentAccount
      };
    }
    
    // Store user in session
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // Record login transaction
    recordTransaction('User Login', `${user.name} (${user.role}) logged in`);
    
    // Show success message
    showSuccess('Login successful! Redirecting to dashboard...');
    
    // Redirect to appropriate dashboard
    setTimeout(() => {
      showDashboard(user.role);
    }, 1500);
    
  } catch (error) {
    console.error('Error during login:', error);
    showError('Error during login. Please try again.');
    resetLoginForm();
  }
}

/**
 * Reset login form
 */
function resetLoginForm() {
  const loginSubmit = document.getElementById('login-submit');
  if (loginSubmit) {
    loginSubmit.innerHTML = 'Login';
    loginSubmit.disabled = false;
  }
}

/**
 * Handle register form submission
 */
async function handleRegister() {
  // Check if MetaMask is connected
  if (!isConnected || !currentAccount) {
    showError('Please connect to MetaMask first.');
    return;
  }
  
  // Check if we're on Sepolia
  const chainIdDecimal = parseInt(currentChainId, 16);
  if (chainIdDecimal !== 11155111) {
    showError('Please switch to Sepolia network to use this application.');
    return;
  }
  
  // Get form values
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const role = document.getElementById('register-role').value;
  const id = document.getElementById('register-id')?.value.trim() || '';
  
  // Validate form
  if (!name || !email || !role) {
    showError('Please fill in all required fields.');
    return;
  }
  
  if ((role === 'lawyer' || role === 'judge') && !id) {
    showError('ID is required for lawyers and judges.');
    return;
  }
  
  try {
    // Show loading state
    const registerSubmit = document.getElementById('register-submit');
    if (registerSubmit) {
      registerSubmit.innerHTML = '<span class="spinner"></span> Registering...';
      registerSubmit.disabled = true;
    }
    
    // Check if wallet is already registered on blockchain
    const existingEmail = await userRegistryContract.getUserEmail(currentAccount);
    if (existingEmail && existingEmail !== '') {
      showError('This wallet address is already registered. Please use a different wallet or login.');
      resetRegisterForm();
      return;
    }
    
    // Register user on blockchain
    const tx = await userRegistryContract.registerUser(email);
    
    // Wait for transaction to be mined
    showInfo('Registering on blockchain. Please wait for the transaction to be confirmed...');
    await tx.wait();
    
    // Create user in API
    const newUser = {
      name,
      email,
      role,
      id: id || null,
      walletAddress: currentAccount
    };
    
    // In a real app, we would send this to an API
    // For now, we'll simulate by storing in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store user in session
    currentUser = newUser;
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Record registration transaction
    recordTransaction('User Registration', `${newUser.name} registered as ${newUser.role}`);
    
    // Show success message
    showSuccess('Registration successful! Redirecting to dashboard...');
    
    // Redirect to appropriate dashboard
    setTimeout(() => {
      showDashboard(newUser.role);
    }, 1500);
    
  } catch (error) {
    console.error('Error during registration:', error);
    showError('Error during registration. Please try again.');
    resetRegisterForm();
  }
}

/**
 * Reset register form
 */
function resetRegisterForm() {
  const registerSubmit = document.getElementById('register-submit');
  if (registerSubmit) {
    registerSubmit.innerHTML = 'Register';
    registerSubmit.disabled = false;
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  // Clear user session
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  
  // Show home section
  showSection('home-section');
  
  // Show success message
  showSuccess('Logged out successfully.');
  
  // Update UI
  updateUserInfo();
}

/**
 * Check if user is already logged in
 */
function checkLoggedInUser() {
  const savedUser = sessionStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard(currentUser.role);
  }
}

/**
 * Show appropriate dashboard based on user role
 */
function showDashboard(role) {
  switch (role) {
    case 'judge':
      showSection('judge-dashboard');
      break;
    case 'lawyer':
      showSection('lawyer-dashboard');
      break;
    case 'client':
      showSection('client-dashboard');
      break;
    default:
      showSection('home-section');
  }
  
  updateUserInfo();
}

/**
 * Load dashboard data
 */
function loadDashboardData(dashboardId) {
  // This would fetch data from the blockchain and API
  // For now, we'll use placeholder data
  
  if (dashboardId === 'judge-dashboard') {
    loadJudgeDashboard();
  } else if (dashboardId === 'lawyer-dashboard') {
    loadLawyerDashboard();
  } else if (dashboardId === 'client-dashboard') {
    loadClientDashboard();
  }
}

/**
 * Update user info in the UI
 */
function updateUserInfo() {
  document.querySelectorAll('.user-name').forEach(element => {
    if (currentUser) {
      element.textContent = currentUser.name;
    } else {
      element.textContent = '';
    }
  });
  
  document.querySelectorAll('.user-role').forEach(element => {
    if (currentUser) {
      element.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    } else {
      element.textContent = '';
    }
  });
  
  document.querySelectorAll('.user-email').forEach(element => {
    if (currentUser) {
      element.textContent = currentUser.email;
    } else {
      element.textContent = '';
    }
  });
  
  // Show/hide login/register links and user info
  if (currentUser) {
    document.querySelectorAll('.logged-out-only').forEach(element => {
      element.style.display = 'none';
    });
    
    document.querySelectorAll('.logged-in-only').forEach(element => {
      element.style.display = 'block';
    });
  } else {
    document.querySelectorAll('.logged-out-only').forEach(element => {
      element.style.display = 'block';
    });
    
    document.querySelectorAll('.logged-in-only').forEach(element => {
      element.style.display = 'none';
    });
  }
}

/**
 * Record a transaction
 */
function recordTransaction(type, details) {
  const txInfo = {
    hash: '0x' + Math.random().toString(16).substr(2, 64), // Simulated transaction hash
    blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
    timestamp: Date.now(),
    type,
    details
  };
  
  // Get existing transactions or initialize empty array
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.push(txInfo);
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Show MetaMask not installed warning
 */
function showMetaMaskNotInstalledWarning() {
  document.querySelectorAll('.metamask-not-installed').forEach(element => {
    element.style.display = 'flex';
  });
}

/**
 * Show error message
 */
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 5000);
  }
}

/**
 * Show info message
 */
function showInfo(message) {
  const infoElement = document.getElementById('info-message');
  if (infoElement) {
    infoElement.textContent = message;
    infoElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
      infoElement.style.display = 'none';
    }, 5000);
  }
}

// Export functions for use in other modules
window.app = {
  connectMetaMask,
  showSection,
  handleLogin,
  handleRegister,
  handleLogout,
  showError,
  showSuccess,
  showInfo
};