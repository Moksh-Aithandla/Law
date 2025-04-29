// Simple initialization script for E-Vault Law Management System

document.addEventListener('DOMContentLoaded', function() {
  console.log('E-Vault Law Management System initialized');
  
  // Check if MetaMask is installed
  if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed');
    
    // Update wallet status
    const walletStatus = document.getElementById('wallet-status');
    if (walletStatus) {
      walletStatus.style.display = 'inline-block';
      walletStatus.textContent = 'Wallet detected';
      walletStatus.classList.add('wallet-detected');
    }
    
    // Add connect wallet button functionality
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener('click', async function() {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('Connected accounts:', accounts);
          
          if (accounts.length > 0) {
            // Update wallet status
            if (walletStatus) {
              walletStatus.textContent = 'Connected: ' + accounts[0].substring(0, 6) + '...' + accounts[0].substring(38);
              walletStatus.classList.remove('wallet-detected');
              walletStatus.classList.add('wallet-connected');
            }
            
            // Store connected address
            localStorage.setItem('connectedAddress', accounts[0]);
            
            // Redirect to dashboard if user is logged in
            const user = localStorage.getItem('user');
            if (user) {
              window.location.href = '/client-dashboard.html';
            }
          }
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
          alert('Failed to connect to MetaMask: ' + error.message);
        }
      });
    }
  } else {
    console.log('MetaMask is not installed');
    
    // Update wallet status
    const walletStatus = document.getElementById('wallet-status');
    if (walletStatus) {
      walletStatus.style.display = 'inline-block';
      walletStatus.textContent = 'MetaMask not installed';
      walletStatus.classList.add('wallet-not-installed');
    }
    
    // Disable connect wallet button
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
      connectWalletBtn.disabled = true;
      connectWalletBtn.title = 'Please install MetaMask to connect your wallet';
    }
  }
  
  // Add event listeners for navigation
  setupNavigation();
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