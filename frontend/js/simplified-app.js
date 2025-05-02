// E-Vault Law Management System - Simplified Application Script
import { userRegistryAddress, caseManagerAddress, documentStorageAddress, filebaseManagerAddress, adminAddress } from '../config.js';

// Global variables
let provider;
let signer;
let userRegistryContract;
let caseManagerContract;
let documentStorageContract;
let filebaseManagerContract;
let currentAccount = null;
let currentChainId = null;
let isConnected = false;
let currentUser = null;
let userRole = null;
let isAdmin = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
  console.log('E-Vault Law Management System initializing...');
  
  try {
    // Initialize the application
    await initApp();
    
    // Set up event listeners
    setupEventListeners();
    
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
  // Connect MetaMask button
  const connectButton = document.getElementById('connect-metamask');
  if (connectButton) {
    connectButton.addEventListener('click', connectMetaMask);
  }
}

/**
 * Connect to MetaMask
 */
async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    showError('MetaMask is not installed. Please install MetaMask to use this application.');
    return false;
  }
  
  try {
    // Show loading overlay
    showLoading(true);
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await handleAccountsChanged(accounts);
    
    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    await handleChainChanged(chainId);
    
    // Check if we need to switch networks
    await switchToSepoliaNetwork();
    
    // Check if user is registered and redirect accordingly
    await checkUserStatus();
    
    // Hide loading overlay
    showLoading(false);
    
    return true;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    showLoading(false);
    
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
    currentUser = null;
    userRole = null;
    isAdmin = false;
  } else {
    // User connected or switched accounts
    const newAccount = accounts[0];
    
    // If account changed, reset user info
    if (currentAccount !== newAccount) {
      currentUser = null;
      userRole = null;
      isAdmin = false;
    }
    
    currentAccount = newAccount;
    isConnected = true;
    
    // Initialize ethers provider and signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    // Initialize contracts
    await initContracts();
    
    // Check if the connected account is the admin
    isAdmin = currentAccount.toLowerCase() === adminAddress.toLowerCase();
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
  documentStorageContract = null;
  filebaseManagerContract = null;
  currentUser = null;
  userRole = null;
  isAdmin = false;
  
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
    const documentStorageABI = await fetchContractABI('DocumentStorage');
    
    // Create contract instances
    userRegistryContract = new ethers.Contract(userRegistryAddress, userRegistryABI, signer);
    caseManagerContract = new ethers.Contract(caseManagerAddress, caseManagerABI, signer);
    documentStorageContract = new ethers.Contract(documentStorageAddress, documentStorageABI, signer);
    
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
 * Check user status and redirect accordingly
 */
async function checkUserStatus() {
  try {
    if (!isConnected || !userRegistryContract) {
      return;
    }
    
    // Check if the connected account is the admin
    if (isAdmin) {
      window.location.href = '/admin-dashboard.html';
      return;
    }
    
    // Check if user is registered
    const isRegistered = await userRegistryContract.isUserRegistered(currentAccount);
    
    if (isRegistered) {
      // Get user details
      const user = await userRegistryContract.getUserDetails(currentAccount);
      currentUser = {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user.id,
        isActive: user.isActive,
        registrationDate: new Date(user.registrationDate.toNumber() * 1000)
      };
      userRole = user.role;
      
      // Check if user is approved
      try {
        const isApproved = await userRegistryContract.isUserApproved(currentAccount);
        
        if (isApproved) {
          // Redirect to appropriate dashboard
          redirectToDashboard();
        } else {
          // Show pending approval page
          window.location.href = '/pending-approval.html';
        }
      } catch (error) {
        // If isUserApproved function doesn't exist in the contract
        console.error('Error checking user approval:', error);
        // Assume user is approved for backward compatibility
        redirectToDashboard();
      }
    } else {
      // Redirect to registration page
      window.location.href = '/register.html';
    }
  } catch (error) {
    console.error('Error checking user status:', error);
    showError('Error checking user status. Please try again.');
  }
}

/**
 * Redirect to appropriate dashboard based on user role
 */
function redirectToDashboard() {
  switch (userRole) {
    case 'lawyer':
      window.location.href = '/lawyer-dashboard.html';
      break;
    case 'judge':
      window.location.href = '/judge-dashboard.html';
      break;
    case 'client':
      window.location.href = '/client-dashboard.html';
      break;
    default:
      showError('Unknown user role. Please contact support.');
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
    
    // Highlight if not on Sepolia
    if (chainIdDecimal !== 11155111) {
      networkInfo.classList.add('wrong-network');
    } else {
      networkInfo.classList.remove('wrong-network');
    }
  }
  
  // Update connect button
  const connectButton = document.getElementById('connect-metamask');
  if (connectButton) {
    if (connected) {
      connectButton.textContent = 'Connected to MetaMask';
      connectButton.disabled = true;
      connectButton.classList.add('connected');
    } else {
      connectButton.innerHTML = '<img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask"><span>Connect with MetaMask</span>';
      connectButton.disabled = false;
      connectButton.classList.remove('connected');
    }
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.style.position = 'fixed';
  errorElement.style.top = '20px';
  errorElement.style.left = '50%';
  errorElement.style.transform = 'translateX(-50%)';
  errorElement.style.backgroundColor = '#f44336';
  errorElement.style.color = 'white';
  errorElement.style.padding = '15px 20px';
  errorElement.style.borderRadius = '5px';
  errorElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  errorElement.style.zIndex = '10000';
  errorElement.style.display = 'flex';
  errorElement.style.alignItems = 'center';
  errorElement.style.justifyContent = 'space-between';
  
  errorElement.innerHTML = `
    <span style="margin-right: 15px;">${message}</span>
    <button style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; line-height: 1;">×</button>
  `;
  
  document.body.appendChild(errorElement);
  
  // Add event listener to close button
  errorElement.querySelector('button').addEventListener('click', () => {
    errorElement.remove();
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(errorElement)) {
      errorElement.remove();
    }
  }, 5000);
}

/**
 * Show MetaMask not installed warning
 */
function showMetaMaskNotInstalledWarning() {
  const warningElement = document.createElement('div');
  warningElement.className = 'metamask-warning';
  warningElement.style.position = 'fixed';
  warningElement.style.top = '50%';
  warningElement.style.left = '50%';
  warningElement.style.transform = 'translate(-50%, -50%)';
  warningElement.style.backgroundColor = 'white';
  warningElement.style.padding = '30px';
  warningElement.style.borderRadius = '10px';
  warningElement.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
  warningElement.style.zIndex = '10000';
  warningElement.style.maxWidth = '500px';
  warningElement.style.width = '90%';
  
  warningElement.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask" style="width: 80px; height: 80px;">
    </div>
    <h3 style="text-align: center; margin-bottom: 15px; color: #333;">MetaMask Not Detected</h3>
    <p style="text-align: center; margin-bottom: 20px; color: #666;">You need MetaMask to use this application. Please install MetaMask and refresh this page.</p>
    <div style="text-align: center;">
      <a href="https://metamask.io/download/" target="_blank" style="display: inline-block; background-color: #f6851b; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Install MetaMask</a>
    </div>
    <button style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">×</button>
  `;
  
  document.body.appendChild(warningElement);
  
  // Add event listener to close button
  warningElement.querySelector('button').addEventListener('click', () => {
    warningElement.remove();
  });
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
  }
}