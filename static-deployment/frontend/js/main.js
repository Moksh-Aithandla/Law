// Main application script for E-Vault Law Management System
import { userRegistryAddress, caseManagerAddress, ipfsManagerAddress } from '../config.js';

// Global variables
let provider = null;
let signer = null;
let userRegistryContract = null;
let caseManagerContract = null;
let ipfsManagerContract = null;
let currentAccount = null;
let currentChainId = null;
let isConnected = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
  console.log('E-Vault Law Management System initializing...');
  
  // Initialize the application
  await initApp();
  
  // Set up event listeners
  setupEventListeners();
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
      showMetaMaskError('MetaMask is not installed. Please install MetaMask to use this application.');
      updateUI(false, null, null);
    }
  } catch (error) {
    console.error('Error initializing application:', error);
    showMetaMaskError('Error initializing application. Please refresh the page and try again.');
  }
}

/**
 * Set up event listeners for UI elements
 */
function setupEventListeners() {
  // Navigation links
  document.getElementById('home-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('home-section');
  });
  
  document.getElementById('login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login-section');
  });
  
  document.getElementById('register-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register-section');
  });
  
  document.getElementById('cases-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('cases-section');
  });
  
  // Get started button
  document.getElementById('get-started-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (isConnected) {
      showSection('cases-section');
    } else {
      showSection('login-section');
    }
  });
  
  // Register CTA button
  document.getElementById('register-cta-btn')?.addEventListener('click', () => {
    showSection('register-section');
  });
  
  // Connect MetaMask buttons
  const connectButtons = [
    document.getElementById('connect-metamask-btn'),
    document.getElementById('connect-metamask-login'),
    document.getElementById('connect-metamask-register')
  ];
  
  connectButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', connectMetaMask);
    }
  });
  
  // Login form
  document.getElementById('login-submit')?.addEventListener('click', handleLogin);
  
  // Register form
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  
  // Role selection in registration
  document.getElementById('register-role')?.addEventListener('change', function() {
    const idField = document.getElementById('id-field');
    if (idField) {
      if (this.value === 'lawyer' || this.value === 'judge') {
        idField.style.display = 'block';
      } else {
        idField.style.display = 'none';
      }
    }
  });
  
  // Navigation between login and register
  document.getElementById('to-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register-section');
  });
  
  document.getElementById('to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login-section');
  });
  
  // Close error message
  document.querySelector('.close-error')?.addEventListener('click', () => {
    document.getElementById('metamask-error').style.display = 'none';
  });
}

/**
 * Connect to MetaMask
 */
async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    showMetaMaskError('MetaMask is not installed. Please install MetaMask to use this application.');
    return;
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await handleAccountsChanged(accounts);
    
    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    await handleChainChanged(chainId);
    
    // Check if we need to switch networks
    await switchToCorrectNetwork();
    
    return true;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    if (error.code === 4001) {
      // User rejected the request
      showMetaMaskError('Please connect to MetaMask to use this application.');
    } else {
      showMetaMaskError('Error connecting to MetaMask. Please try again.');
    }
    return false;
  }
}

/**
 * Switch to the correct network (Sepolia by default)
 */
async function switchToCorrectNetwork() {
  if (!window.ethereum || !currentChainId) return false;
  
  // Default to Sepolia testnet
  const targetChainId = 11155111;
  
  // Convert to hex for MetaMask
  const targetChainIdHex = '0x' + targetChainId.toString(16);
  
  // If already on the correct network, return
  if (currentChainId === targetChainIdHex) return true;
  
  try {
    // Try to switch to the target network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainIdHex }],
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the network to MetaMask
        const networkParams = {
          chainId: targetChainIdHex,
          chainName: 'Localhost',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['http://localhost:8545'],
          blockExplorerUrls: ['https://etherscan.io'],
        };
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkParams],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network to MetaMask:', addError);
        showMetaMaskError('Error adding network to MetaMask. Please try again.');
        return false;
      }
    } else {
      console.error('Error switching network in MetaMask:', switchError);
      showMetaMaskError('Error switching network in MetaMask. Please try again.');
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
  } else {
    // User connected or switched accounts
    currentAccount = accounts[0];
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
    userRegistryContract = new ethers.Contract(userRegistryAddress, userRegistryABI, signer);
    caseManagerContract = new ethers.Contract(caseManagerAddress, caseManagerABI, signer);
    ipfsManagerContract = new ethers.Contract(ipfsManagerAddress, ipfsManagerABI, signer);
    
    console.log('Contracts initialized successfully');
  } catch (error) {
    console.error('Error initializing contracts:', error);
    showMetaMaskError('Error initializing contracts. Please refresh the page and try again.');
  }
}

