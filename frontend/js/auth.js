// Authentication functionality for E-Vault Law Management System
import * as blockchainUtils from './blockchain-utils.js';

// DOM elements
let connectWalletBtn;
let loginForm;
let registerForm;
let loginError;
let registerError;
let roleSelect;
let idField;
let walletStatus;
let networkInfo;

// Initialize authentication
async function initAuth() {
  // Get DOM elements
  connectWalletBtn = document.getElementById('connect-metamask');
  loginForm = document.getElementById('login-form');
  registerForm = document.getElementById('register-form');
  loginError = document.getElementById('login-error');
  registerError = document.getElementById('register-error');
  roleSelect = document.getElementById('register-role');
  idField = document.getElementById('id-field');
  walletStatus = document.getElementById('wallet-status');
  networkInfo = document.getElementById('network-info');
  
  // Set up event listeners
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', connectWallet);
  }
  
  if (roleSelect) {
    roleSelect.addEventListener('change', handleRoleChange);
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Check if user is already logged in
  const user = getLoggedInUser();
  if (user) {
    // Redirect to appropriate dashboard
    redirectToDashboard(user.role);
  }
  
  // Initialize blockchain
  try {
    await blockchainUtils.initBlockchain();
    updateWalletStatus();
    updateNetworkInfo();
  } catch (error) {
    console.error("Error initializing blockchain:", error);
  }
  
  // Set up event listeners for MetaMask events
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => {
      updateWalletStatus();
      // If user is logged in, log them out
      if (getLoggedInUser()) {
        logout();
        window.location.href = '/';
      }
    });
    
    window.ethereum.on('chainChanged', () => {
      updateNetworkInfo();
      window.location.reload();
    });
  }
}

// Connect wallet
async function connectWallet() {
  try {
    await blockchainUtils.initBlockchain();
    updateWalletStatus();
    
    // Check if user is registered
    const isRegistered = await blockchainUtils.isUserRegistered();
    if (isRegistered) {
      // Get user details
      const userDetails = await blockchainUtils.getUserDetails();
      
      // Log in user
      const user = {
        address: blockchainUtils.getCurrentAccount(),
        name: userDetails.name,
        email: userDetails.email,
        role: userDetails.role,
        id: userDetails.id
      };
      
      loginUser(user);
      
      // Show success message
      if (loginError) {
        loginError.textContent = "Login successful! Redirecting...";
        loginError.className = "success";
      }
      
      // Redirect to dashboard
      setTimeout(() => {
        redirectToDashboard(user.role);
      }, 1000);
    } else {
      // User is not registered
      if (loginError) {
        loginError.textContent = "Wallet connected, but not registered. Please register first.";
        loginError.className = "error";
      }
      
      // Redirect to registration page
      setTimeout(() => {
        window.location.href = '/register.html';
      }, 2000);
    }
  } catch (error) {
    console.error("Error connecting wallet:", error);
    if (loginError) {
      loginError.textContent = "Error connecting wallet: " + error.message;
      loginError.className = "error";
    }
  }
}

// Handle role change
function handleRoleChange() {
  if (roleSelect && idField) {
    const role = roleSelect.value;
    if (role === 'lawyer' || role === 'judge') {
      idField.style.display = 'block';
    } else {
      idField.style.display = 'none';
    }
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  
  try {
    // Connect wallet
    await connectWallet();
  } catch (error) {
    console.error("Error during login:", error);
    if (loginError) {
      loginError.textContent = "Error during login: " + error.message;
      loginError.className = "error";
    }
  }
}

// Handle registration
async function handleRegister(event) {
  event.preventDefault();
  
  try {
    // Get form values
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const role = document.getElementById('register-role').value;
    const id = document.getElementById('register-id')?.value || '';
    
    // Validate form
    if (!name || !email || !role) {
      registerError.textContent = "Please fill in all required fields";
      registerError.className = "error";
      return;
    }
    
    if ((role === 'lawyer' || role === 'judge') && !id) {
      registerError.textContent = `Please enter your ${role === 'lawyer' ? 'Bar ID' : 'Judicial ID'}`;
      registerError.className = "error";
      return;
    }
    
    // Connect to blockchain
    await blockchainUtils.initBlockchain();
    updateWalletStatus();
    
    // Check if user is already registered
    const isRegistered = await blockchainUtils.isUserRegistered();
    if (isRegistered) {
      registerError.textContent = "This wallet is already registered. Please use a different wallet or login.";
      registerError.className = "error";
      return;
    }
    
    // Register user based on role
    let success = false;
    if (role === 'client') {
      success = await blockchainUtils.registerAsClient(name, email);
    } else if (role === 'lawyer') {
      success = await blockchainUtils.registerAsLawyer(name, email, id);
    } else if (role === 'judge') {
      success = await blockchainUtils.registerAsJudge(name, email, id);
    }
    
    if (success) {
      // Get user details
      const userDetails = await blockchainUtils.getUserDetails();
      
      // Log in user
      const user = {
        address: blockchainUtils.getCurrentAccount(),
        name: userDetails.name,
        email: userDetails.email,
        role: userDetails.role,
        id: userDetails.id
      };
      
      loginUser(user);
      
      // Show success message
      registerError.textContent = "Registration successful! Redirecting...";
      registerError.className = "success";
      
      // Redirect to dashboard
      setTimeout(() => {
        redirectToDashboard(user.role);
      }, 1000);
    } else {
      registerError.textContent = "Registration failed. Please try again.";
      registerError.className = "error";
    }
  } catch (error) {
    console.error("Error during registration:", error);
    registerError.textContent = "Error during registration: " + error.message;
    registerError.className = "error";
  }
}

// Update wallet status
function updateWalletStatus() {
  if (walletStatus) {
    const account = blockchainUtils.getCurrentAccount();
    if (account) {
      walletStatus.textContent = `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
      walletStatus.className = "wallet-status wallet-connected";
      walletStatus.style.display = "inline-block";
    } else {
      walletStatus.textContent = "Not connected";
      walletStatus.className = "wallet-status wallet-disconnected";
      walletStatus.style.display = "inline-block";
    }
  }
}

// Update network info
function updateNetworkInfo() {
  if (networkInfo) {
    const network = blockchainUtils.getNetworkInfo();
    networkInfo.textContent = `Network: ${network.name}`;
    networkInfo.style.display = "inline-block";
  }
}

// Login user
function loginUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Logout user
function logout() {
  localStorage.removeItem('user');
}

// Get logged in user
function getLoggedInUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Redirect to dashboard based on role
function redirectToDashboard(role) {
  if (role === 'client') {
    window.location.href = '/client-dashboard.html';
  } else if (role === 'lawyer') {
    window.location.href = '/lawyer-dashboard.html';
  } else if (role === 'judge') {
    window.location.href = '/judge-dashboard.html';
  } else {
    window.location.href = '/';
  }
}

// Check if user is authorized for a page
function checkAuthorization(allowedRoles) {
  const user = getLoggedInUser();
  
  if (!user) {
    // User is not logged in
    window.location.href = '/login.html';
    return false;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // User is not authorized for this page
    window.location.href = '/unauthorized.html';
    return false;
  }
  
  return true;
}

// Export functions
export {
  initAuth,
  connectWallet,
  handleLogin,
  handleRegister,
  loginUser,
  logout,
  getLoggedInUser,
  redirectToDashboard,
  checkAuthorization
};

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);