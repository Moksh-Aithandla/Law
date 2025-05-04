/**
 * Improved MetaMask Connector for E-Vault Law Management System
 * This module handles all MetaMask wallet interactions with better error handling and user feedback
 */

// Import network configuration
import { networkConfig, defaultNetwork, userRegistryAddress, ADMIN_WALLET_ADDRESS } from '../config.js';

// Global state
let currentAccount = null;
let currentChainId = null;
let isConnected = false;
let isConnecting = false;
let provider = null;
let signer = null;
let userRegistryContract = null;

// Event listeners for connection status changes
const connectionListeners = [];

/**
 * Initialize MetaMask connection and check current status
 * @returns {Promise<boolean>} True if MetaMask is available, false otherwise
 */
export async function initMetaMask() {
  console.log('Initializing MetaMask connection...');
  
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    console.error('MetaMask is not installed');
    showMetaMaskNotInstalledWarning();
    updateUI(false, null, null);
    return false;
  }

  try {
    // Set up event listeners
    setupEventListeners();
    
    // Check if already connected
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      // User is already connected
      await handleAccountsChanged(accounts);
      
      // Get current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      await handleChainChanged(chainId);
      
      console.log('MetaMask already connected:', { account: currentAccount, chainId: currentChainId });
      return true;
    } else {
      // Not connected yet
      console.log('MetaMask available but not connected');
      updateUI(false, null, null);
      return true;
    }
  } catch (error) {
    console.error('Error checking MetaMask connection:', error);
    showError('Error connecting to MetaMask. Please refresh the page and try again.');
    updateUI(false, null, null);
    return false;
  }
}

/**
 * Set up event listeners for MetaMask
 */
function setupEventListeners() {
  if (typeof window.ethereum !== 'undefined') {
    // Remove any existing listeners to prevent duplicates
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
    window.ethereum.removeListener('disconnect', handleDisconnect);
    
    // Add listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    
    console.log('MetaMask event listeners set up');
  }
}

/**
 * Connect to MetaMask
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
export async function connectMetaMask() {
  console.log('Attempting to connect to MetaMask...');
  
  if (typeof window.ethereum === 'undefined') {
    showMetaMaskNotInstalledWarning();
    return false;
  }
  
  if (isConnecting) {
    console.log('Connection already in progress');
    return false;
  }
  
  try {
    isConnecting = true;
    updateConnectingState(true);
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await handleAccountsChanged(accounts);
    
    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    await handleChainChanged(chainId);
    
    // Check if we need to switch networks
    const networkSwitched = await switchToCorrectNetwork();
    
    isConnecting = false;
    updateConnectingState(false);
    
    if (networkSwitched) {
      showSuccess('Successfully connected to MetaMask on the correct network!');
    } else {
      showWarning('Connected to MetaMask, but not on the correct network. Please switch networks.');
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    isConnecting = false;
    updateConnectingState(false);
    
    if (error.code === 4001) {
      // User rejected the request
      showError('Connection rejected. Please approve the MetaMask connection request.');
    } else {
      showError(`Error connecting to MetaMask: ${error.message || 'Unknown error'}`);
    }
    return false;
  }
}

/**
 * Update UI during connection process
 * @param {boolean} connecting - Whether connection is in progress
 */
function updateConnectingState(connecting) {
  const connectButtons = document.querySelectorAll('.connect-metamask-btn');
  
  connectButtons.forEach(button => {
    if (connecting) {
      button.innerHTML = '<span class="spinner"></span> Connecting...';
      button.disabled = true;
    } else if (isConnected) {
      button.innerHTML = '<img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask"><span>Connected</span>';
      button.classList.add('connected');
    } else {
      button.innerHTML = '<img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask"><span>Connect with MetaMask</span>';
      button.disabled = false;
      button.classList.remove('connected');
    }
  });
  
  // Update login/register buttons
  const loginSubmit = document.getElementById('login-submit');
  if (loginSubmit) {
    loginSubmit.disabled = connecting || !isConnected;
  }
  
  const registerSubmit = document.getElementById('register-submit');
  if (registerSubmit) {
    registerSubmit.disabled = connecting || !isConnected;
  }
}

