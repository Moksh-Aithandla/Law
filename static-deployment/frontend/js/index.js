// Main initialization script for E-Vault Law Management System
import { initMetaMask, connectMetaMask, addConnectionListener } from './metamask-connector.js';

document.addEventListener('DOMContentLoaded', async function() {
  console.log('E-Vault Law Management System initializing...');
  
  try {
    // Initialize MetaMask connection
    const isMetaMaskAvailable = await initMetaMask();
    
    // Check if MetaMask is installed
    if (isMetaMaskAvailable) {
      console.log('MetaMask is available');
      
      // Hide MetaMask not installed warnings
      document.getElementById('metamask-not-installed')?.style.display = 'none';
      document.getElementById('metamask-not-installed-register')?.style.display = 'none';
      
      // Add connect wallet button functionality
      const connectButtons = [
        document.getElementById('connect-metamask'),
        document.getElementById('connect-metamask-register'),
        document.getElementById('connect-metamask-home')
      ];
      
      connectButtons.forEach(button => {
        if (button) {
          button.addEventListener('click', async () => {
            await connectMetaMask();
          });
        }
      });
    } else {
      console.log('MetaMask is not installed');
      
      // Show MetaMask not installed warnings
      document.getElementById('metamask-not-installed')?.style.display = 'block';
      document.getElementById('metamask-not-installed-register')?.style.display = 'block';
      
      // Disable connect buttons
      const connectButtons = [
        document.getElementById('connect-metamask'),
        document.getElementById('connect-metamask-register'),
        document.getElementById('connect-metamask-home')
      ];
      
      connectButtons.forEach(button => {
        if (button) {
          button.disabled = true;
          button.textContent = 'MetaMask Not Installed';
        }
      });
    }
    
    // Add connection status listener
    addConnectionListener(status => {
      console.log('Connection status changed:', status);
      
      // Enable/disable register button based on connection status
      const registerSubmitBtn = document.getElementById('register-submit');
      if (registerSubmitBtn) {
        registerSubmitBtn.disabled = !status.isConnected;
        
        // Update help text
        const helpText = registerSubmitBtn.nextElementSibling;
        if (helpText && helpText.classList.contains('help-text')) {
          helpText.textContent = status.isConnected 
            ? 'Click to register your account' 
            : 'Connect MetaMask to enable registration';
        }
      }
    });
    
    // Set up navigation
    setupNavigation();
    
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});

// Function to set up navigation
function setupNavigation() {
  // Home link
  document.getElementById('home-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('home-section');
  });
  
  // Login link and button
  document.getElementById('login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login-section');
  });
  
  document.getElementById('login-btn')?.addEventListener('click', () => {
    showSection('login-section');
  });
  
  // Register link and button
  document.getElementById('register-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register-section');
  });
  
  document.getElementById('register-btn')?.addEventListener('click', () => {
    showSection('register-section');
  });
  
  // View cases button
  document.getElementById('view-cases-btn')?.addEventListener('click', () => {
    showSection('all-cases-section');
  });
  
  // Back buttons
  document.getElementById('back-to-home')?.addEventListener('click', () => {
    showSection('home-section');
  });
  
  document.getElementById('back-to-cases')?.addEventListener('click', () => {
    showSection('all-cases-section');
  });
  
  document.getElementById('back-to-home-from-blockchain')?.addEventListener('click', () => {
    showSection('home-section');
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
  
  // View blockchain info
  document.getElementById('view-blockchain-btn')?.addEventListener('click', () => {
    showSection('blockchain-section');
  });
  
  // View transactions
  document.getElementById('view-transactions-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = document.getElementById('transactions-modal');
    if (modal) {
      modal.style.display = 'block';
    }
  });
  
  // Close modal
  const closeButtons = document.getElementsByClassName('close');
  for (let i = 0; i < closeButtons.length; i++) {
    closeButtons[i].addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
      if (event.target === modals[i]) {
        modals[i].style.display = 'none';
      }
    }
  });
  
  // Handle role selection in registration
  const roleSelect = document.getElementById('register-role');
  const idField = document.getElementById('id-field');
  
  if (roleSelect && idField) {
    roleSelect.addEventListener('change', function() {
      const selectedRole = this.value;
      if (selectedRole === 'lawyer' || selectedRole === 'judge') {
        idField.style.display = 'block';
      } else {
        idField.style.display = 'none';
      }
    });
  }
}

