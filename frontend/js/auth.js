he// Authentication and User Management for E-Vault Law Management System

import { 
  connectToMetaMask, 
  isUserRegistered, 
  getUserRole, 
  isUserApproved 
} from './blockchain-utils.js';

// Store user data
let currentUser = {
  address: null,
  role: null,
  isRegistered: false,
  isApproved: false
};

// Initialize authentication
async function initAuth() {
  try {
    // Connect to MetaMask
    const address = await connectToMetaMask();
    currentUser.address = address;
    
    // Check if user is registered
    currentUser.isRegistered = await isUserRegistered(address);
    
    if (currentUser.isRegistered) {
      // Get user role and approval status
      currentUser.role = await getUserRole(address);
      currentUser.isApproved = await isUserApproved(address);
      
      // Store user data in session storage
      sessionStorage.setItem('userAddress', address);
      sessionStorage.setItem('userRole', currentUser.role);
      sessionStorage.setItem('userIsApproved', currentUser.isApproved);
      
      // Route user based on role and approval status
      routeUser();
    } else {
      // User is not registered, show access denied message
      displayError('You are not registered. Please contact Admin.');
      
      // Create access denied message
      const container = document.querySelector('.container');
      if (container) {
        container.innerHTML = `
          <div class="row justify-content-center mt-5">
            <div class="col-md-6">
              <div class="card shadow">
                <div class="card-header bg-danger text-white text-center">
                  <h2>Access Denied</h2>
                </div>
                <div class="card-body text-center">
                  <div class="mb-4">
                    <i class="bi bi-shield-lock" style="font-size: 4rem;"></i>
                  </div>
                  
                  <div class="alert alert-danger">
                    <p>You are not registered. Please contact the Admin to get registered.</p>
                  </div>
                  
                  <div class="d-grid gap-2 mt-4">
                    <button id="check-status-btn" class="btn btn-primary">Check Again</button>
                  </div>
                </div>
                <div class="card-footer text-center">
                  <p class="mb-0">If you believe this is an error, please contact support.</p>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Add event listener to check status button
        const checkStatusBtn = document.getElementById('check-status-btn');
        if (checkStatusBtn) {
          checkStatusBtn.addEventListener('click', () => {
            window.location.reload();
          });
        }
      }
    }
    
    return currentUser;
  } catch (error) {
    console.error('Authentication error:', error);
    displayError(error.message);
    throw error;
  }
}

// Route user based on role and approval status
function routeUser() {
  // Get current page
  const currentPage = window.location.pathname.split('/').pop();
  
  // If user is not approved, show access denied message
  if (!currentUser.isApproved) {
    displayError('Your account is not approved. Please contact Admin.');
    
    // Create access denied message
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div class="row justify-content-center mt-5">
          <div class="col-md-6">
            <div class="card shadow">
              <div class="card-header bg-warning text-dark text-center">
                <h2>Account Not Approved</h2>
              </div>
              <div class="card-body text-center">
                <div class="mb-4">
                  <i class="bi bi-hourglass-split" style="font-size: 4rem;"></i>
                </div>
                
                <div class="alert alert-warning">
                  <p>Your account is pending approval by an admin. Please check back later.</p>
                </div>
                
                <div class="d-grid gap-2 mt-4">
                  <button id="check-status-btn" class="btn btn-primary">Check Again</button>
                </div>
              </div>
              <div class="card-footer text-center">
                <p class="mb-0">If your account is not approved within 24 hours, please contact support.</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add event listener to check status button
      const checkStatusBtn = document.getElementById('check-status-btn');
      if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', () => {
          window.location.reload();
        });
      }
    }
    return;
  }
  
  // If user is on the index page or login page, redirect to appropriate dashboard
  if (currentPage === 'index.html' || currentPage === 'login.html' || currentPage === '') {
    switch (currentUser.role) {
      case 'admin':
        window.location.href = 'admin-dashboard.html';
        break;
      case 'lawyer':
        window.location.href = 'lawyer-dashboard.html';
        break;
      case 'judge':
        window.location.href = 'judge-dashboard.html';
        break;
      case 'client':
        window.location.href = 'client-dashboard.html';
        break;
      default:
        // Unknown role, show error
        displayError('Unknown user role. Please contact Admin.');
    }
  }
}

// Check if user is authorized for the current page
function checkAuthorization() {
  // Get current page
  const currentPage = window.location.pathname.split('/').pop();
  
  // Get user data from session storage
  const userRole = sessionStorage.getItem('userRole');
  const userIsApproved = sessionStorage.getItem('userIsApproved') === 'true';
  
  // If user is not approved, show access denied message
  if (!userIsApproved) {
    displayError('Your account is not approved. Please contact Admin.');
    
    // Create access denied message
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div class="row justify-content-center mt-5">
          <div class="col-md-6">
            <div class="card shadow">
              <div class="card-header bg-warning text-dark text-center">
                <h2>Account Not Approved</h2>
              </div>
              <div class="card-body text-center">
                <div class="mb-4">
                  <i class="bi bi-hourglass-split" style="font-size: 4rem;"></i>
                </div>
                
                <div class="alert alert-warning">
                  <p>Your account is pending approval by an admin. Please check back later.</p>
                </div>
                
                <div class="d-grid gap-2 mt-4">
                  <button id="check-status-btn" class="btn btn-primary">Check Again</button>
                </div>
              </div>
              <div class="card-footer text-center">
                <p class="mb-0">If your account is not approved within 24 hours, please contact support.</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add event listener to check status button
      const checkStatusBtn = document.getElementById('check-status-btn');
      if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', () => {
          window.location.reload();
        });
      }
    }
    return false;
  }
  
  // Check page access based on role
  if (currentPage.includes('admin') && userRole !== 'admin') {
    displayError('You do not have permission to access this page.');
    
    // Create access denied message
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div class="row justify-content-center mt-5">
          <div class="col-md-6">
            <div class="card shadow">
              <div class="card-header bg-danger text-white text-center">
                <h2>Access Denied</h2>
              </div>
              <div class="card-body text-center">
                <div class="mb-4">
                  <i class="bi bi-shield-lock" style="font-size: 4rem;"></i>
                </div>
                
                <div class="alert alert-danger">
                  <p>You do not have permission to access this page.</p>
                </div>
                
                <div class="d-grid gap-2 mt-4">
                  <button id="back-btn" class="btn btn-primary">Go Back</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add event listener to back button
      const backBtn = document.getElementById('back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.history.back();
        });
      }
    }
    return false;
  }
  
  if (currentPage.includes('lawyer') && userRole !== 'lawyer') {
    displayError('You do not have permission to access this page.');
    return false;
  }
  
  if (currentPage.includes('judge') && userRole !== 'judge') {
    displayError('You do not have permission to access this page.');
    return false;
  }
  
  if (currentPage.includes('client') && userRole !== 'client') {
    displayError('You do not have permission to access this page.');
    return false;
  }
  
  return true;
}

// Display error message
function displayError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  } else {
    alert(`Error: ${message}`);
  }
}

// Check if MetaMask is installed
function isMetaMaskInstalled() {
  return window.ethereum !== undefined;
}

// Logout user
function logout() {
  // Clear session storage
  sessionStorage.removeItem('userAddress');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('userIsApproved');
  
  // Redirect to login page
  window.location.href = 'index.html';
}

// Export functions
export {
  initAuth,
  routeUser,
  checkAuthorization,
  displayError,
  isMetaMaskInstalled,
  logout,
  currentUser
};