/**
 * Switch to the correct network (Sepolia by default)
 * @param {number} targetChainId - Target chain ID to switch to (defaults to defaultNetwork)
 * @returns {Promise<boolean>} True if switch successful, false otherwise
 */
export async function switchToCorrectNetwork(targetChainId = defaultNetwork) {
  if (!window.ethereum || !currentChainId) return false;
  
  // Convert to hex for MetaMask
  const targetChainIdHex = '0x' + targetChainId.toString(16);
  
  // If already on the correct network, return
  if (currentChainId === targetChainIdHex) {
    console.log('Already on the correct network:', targetChainId);
    return true;
  }
  
  console.log(`Switching from chain ${currentChainId} to ${targetChainIdHex}`);
  
  try {
    // Try to switch to the target network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainIdHex }],
    });
    
    console.log('Successfully switched to network:', targetChainId);
    return true;
  } catch (switchError) {
    console.error('Error switching network:', switchError);
    
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Prepare network parameters based on the target chain
        let networkParams;
        
        if (targetChainId === 1337) {
          // Ganache network parameters
          networkParams = {
            chainId: targetChainIdHex,
            chainName: 'Ganache Local Network',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['http://localhost:8545'],
            blockExplorerUrls: ['https://etherscan.io'],
          };
        } else {
          // Default or Sepolia network parameters
          networkParams = {
            chainId: targetChainIdHex,
            chainName: networkConfig[targetChainId]?.name || 'Unknown Network',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [networkConfig[targetChainId]?.rpcUrl || 'https://sepolia.infura.io/v3/'],
            blockExplorerUrls: [networkConfig[targetChainId]?.explorer || 'https://sepolia.etherscan.io'],
          };
        
        console.log('Adding network to MetaMask:', networkParams);
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkParams],
        });
        
        console.log('Successfully added network to MetaMask');
        return true;
      } catch (addError) {
        console.error('Error adding network to MetaMask:', addError);
        showError('Error adding network to MetaMask. Please try adding it manually.');
        return false;
      }
    } else {
      showError('Error switching network in MetaMask. Please try switching manually.');
      return false;
    }
  }
}

/**
 * Handle accounts changed event
 * @param {Array<string>} accounts - Array of accounts
 */
async function handleAccountsChanged(accounts) {
  console.log('Accounts changed:', accounts);
  
  if (accounts.length === 0) {
    // User disconnected
    console.log('User disconnected from MetaMask');
    currentAccount = null;
    isConnected = false;
    provider = null;
    signer = null;
  } else {
    // User connected or switched accounts
    const newAccount = accounts[0];
    console.log('Connected account:', newAccount);
    
    // If account changed while connected, notify
    if (currentAccount && currentAccount !== newAccount) {
      console.log('Account switched from', currentAccount, 'to', newAccount);
      showWarning('Account changed. Your session has been updated.');
    }
    
    currentAccount = newAccount;
    isConnected = true;
    
    // Initialize ethers provider and signer
    if (window.ethers) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      console.log('Ethers provider and signer initialized');
    }
  }
  
  updateUI(isConnected, currentAccount, currentChainId);
  notifyConnectionListeners();
}

/**
 * Handle chain changed event
 * @param {string} chainId - Chain ID in hex format
 */
async function handleChainChanged(chainId) {
  console.log('Chain changed:', chainId);
  
  const oldChainId = currentChainId;
  currentChainId = chainId;
  
  if (isConnected && oldChainId && oldChainId !== chainId) {
    // Reinitialize provider and signer for the new chain
    if (window.ethers) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
    }
    
    // Check if we're on the correct network
    const chainIdDecimal = parseInt(chainId, 16);
    if (chainIdDecimal !== defaultNetwork) {
      showWarning(`You've switched to ${getNetworkName(chainIdDecimal)}. This application works best on ${getNetworkName(defaultNetwork)}.`);
    } else {
      showSuccess(`Successfully connected to ${getNetworkName(chainIdDecimal)}`);
    }
  }
  
  updateUI(isConnected, currentAccount, currentChainId);
  notifyConnectionListeners();
}

