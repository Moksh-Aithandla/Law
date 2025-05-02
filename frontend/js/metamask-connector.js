// MetaMask connection helper for E-Vault Law Management System
import { networkConfig, defaultNetwork, getNetworkName, getExplorerUrl, getAddressExplorerUrl } from '../config.js';

// Global variables
let currentAccount = null;
let currentChainId = null;
let isConnected = false;

// Event listeners for connection status changes
const connectionListeners = [];

/**
 * Initialize MetaMask connection
 * @returns {Promise<boolean>} True if MetaMask is available, false otherwise
 */
export async function initMetaMask() {
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    console.error('MetaMask is not installed');
    updateUI(false, null, null);
    return false;
  }

  // Set up event listeners
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
  window.ethereum.on('disconnect', handleDisconnect);

  // Check if already connected
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      // User is already connected
      handleAccountsChanged(accounts);
      
      // Get current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      handleChainChanged(chainId);
      
      return true;
    } else {
      // Not connected yet
      updateUI(false, null, null);
      return true;
    }
  } catch (error) {
    console.error('Error checking MetaMask connection:', error);
    updateUI(false, null, null);
    return true;
  }
}

/**
 * Connect to MetaMask
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
export async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    showMetaMaskError('MetaMask is not installed. Please install MetaMask to use this application.');
    return false;
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    handleAccountsChanged(accounts);
    
    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    handleChainChanged(chainId);
    
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
 * Switch to the correct network (Hardhat local by default)
 * @param {number} targetChainId - Target chain ID to switch to (defaults to defaultNetwork)
 * @returns {Promise<boolean>} True if switch successful, false otherwise
 */
export async function switchToCorrectNetwork(targetChainId = defaultNetwork) {
  if (!window.ethereum || !currentChainId) return false;
  
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
          chainName: networkConfig[targetChainId]?.name || 'Unknown Network',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: [networkConfig[targetChainId]?.rpcUrl || 'http://localhost:8545'],
          blockExplorerUrls: [networkConfig[targetChainId]?.explorer || 'https://etherscan.io'],
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
 * @param {Array<string>} accounts - Array of accounts
 */
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    currentAccount = null;
    isConnected = false;
  } else {
    // User connected or switched accounts
    currentAccount = accounts[0];
    isConnected = true;
  }
  
  updateUI(isConnected, currentAccount, currentChainId);
  notifyConnectionListeners();
}

/**
 * Handle chain changed event
 * @param {string} chainId - Chain ID in hex format
 */
function handleChainChanged(chainId) {
  currentChainId = chainId;
  updateUI(isConnected, currentAccount, currentChainId);
  notifyConnectionListeners();
  
  // Reload the page to refresh the contracts with the new network
  window.location.reload();
}

/**
 * Handle disconnect event
 */
function handleDisconnect() {
  currentAccount = null;
  isConnected = false;
  updateUI(false, null, currentChainId);
  notifyConnectionListeners();
}

/**
 * Update UI elements based on connection status
 * @param {boolean} connected - Whether MetaMask is connected
 * @param {string|null} account - Current account address
 * @param {string|null} chainId - Current chain ID in hex format
 */
function updateUI(connected, account, chainId) {
  // Update wallet status
  const walletStatus = document.getElementById('wallet-status');
  const networkInfo = document.getElementById('network-info');
  
  if (walletStatus) {
    if (connected && account) {
      walletStatus.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
      walletStatus.classList.remove('wallet-disconnected');
      walletStatus.classList.add('wallet-connected');
      walletStatus.style.display = 'inline-block';
    } else {
      walletStatus.textContent = 'Not Connected';
      walletStatus.classList.remove('wallet-connected');
      walletStatus.classList.add('wallet-disconnected');
      walletStatus.style.display = 'inline-block';
    }
  }
  
  // Update network info
  if (networkInfo && chainId) {
    const chainIdDecimal = parseInt(chainId, 16);
    const networkName = networkConfig[chainIdDecimal]?.name || 'Unknown Network';
    networkInfo.textContent = networkName;
    
    // Highlight if not on the expected network
    if (chainIdDecimal !== defaultNetwork) {
      networkInfo.classList.add('wrong-network');
    } else {
      networkInfo.classList.remove('wrong-network');
    }
  }
  
  // Update connect buttons
  const connectButtons = document.querySelectorAll('.connect-metamask-btn');
  connectButtons.forEach(button => {
    if (connected) {
      button.textContent = 'Connected to MetaMask';
      button.disabled = true;
      button.classList.add('connected');
    } else {
      button.textContent = 'Connect with MetaMask';
      button.disabled = false;
      button.classList.remove('connected');
    }
  });
  
  // Update login/register status
  updateAuthSections(connected);
}

/**
 * Update authentication sections based on connection status
 * @param {boolean} connected - Whether MetaMask is connected
 */
function updateAuthSections(connected) {
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  
  if (loginSection) {
    const walletStatusLogin = document.getElementById('wallet-status-login');
    if (walletStatusLogin) {
      if (connected) {
        walletStatusLogin.textContent = 'Connected';
        walletStatusLogin.classList.remove('wallet-disconnected');
        walletStatusLogin.classList.add('wallet-connected');
      } else {
        walletStatusLogin.textContent = 'Not Connected';
        walletStatusLogin.classList.remove('wallet-connected');
        walletStatusLogin.classList.add('wallet-disconnected');
      }
    }
  }
  
  if (registerSection) {
    const walletStatusRegister = document.getElementById('wallet-status-register');
    if (walletStatusRegister) {
      if (connected) {
        walletStatusRegister.textContent = 'Connected';
        walletStatusRegister.classList.remove('wallet-disconnected');
        walletStatusRegister.classList.add('wallet-connected');
      } else {
        walletStatusRegister.textContent = 'Not Connected';
        walletStatusRegister.classList.remove('wallet-connected');
        walletStatusRegister.classList.add('wallet-disconnected');
      }
    }
  }
}

/**
 * Show MetaMask error message
 * @param {string} message - Error message to display
 */
function showMetaMaskError(message) {
  // Check if error element exists
  let errorElement = document.getElementById('metamask-error');
  
  // If not, create it
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'metamask-error';
    errorElement.className = 'metamask-error';
    document.body.appendChild(errorElement);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-error';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
      errorElement.style.display = 'none';
    };
    errorElement.appendChild(closeButton);
    
    // Add message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'error-message';
    errorElement.appendChild(messageContainer);
  }
  
  // Update message
  const messageContainer = errorElement.querySelector('.error-message');
  messageContainer.textContent = message;
  
  // Show error
  errorElement.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

/**
 * Add connection status change listener
 * @param {Function} listener - Listener function
 */
export function addConnectionListener(listener) {
  connectionListeners.push(listener);
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
    chainId: currentChainId ? parseInt(currentChainId, 16) : null
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
    chainId: currentChainId ? parseInt(currentChainId, 16) : null
  };
}

/**
 * Get ethers.js provider
 * @returns {ethers.providers.Web3Provider|null} Ethers provider or null if not connected
 */
export function getProvider() {
  if (!window.ethereum || !isConnected) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
}

/**
 * Get ethers.js signer
 * @returns {ethers.Signer|null} Ethers signer or null if not connected
 */
export function getSigner() {
  const provider = getProvider();
  if (!provider) return null;
  return provider.getSigner();
}