// Function to show a specific section and hide others
function showSection(sectionId) {
  const sections = document.querySelectorAll('main > section');
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
}
      
      const connectWalletHandler = async function() {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('Connected accounts:', accounts);
          
          if (accounts.length > 0) {
            // Update all wallet status elements
            const walletStatusElements = document.querySelectorAll('.wallet-status-text');
            walletStatusElements.forEach(element => {
              element.textContent = 'Connected: ' + accounts[0].substring(0, 6) + '...' + accounts[0].substring(38);
              element.classList.remove('wallet-disconnected');
              element.classList.add('wallet-connected');
            });
            
            // Store connected address
            localStorage.setItem('connectedAddress', accounts[0]);
            
            // Enable register form if on register page
            const registerForm = document.getElementById('register-form');
            if (registerForm) {
              const formElements = registerForm.querySelectorAll('input, select, button');
              formElements.forEach(element => {
                element.disabled = false;
              });
            }
            
            // Redirect to dashboard if user is logged in
            const user = localStorage.getItem('user');
            if (user) {
              const userData = JSON.parse(user);
              window.location.href = `/${userData.role}-dashboard.html`;
            }
          }
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
          alert('Failed to connect to MetaMask: ' + error.message);
        }
      };
      
      if (connectMetamaskBtn) {
        connectMetamaskBtn.addEventListener('click', connectWalletHandler);
      }
      
      if (connectMetamaskRegisterBtn) {
        connectMetamaskRegisterBtn.addEventListener('click', connectWalletHandler);
      }
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', function (accounts) {
        console.log('Account changed:', accounts);
        if (accounts.length === 0) {
          // User disconnected all accounts
          const walletStatusElements = document.querySelectorAll('.wallet-status-text');
          walletStatusElements.forEach(element => {
            element.textContent = 'Not connected';
            element.classList.remove('wallet-connected');
            element.classList.add('wallet-disconnected');
          });
          
          localStorage.removeItem('connectedAddress');
        } else {
          // Account changed
          const walletStatusElements = document.querySelectorAll('.wallet-status-text');
          walletStatusElements.forEach(element => {
            element.textContent = 'Connected: ' + accounts[0].substring(0, 6) + '...' + accounts[0].substring(38);
          });
          
          localStorage.setItem('connectedAddress', accounts[0]);
        }
      });
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', function (chainId) {
        console.log('Network changed:', chainId);
        // Reload the page
        window.location.reload();
      });
    } else {
      console.log('MetaMask is not installed');
      
      // Update wallet status
      const walletStatus = document.getElementById('wallet-status');
      if (walletStatus) {
        walletStatus.style.display = 'inline-block';
        walletStatus.textContent = 'MetaMask not installed';
        walletStatus.classList.add('wallet-not-installed');
      }
      
      // Show MetaMask installation message
      const walletStatusElements = document.querySelectorAll('.wallet-status-text');
      walletStatusElements.forEach(element => {
        element.innerHTML = 'MetaMask not installed. <a href="https://metamask.io/download.html" target="_blank">Install MetaMask</a>';
        element.classList.add('wallet-not-installed');
      });
      
      // Disable connect wallet buttons
      const connectWalletBtns = document.querySelectorAll('.btn-metamask');
      connectWalletBtns.forEach(btn => {
        btn.disabled = true;
        btn.title = 'Please install MetaMask to connect your wallet';
      });
    }
    
    console.log('E-Vault Law Management System initialized successfully');
  } catch (error) {
    console.error('Error initializing E-Vault Law Management System:', error);
  }
});

// Setup navigation event listeners
function setupNavigation() {
  // Get navigation elements
  const homeLink = document.getElementById('home-link');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  
  // Get sections
  const homeSection = document.getElementById('home-section');
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  
  // Function to show a section and hide others
  function showSection(section) {
    // Hide all sections
    if (homeSection) homeSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    
    // Show the selected section
    if (section) section.style.display = 'block';
  }
  
  // Add event listeners
  if (homeLink) {
    homeLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(homeSection);
    });
  }
  
  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(loginSection);
    });
  }
  
  if (registerLink) {
    registerLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(registerSection);
    });
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(loginSection);
    });
  }
  
  if (registerBtn) {
    registerBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(registerSection);
    });
  }
  
  // Add form submission handlers
  setupForms();
}

// Setup form submission handlers
function setupForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      // Simple validation
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      
      // Simulate login (in a real app, this would call an API)
      console.log('Login attempt:', { email });
      
      // Store user data in localStorage (for demo purposes only)
      const user = {
        name: 'Demo User',
        email: email,
        role: 'client'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to dashboard
      window.location.href = '/client-dashboard.html';
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      // Simple validation
      if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      // Simulate registration (in a real app, this would call an API)
      console.log('Registration attempt:', { name, email });
      
      // Store user data in localStorage (for demo purposes only)
      const user = {
        name: name,
        email: email,
        role: 'client'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to dashboard
      window.location.href = '/client-dashboard.html';
    });
  }
}