/**
 * Handle disconnect event
 */
function handleDisconnect() {
  console.log('MetaMask disconnect event received');
  
  currentAccount = null;
  isConnected = false;
  provider = null;
  signer = null;
  
  updateUI(false, null, currentChainId);
  notifyConnectionListeners();
  
  showWarning('Disconnected from MetaMask');
}

/**
 * Update UI elements based on connection status
 * @param {boolean} connected - Whether MetaMask is connected
 * @param {string|null} account - Current account address
 * @param {string|null} chainId - Current chain ID in hex format
 */
function updateUI(connected, account, chainId) {
  // Update wallet status elements
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
  
  // Update network info elements
  document.querySelectorAll('.network-info').forEach(element => {
    if (chainId) {
      const chainIdDecimal = parseInt(chainId, 16);
      const networkName = getNetworkName(chainIdDecimal);
      element.textContent = networkName;
      
      // Highlight if not on the expected network
      if (chainIdDecimal !== defaultNetwork) {
        element.classList.add('wrong-network');
      } else {
        element.classList.remove('wrong-network');
      }
    } else {
      element.textContent = 'Not Connected';
      element.classList.add('wrong-network');
    }
  });
  
  // Update connect buttons
  updateConnectingState(false);
  
  // Update login/register form elements
  updateAuthForms(connected);
  
  // Update navigation visibility based on connection status
  updateNavigation(connected);
}

/**
 * Update authentication forms based on connection status
 * @param {boolean} connected - Whether MetaMask is connected
 */