/**
 * Fetch contract ABI from the server
 */
async function fetchContractABI(contractName) {
  try {
    const response = await fetch(`/abi/${contractName}.json`);
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
  const walletStatus = document.getElementById('wallet-status');
  if (walletStatus) {
    if (connected && account) {
      walletStatus.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
      walletStatus.classList.remove('wallet-disconnected');
      walletStatus.classList.add('wallet-connected');
    } else {
      walletStatus.textContent = 'Not Connected';
      walletStatus.classList.remove('wallet-connected');
      walletStatus.classList.add('wallet-disconnected');
    }
  }
  
  // Update network info
  const networkInfo = document.getElementById('network-info');
  if (networkInfo && chainId) {
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
    
    networkInfo.textContent = networkName;
    
    // Highlight if not on the expected network (Sepolia)
    if (chainIdDecimal !== 11155111) {
      networkInfo.classList.add('wrong-network');
    } else {
      networkInfo.classList.remove('wrong-network');
    }
  }
  
  // Update connection status in the home section
  const connectionStatus = document.getElementById('connection-status');
  if (connectionStatus) {
    connectionStatus.textContent = connected ? 'Connected' : 'Not Connected';
    connectionStatus.className = connected ? 'wallet-connected' : 'wallet-disconnected';
  }
  
  // Update connection status in the login section
  const loginConnectionStatus = document.getElementById('login-connection-status');
  if (loginConnectionStatus) {
    loginConnectionStatus.textContent = connected ? 'Connected' : 'Not Connected';
    loginConnectionStatus.className = connected ? 'wallet-connected' : 'wallet-disconnected';
  }
  
  // Update connection status in the register section
  const registerConnectionStatus = document.getElementById('register-connection-status');
  if (registerConnectionStatus) {
    registerConnectionStatus.textContent = connected ? 'Connected' : 'Not Connected';
    registerConnectionStatus.className = connected ? 'wallet-connected' : 'wallet-disconnected';
  }
  
  // Update MetaMask buttons
  const connectButtons = [
    document.getElementById('connect-metamask-btn'),
    document.getElementById('connect-metamask-login'),
    document.getElementById('connect-metamask-register')
  ];
  
  connectButtons.forEach(button => {
    if (button) {
      if (connected) {
        button.textContent = 'Connected to MetaMask';
        button.disabled = true;
        button.classList.add('connected');
      } else {
        button.innerHTML = '<img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask"><span>Connect with MetaMask</span>';
        button.disabled = false;
        button.classList.remove('connected');
      }
    }
  });
  
  // Show/hide login form
  const loginFormContainer = document.getElementById('login-form-container');
  if (loginFormContainer) {
    loginFormContainer.style.display = connected ? 'block' : 'none';
  }
  
  // Show/hide register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.style.display = connected ? 'block' : 'none';
  }
  
  // Update cases table
  updateCasesTable(connected);
}

/**
 * Update cases table based on connection status
 */
function updateCasesTable(connected) {
  const casesTableBody = document.querySelector('#public-cases-table tbody');
  if (!casesTableBody) return;
  
  if (connected) {
    // If connected, load cases
    loadPublicCases();
  } else {
    // If not connected, show message
    casesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Connect your wallet to view cases</td></tr>';
  }
}

/**
 * Load public cases from the blockchain
 */
