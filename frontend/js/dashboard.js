// Dashboard functionality for E-Vault Law Management System

document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard script loaded');
  
  // DOM Elements
  const homeLink = document.getElementById('home-link');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const dashboardLink = document.getElementById('dashboard-link');
  const myCasesLink = document.getElementById('my-cases-link');
  const newCaseLink = document.getElementById('new-case-link');
  const documentsLink = document.getElementById('documents-link');
  const profileLink = document.getElementById('profile-link');
  const backToCasesBtn = document.getElementById('back-to-cases-btn');
  
  // Sections
  const homeSection = document.getElementById('home-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const myCasesSection = document.getElementById('my-cases-section');
  const newCaseSection = document.getElementById('new-case-section');
  const documentsSection = document.getElementById('documents-section');
  const profileSection = document.getElementById('profile-section');
  const caseDetailsSection = document.getElementById('case-details-section');
  
  // Function to show a section and hide others
  function showSection(section) {
    // Hide all sections
    const sections = [
      homeSection, 
      dashboardSection, 
      myCasesSection, 
      newCaseSection, 
      documentsSection, 
      profileSection, 
      caseDetailsSection
    ];
    
    sections.forEach(s => {
      if (s) s.style.display = 'none';
    });
    
    // Show the selected section
    if (section) section.style.display = 'block';
  }
  
  // Navigation event listeners
  if (homeLink) {
    homeLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(homeSection);
    });
  }
  
  if (dashboardLink) {
    dashboardLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(dashboardSection);
    });
  }
  
  if (myCasesLink) {
    myCasesLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(myCasesSection);
    });
  }
  
  if (newCaseLink) {
    newCaseLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(newCaseSection);
    });
  }
  
  if (documentsLink) {
    documentsLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(documentsSection);
    });
  }
  
  if (profileLink) {
    profileLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(profileSection);
    });
  }
  
  if (backToCasesBtn) {
    backToCasesBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showSection(myCasesSection);
    });
  }
  
  // Initialize wallet connection
  initializeWallet();
  
  // Show dashboard by default for logged in users, otherwise show home
  const user = localStorage.getItem('user');
  if (user && dashboardSection) {
    showSection(dashboardSection);
  } else if (homeSection) {
    showSection(homeSection);
  }
});

// Initialize wallet connection
async function initializeWallet() {
  const walletStatus = document.getElementById('wallet-status');
  const networkInfo = document.getElementById('network-info');
  
  if (!walletStatus || !networkInfo) return;
  
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      walletStatus.style.display = 'inline-block';
      
      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        walletStatus.textContent = 'Connected: ' + accounts[0].substring(0, 6) + '...' + accounts[0].substring(38);
        walletStatus.classList.add('wallet-connected');
        
        // Get network information
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        let network = 'Unknown Network';
        
        switch (chainId) {
          case '0x1':
            network = 'Ethereum Mainnet';
            break;
          case '0x3':
            network = 'Ropsten Testnet';
            break;
          case '0x4':
            network = 'Rinkeby Testnet';
            break;
          case '0x5':
            network = 'Goerli Testnet';
            break;
          case '0xaa36a7':
            network = 'Sepolia Testnet';
            break;
          case '0x7a69':
            network = 'Hardhat Local';
            break;
          default:
            network = 'Unknown Network';
        }
        
        networkInfo.textContent = network;
      } else {
        walletStatus.textContent = 'Wallet not connected';
        walletStatus.classList.add('wallet-disconnected');
        networkInfo.textContent = 'Not connected';
      }
    } else {
      walletStatus.textContent = 'MetaMask not installed';
      walletStatus.classList.add('wallet-disconnected');
      networkInfo.textContent = 'No wallet';
    }
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    walletStatus.textContent = 'Connection error';
    walletStatus.classList.add('wallet-disconnected');
    networkInfo.textContent = 'Error';
  }
}