function updateAuthForms(connected) {
  // Login form
  const loginSubmit = document.getElementById('login-submit');
  if (loginSubmit) {
    loginSubmit.disabled = !connected;
    
    const helpText = loginSubmit.parentElement.querySelector('.help-text');
    if (helpText) {
      helpText.textContent = connected 
        ? 'Click to authenticate with your connected wallet' 
        : 'Connect MetaMask to enable login';
    }
  }
  
  // Register form
  const registerSubmit = document.getElementById('register-submit');
  if (registerSubmit) {
    registerSubmit.disabled = !connected;
    
    const helpText = registerSubmit?.parentElement.querySelector('.help-text');
    if (helpText) {
      helpText.textContent = connected 
        ? 'Click to register with your connected wallet' 
        : 'Connect MetaMask to enable registration';
    }
  }
  
  // Wallet address displays
  document.querySelectorAll('.wallet-address-display').forEach(element => {
    if (connected && currentAccount) {
      element.textContent = currentAccount;
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  });
}

/**
 * Update navigation elements based on connection status
 * @param {boolean} connected - Whether MetaMask is connected
 */
function updateNavigation(connected) {
  // This function can be expanded based on your navigation requirements
  // For now, it just ensures the correct elements are shown/hidden
  document.querySelectorAll('.logged-in-only').forEach(element => {
    element.style.display = connected ? 'block' : 'none';
  });
  
  document.querySelectorAll('.logged-out-only').forEach(element => {
    element.style.display = connected ? 'none' : 'block';
  });
}

/**
 * Show MetaMask not installed warning
 */
function showMetaMaskNotInstalledWarning() {
  console.log('Showing MetaMask not installed warning');
  
  // Show all warning elements
  document.querySelectorAll('.metamask-not-installed').forEach(element => {
    element.style.display = 'flex';
  });
  
  // Hide connect buttons
  document.querySelectorAll('.connect-metamask-btn').forEach(button => {
    button.style.display = 'none';
  });
  
  // Show error notification
  showError('MetaMask is not installed. Please install MetaMask to use this application.');
}

/**
 * Show error notification
 * @param {string} message - Error message to display
 */
function showError(message) {
  showNotification('error', message);
}

/**
 * Show success notification
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
  showNotification('success', message);
}

/**
 * Show warning notification
 * @param {string} message - Warning message to display
 */
function showWarning(message) {
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
  
  // Add click handler to close button if not already added
  const closeButton = notificationElement.querySelector('.close-notification');
  if (closeButton) {
    closeButton.onclick = () => {
      notificationElement.classList.remove('show');
    };
  }
}

/**
 * Get network name from chain ID
 * @param {number} chainId - Chain ID in decimal format
 * @returns {string} Network name
 */
function getNetworkName(chainId) {
  return networkConfig[chainId]?.name || `Unknown Network (${chainId})`;
}

/**
 * Add connection status change listener
 * @param {Function} listener - Listener function
 */
export function addConnectionListener(listener) {
  if (typeof listener === 'function' && !connectionListeners.includes(listener)) {
    connectionListeners.push(listener);
  }
}

/**
 * Remove connection status change listener
 * @param {Function} listener - Listener function to remove
 */
export function removeConnectionListener(listener) {
  const index = connectionListeners.indexOf(listener);
  if (index !== -1) {
    connectionListeners.splice(index, 1);
  }
}

/**
 * Notify all connection listeners
 */
function notifyConnectionListeners() {
  const status = {
    isConnected,
    account: currentAccount,
    chainId: currentChainId ? parseInt(currentChainId, 16) : null,
    provider,
    signer
  };
  
  connectionListeners.forEach(listener => {
    try {
      listener(status);
    } catch (error) {
      console.error('Error in connection listener:', error);
    }
  });
}

/**
 * Get current connection status
 * @returns {Object} Connection status object
 */
export function getConnectionStatus() {
  return {
    isConnected,
    account: currentAccount,
    chainId: currentChainId ? parseInt(currentChainId, 16) : null,
    provider,
    signer
  };
}

/**
 * Get ethers.js provider
 * @returns {ethers.providers.Web3Provider|null} Ethers provider or null if not connected
 */
export function getProvider() {
  return provider;
}

/**
 * Get ethers.js signer
 * @returns {ethers.Signer|null} Ethers signer or null if not connected
 */
export function getSigner() {
  return signer;
}

/**
 * Disconnect from MetaMask (for UI purposes only, doesn't actually disconnect the wallet)
 */
export function disconnect() {
  currentAccount = null;
  isConnected = false;
  provider = null;
  signer = null;
  
  updateUI(false, null, currentChainId);
  notifyConnectionListeners();
  
  showSuccess('You have been logged out successfully.');
}

/**
 * Check if the current user is an admin
 * @returns {boolean} True if the current user is an admin
 */
export function isAdmin() {
  // If the current account matches the admin wallet address, return true
  if (currentAccount && ADMIN_WALLET_ADDRESS && 
      currentAccount.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()) {
    return true;
  }
  
  // You can also check against the smart contract if you have an admin role
  // This is a simplified version that just checks the wallet address
  return false;
}

/**
 * Get current account address
 * @returns {string|null} Current account address or null if not connected
 */
export function getCurrentAccount() {
  return currentAccount;
}

/**
 * Get explorer URL for transaction
 * @param {number} chainId - Chain ID in decimal format
 * @param {string} txHash - Transaction hash
 * @returns {string} Explorer URL
 */
export function getExplorerUrl(chainId, txHash) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Initialize blockchain contracts
 * @returns {Promise<boolean>} True if initialization successful, false otherwise
 */
export async function initContracts() {
  if (!window.ethereum || !currentAccount || !window.ethers) {
    console.error('Cannot initialize contracts: MetaMask not connected or ethers not available');
    return false;
  }

  try {
    // Initialize ethers provider and signer if not already done
    if (!provider) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
    }
    
    if (!signer) {
      signer = provider.getSigner();
    }

    // Initialize UserRegistry contract
    if (!userRegistryContract) {
      // Fetch ABI from file
      const response = await fetch('./abi/UserRegistry.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch UserRegistry ABI: ${response.statusText}`);
      }
      
      const userRegistryABI = await response.json();
      userRegistryContract = new ethers.Contract(userRegistryAddress, userRegistryABI, signer);
      console.log('UserRegistry contract initialized');
    }

    return true;
  } catch (error) {
    console.error('Error initializing contracts:', error);
    showError(`Failed to initialize blockchain contracts: ${error.message}`);
    return false;
  }
}

/**
 * Check if a user is approved in the UserRegistry contract
 * @param {string} [address] - Optional address to check, defaults to current account
 * @returns {Promise<boolean>} True if user is approved, false otherwise
 */