async function loadPublicCases() {
  const casesTableBody = document.querySelector('#public-cases-table tbody');
  if (!casesTableBody || !caseManagerContract) return;
  
  try {
    // Show loading state
    casesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading cases...</td></tr>';
    
    // Get public cases from the contract
    const cases = await caseManagerContract.getPublicCases();
    
    if (cases.length === 0) {
      casesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No public cases found</td></tr>';
      return;
    }
    
    // Clear the table
    casesTableBody.innerHTML = '';
    
    // Add cases to the table
    cases.forEach(caseData => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(caseData.filedDate * 1000);
      const formattedDate = date.toLocaleDateString();
      
      // Get status text
      let statusClass = '';
      let statusText = '';
      
      switch (caseData.status) {
        case 0:
          statusText = 'Pending';
          statusClass = 'status-pending';
          break;
        case 1:
          statusText = 'In Progress';
          statusClass = 'status-in-progress';
          break;
        case 2:
          statusText = 'Completed';
          statusClass = 'status-completed';
          break;
        case 3:
          statusText = 'Rejected';
          statusClass = 'status-rejected';
          break;
        default:
          statusText = 'Unknown';
      }
      
      row.innerHTML = `
        <td>${caseData.caseId}</td>
        <td>${caseData.title}</td>
        <td>${caseData.caseType}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${formattedDate}</td>
        <td>
          <a href="#" class="btn action-btn view-btn" data-case-id="${caseData.caseId}">View</a>
        </td>
      `;
      
      casesTableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const caseId = button.getAttribute('data-case-id');
        viewCase(caseId);
      });
    });
  } catch (error) {
    console.error('Error loading public cases:', error);
    casesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading cases. Please try again.</td></tr>';
  }
}

/**
 * View case details
 */
function viewCase(caseId) {
  // This would navigate to a case details page or show a modal
  console.log('Viewing case:', caseId);
  alert(`Case details for case ID ${caseId} would be shown here.`);
}

/**
 * Handle login form submission
 */
async function handleLogin() {
  if (!isConnected || !userRegistryContract) {
    showMetaMaskError('Please connect your MetaMask wallet to login.');
    return;
  }
  
  try {
    // Check if user is registered
    const isRegistered = await userRegistryContract.isUserRegistered(currentAccount);
    
    if (isRegistered) {
      // Get user role
      const userRole = await userRegistryContract.getUserRole(currentAccount);
      
      // Redirect to appropriate dashboard based on role
      alert(`Login successful! You are logged in as a ${userRole}.`);
      
      // This would redirect to the appropriate dashboard
      // window.location.href = `/${userRole.toLowerCase()}-dashboard.html`;
    } else {
      showMetaMaskError('This wallet address is not registered. Please register first.');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    showMetaMaskError('Error logging in. Please try again.');
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
  e.preventDefault();
  
  if (!isConnected || !userRegistryContract) {
    showMetaMaskError('Please connect your MetaMask wallet to register.');
    return;
  }
  
  try {
    // Check if user is already registered
    const isRegistered = await userRegistryContract.isUserRegistered(currentAccount);
    
    if (isRegistered) {
      showMetaMaskError('This wallet address is already registered.');
      return;
    }
    
    // Get form values
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const role = document.getElementById('register-role').value;
    const id = document.getElementById('register-id').value || '';
    
    // Validate form
    if (!name || !email || !role) {
      showMetaMaskError('Please fill in all required fields.');
      return;
    }
    
    if ((role === 'lawyer' || role === 'judge') && !id) {
      showMetaMaskError('Please enter your ID (Bar ID or Judicial ID).');
      return;
    }
    
    // Register user
    const tx = await userRegistryContract.registerUser(name, email, role, id);
    
    // Show loading state
    document.getElementById('register-submit').disabled = true;
    document.getElementById('register-submit').textContent = 'Registering...';
    
    // Wait for transaction to be mined
    await tx.wait();
    
    // Show success message
    alert('Registration successful! You can now login.');
    
    // Reset form
    document.getElementById('register-form').reset();
    
    // Navigate to login page
    showSection('login-section');
  } catch (error) {
    console.error('Error registering user:', error);
    showMetaMaskError('Error registering user. Please try again.');
  } finally {
    // Reset button state
    document.getElementById('register-submit').disabled = false;
    document.getElementById('register-submit').textContent = 'Register';
  }
}

/**
 * Show a specific section and hide others
 */
function showSection(sectionId) {
  const sections = document.querySelectorAll('main > section');
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
  
  // Update active link in navigation
  const navLinks = document.querySelectorAll('nav ul li a');
  navLinks.forEach(link => {
    if (link.id === `${sectionId.replace('-section', '')}-link`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // If showing cases section and connected, load cases
  if (sectionId === 'cases-section' && isConnected) {
    loadPublicCases();
  }
}

/**
 * Show MetaMask error message
 */
function showMetaMaskError(message) {
  const errorElement = document.getElementById('metamask-error');
  const errorMessage = errorElement.querySelector('.error-message');
  
  errorMessage.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}