export async function isUserApproved(address) {
  try {
    // Initialize contracts if not already done
    await initContracts();
    
    // Use provided address or current account
    const userAddress = address || currentAccount;
    
    if (!userAddress) {
      console.error('No address provided and no current account');
      return false;
    }
    
    // Check if user is approved
    const isApproved = await userRegistryContract.isApproved(userAddress);
    return isApproved;
  } catch (error) {
    console.error('Error checking if user is approved:', error);
    return false;
  }
}

/**
 * Get user role from the UserRegistry contract
 * @param {string} [address] - Optional address to check, defaults to current account
 * @returns {Promise<string>} User role or empty string if not found
 */
export async function getUserRole(address) {
  try {
    // Initialize contracts if not already done
    await initContracts();
    
    // Use provided address or current account
    const userAddress = address || currentAccount;
    
    if (!userAddress) {
      console.error('No address provided and no current account');
      return '';
    }
    
    // Check if user is registered
    const isRegistered = await userRegistryContract.isRegistered(userAddress);
    if (!isRegistered) {
      return '';
    }
    
    // Get user role
    const role = await userRegistryContract.getUserRole(userAddress);
    return role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return '';
  }
}

/**
 * Get connection status
 * @returns {Object} Connection status object with isConnected, account, and chainId
 */
export function getConnectionStatus() {
  return {
    isConnected,
    account: currentAccount,
    chainId: currentChainId ? parseInt(currentChainId, 16) : null
  };
}

/**
 * Check if user is approved by the smart contract
 * @param {string} address - Address to check (defaults to current account)
 * @returns {Promise<boolean>} True if user is approved, false otherwise
 */
export async function isUserApproved(address = null) {
  const userAddress = address || currentAccount;
  if (!userAddress) {
    console.error('Cannot check approval: No address provided and not connected');
    return false;
  }
  
  try {
    // Initialize contracts if not already done
    if (!userRegistryContract) {
      const initialized = await initContracts();
      if (!initialized) {
        return false;
      }
    }
    
    // First check if user is registered
    const isRegistered = await userRegistryContract.isUserRegistered(userAddress);
    if (!isRegistered) {
      console.log(`User ${userAddress} is not registered`);
      return false;
    }
    
    // Then check if user is approved
    const isApproved = await userRegistryContract.isUserApproved(userAddress);
    console.log(`User ${userAddress} approval status:`, isApproved);
    return isApproved;
  } catch (error) {
    console.error('Error checking user approval:', error);
    return false;
  }
}

/**
 * Check if the current account is the admin
 * @returns {Promise<boolean>} True if the current account is the admin
 */
export async function isAdmin() {
  if (!currentAccount) return false;
  
  // Check if the current account matches the hardcoded admin address
  if (currentAccount.toLowerCase() === ADMIN_WALLET_ADDRESS?.toLowerCase()) {
    return true;
  }
  
  try {
    // Initialize contracts if not already done
    if (!userRegistryContract) {
      const initialized = await initContracts();
      if (!initialized) {
        return false;
      }
    }
    
    // Check if the current account is the admin in the contract
    const contractAdmin = await userRegistryContract.getAdmin();
    return currentAccount.toLowerCase() === contractAdmin.toLowerCase();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get user role from the contract
 * @param {string} address - Address to check (defaults to current account)
 * @returns {Promise<string>} User role or empty string if not found
 */
export async function getUserRole(address = null) {
  const userAddress = address || currentAccount;
  if (!userAddress) {
    console.error('Cannot get role: No address provided and not connected');
    return '';
  }
  
  try {
    // Initialize contracts if not already done
    if (!userRegistryContract) {
      const initialized = await initContracts();
      if (!initialized) {
        return '';
      }
    }
    
    // Check if user is registered
    const isRegistered = await userRegistryContract.isUserRegistered(userAddress);
    if (!isRegistered) {
      console.log(`User ${userAddress} is not registered`);
      return '';
    }
    
    // Get user role
    const role = await userRegistryContract.getUserRole(userAddress);
    console.log(`User ${userAddress} role:`, role);
    return role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return '';
  }
}