document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const homeSection = document.getElementById('home-section');
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  const lawyerDashboard = document.getElementById('lawyer-dashboard');
  const judgeDashboard = document.getElementById('judge-dashboard');
  const clientDashboard = document.getElementById('client-dashboard');
  
  // Navigation links
  const homeLink = document.getElementById('home-link');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const toRegisterLink = document.getElementById('to-register');
  const toLoginLink = document.getElementById('to-login');
  
  // Logout buttons
  const lawyerLogout = document.getElementById('lawyer-logout');
  const judgeLogout = document.getElementById('judge-logout');
  const clientLogout = document.getElementById('client-logout');
  
  // Helper function to show a specific section
  function showSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('main > section');
    sections.forEach(s => {
      s.style.display = 'none';
    });
    
    // Show the requested section
    if (section) {
      section.style.display = 'block';
    }
  }
  
  // Navigation event listeners
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(homeSection);
    });
  }
  
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(loginSection);
    });
  }
  
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(registerSection);
    });
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      showSection(loginSection);
    });
  }
  
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      showSection(registerSection);
    });
  }
  
  if (toRegisterLink) {
    toRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(registerSection);
    });
  }
  
  if (toLoginLink) {
    toLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(loginSection);
    });
  }
  
  // Wallet connection options
  const walletOptionMetamask = document.getElementById('wallet-option-metamask');
  const walletOptionManual = document.getElementById('wallet-option-manual');
  const metamaskConnectSection = document.getElementById('metamask-connect-section');
  const manualWalletSection = document.getElementById('manual-wallet-section');
  
  // Toggle between MetaMask and manual wallet entry
  if (walletOptionMetamask && walletOptionManual) {
    walletOptionMetamask.addEventListener('change', function() {
      if (this.checked) {
        metamaskConnectSection.style.display = 'block';
        manualWalletSection.style.display = 'none';
      }
    });
    
    walletOptionManual.addEventListener('change', function() {
      if (this.checked) {
        metamaskConnectSection.style.display = 'none';
        manualWalletSection.style.display = 'block';
      }
    });
  }
  
  // Connect MetaMask button
  const connectMetamaskBtn = document.getElementById('connect-metamask');
  const connectMetamaskRegisterBtn = document.getElementById('connect-metamask-register');
  
  if (connectMetamaskBtn) {
    connectMetamaskBtn.addEventListener('click', async () => {
      try {
        const walletStatusLogin = document.getElementById('wallet-status-login');
        walletStatusLogin.textContent = 'Connecting...';
        
        // Initialize blockchain connection
        if (window.ethereum) {
          // Create ethers provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          if (accounts && accounts.length > 0) {
            const currentAccount = accounts[0];
            walletStatusLogin.textContent = `Connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
            walletStatusLogin.className = 'wallet-status-text wallet-connected';
            
            // Store wallet address in localStorage
            localStorage.setItem('walletAddress', currentAccount);
            localStorage.setItem('walletConnectionMethod', 'metamask');
          } else {
            walletStatusLogin.textContent = 'No accounts found. Please unlock MetaMask.';
            walletStatusLogin.className = 'wallet-status-text wallet-disconnected';
          }
        } else {
          walletStatusLogin.textContent = 'MetaMask not detected. Please install MetaMask.';
          walletStatusLogin.className = 'wallet-status-text wallet-disconnected';
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        const walletStatusLogin = document.getElementById('wallet-status-login');
        walletStatusLogin.textContent = 'Error connecting to MetaMask';
        walletStatusLogin.className = 'wallet-status-text wallet-disconnected';
      }
    });
  }
  
  // Save manual wallet address
  const saveManualWalletBtn = document.getElementById('save-manual-wallet');
  if (saveManualWalletBtn) {
    saveManualWalletBtn.addEventListener('click', () => {
      const manualWalletAddress = document.getElementById('manual-wallet-address').value.trim();
      const manualWalletStatus = document.getElementById('manual-wallet-status');
      
      // Validate Ethereum address format
      if (!manualWalletAddress) {
        manualWalletStatus.textContent = 'Please enter a wallet address';
        manualWalletStatus.className = 'wallet-status-text wallet-disconnected';
        return;
      }
      
      if (!/^0x[a-fA-F0-9]{40}$/.test(manualWalletAddress)) {
        manualWalletStatus.textContent = 'Invalid Ethereum address format';
        manualWalletStatus.className = 'wallet-status-text wallet-disconnected';
        return;
      }
      
      // Store wallet address in localStorage
      localStorage.setItem('walletAddress', manualWalletAddress);
      localStorage.setItem('walletConnectionMethod', 'manual');
      
      manualWalletStatus.textContent = `Saved: ${manualWalletAddress.substring(0, 6)}...${manualWalletAddress.substring(manualWalletAddress.length - 4)}`;
      manualWalletStatus.className = 'wallet-status-text wallet-connected';
    });
  }
  
  // For registration, we'll automatically connect to MetaMask when the register button is clicked
  // This simplifies the process and ensures users have MetaMask installed
  if (connectMetamaskRegisterBtn) {
    connectMetamaskRegisterBtn.addEventListener('click', async () => {
      try {
        const walletStatusRegister = document.getElementById('wallet-status-register');
        walletStatusRegister.textContent = 'Connecting...';
        
        // Initialize blockchain connection
        if (window.ethereum) {
          // Create ethers provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          if (accounts && accounts.length > 0) {
            const currentAccount = accounts[0];
            walletStatusRegister.textContent = `Connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
            walletStatusRegister.className = 'wallet-status-text wallet-connected';
            
            // Store wallet address in localStorage
            localStorage.setItem('walletAddress', currentAccount);
            localStorage.setItem('walletConnectionMethod', 'metamask');
          } else {
            walletStatusRegister.textContent = 'No accounts found. Please unlock MetaMask.';
            walletStatusRegister.className = 'wallet-status-text wallet-disconnected';
          }
        } else {
          walletStatusRegister.textContent = 'MetaMask not detected. Please install MetaMask.';
          walletStatusRegister.className = 'wallet-status-text wallet-disconnected';
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        const walletStatusRegister = document.getElementById('wallet-status-register');
        walletStatusRegister.textContent = 'Error connecting to MetaMask';
        walletStatusRegister.className = 'wallet-status-text wallet-disconnected';
      }
    });
  }

  // Login form submission
  const loginSubmit = document.getElementById('login-submit');
  if (loginSubmit) {
    loginSubmit.addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const id = document.getElementById('login-id').value.trim();
      const errorElement = document.getElementById('login-error');
      
      if (!email) {
        errorElement.textContent = 'Email is required';
        return;
      }
      
      // Check if wallet is connected
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        // Check which wallet option is selected
        if (walletOptionMetamask.checked) {
          errorElement.textContent = 'Please connect your MetaMask wallet first';
        } else {
          errorElement.textContent = 'Please enter and save your wallet address first';
        }
        return;
      }
      
      try {
        // Fetch users from our API
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        
        // Find the user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          // For judges and lawyers, verify ID
          if ((user.role === 'judge' || user.role === 'lawyer') && !id) {
            errorElement.textContent = 'ID is required for judges and lawyers';
            return;
          }
          
          if (user.role === 'judge' && user.id !== id) {
            errorElement.textContent = 'Invalid Judicial ID';
            return;
          }
          
          if (user.role === 'lawyer' && user.id !== id) {
            errorElement.textContent = 'Invalid Bar ID';
            return;
          }
          
          // Check if this wallet is already linked to another account
          const existingUser = users.find(u => u.walletAddress && u.walletAddress.toLowerCase() === walletAddress.toLowerCase() && u.email.toLowerCase() !== email.toLowerCase());
          if (existingUser) {
            errorElement.textContent = `This wallet is already linked to ${existingUser.name} (${existingUser.email})`;
            return;
          }
          
          // Update user with wallet address if not already set
          if (!user.walletAddress) {
            user.walletAddress = walletAddress;
            user.walletConnectionMethod = localStorage.getItem('walletConnectionMethod') || 'manual';
            // In a real app, we would update the user in the database
            console.log(`Linked wallet ${walletAddress} to user ${user.email}`);
          } else if (user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            errorElement.textContent = 'This account is linked to a different wallet address';
            return;
          }
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('activeRole', user.role);
          
          // Show appropriate dashboard
          showDashboard(user.role, user);
          
          // Clear form
          document.getElementById('login-email').value = '';
          document.getElementById('login-id').value = '';
          if (document.getElementById('manual-wallet-address')) {
            document.getElementById('manual-wallet-address').value = '';
          }
          errorElement.textContent = '';
          
          // Record the login as a transaction
          const txInfo = {
            hash: '0x' + Math.random().toString(16).substr(2, 64), // Simulated transaction hash
            blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
            timestamp: Date.now(),
            type: 'User Login',
            details: `${user.name} (${user.role}) logged in`
          };
          
          // Get existing transactions or initialize empty array
          const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
          transactions.push(txInfo);
          localStorage.setItem('transactions', JSON.stringify(transactions));
          
        } else {
          errorElement.textContent = 'User not found';
        }
      } catch (error) {
        console.error('Error during login:', error);
        errorElement.textContent = 'Error logging in. Please try again.';
      }
    });
  }
  
  // Register form submission
  const registerSubmit = document.getElementById('register-submit');
  if (registerSubmit) {
    registerSubmit.addEventListener('click', async () => {
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const role = document.getElementById('register-role').value;
      const id = document.getElementById('register-id').value.trim();
      const errorElement = document.getElementById('register-error');
      
      if (!name || !email || !role) {
        errorElement.textContent = 'Name, email, and role are required';
        return;
      }
      
      if ((role === 'judge' || role === 'lawyer') && !id) {
        errorElement.textContent = 'ID is required for judges and lawyers';
        return;
      }
      
      // Check if wallet is connected
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        errorElement.textContent = 'Please connect your MetaMask wallet first';
        return;
      }
      
      try {
        // Fetch existing users to check for duplicates
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        
        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          errorElement.textContent = 'Email already registered';
          return;
        }
        
        // Check if wallet address is already linked to another account
        if (users.some(u => u.walletAddress && u.walletAddress.toLowerCase() === walletAddress.toLowerCase())) {
          errorElement.textContent = 'This wallet address is already linked to another account';
          return;
        }
        
        // Check if ID is already used (for lawyers and judges)
        if ((role === 'lawyer' || role === 'judge') && id) {
          if (users.some(u => u.id === id && u.role === role)) {
            errorElement.textContent = `This ${role === 'lawyer' ? 'Bar' : 'Judicial'} ID is already registered`;
            return;
          }
        }
        
        // Clear all existing data for new registration
        localStorage.clear();
        
        // Create new user object
        const newUser = {
          name: name,
          email: email,
          role: role,
          id: id || null,
          walletAddress: walletAddress,
          registrationDate: new Date().toISOString().split('T')[0]
        };
        
        // Store wallet address again after clearing localStorage
        localStorage.setItem('walletAddress', walletAddress);
        localStorage.setItem('walletConnectionMethod', 'metamask');
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('activeRole', role);
        
        // Record the registration as a transaction
        const txInfo = {
          hash: '0x' + Math.random().toString(16).substr(2, 64), // Simulated transaction hash
          blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
          timestamp: Date.now(),
          type: 'User Registration',
          details: `${name} registered as ${role}`
        };
        
        // Initialize new transactions array
        const transactions = [txInfo];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Show success message
        errorElement.textContent = '';
        alert(`Registration successful! Welcome, ${name}!`);
        
        // Show appropriate dashboard
        showDashboard(role, newUser);
        
        // Clear form
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-role').value = '';
        document.getElementById('register-id').value = '';
        
      } catch (error) {
        console.error('Error during registration:', error);
        errorElement.textContent = 'Error registering. Please try again.';
      }
    });
  }
  
  // Show/hide ID field based on role selection
  const registerRole = document.getElementById('register-role');
  const idField = document.getElementById('id-field');
  if (registerRole && idField) {
    registerRole.addEventListener('change', () => {
      const role = registerRole.value;
      if (role === 'judge' || role === 'lawyer') {
        idField.style.display = 'block';
      } else {
        idField.style.display = 'none';
      }
    });
  }
  
  // Logout functionality
  if (lawyerLogout) {
    lawyerLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  if (judgeLogout) {
    judgeLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  if (clientLogout) {
    clientLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
    showSection(homeSection);
  }
  
  // Function to show appropriate dashboard
  function showDashboard(role, user) {
    if (role === 'lawyer') {
      // Update lawyer info
      document.getElementById('lawyer-name').textContent = user.name;
      document.getElementById('lawyer-avatar').textContent = getInitials(user.name);
      document.getElementById('lawyer-id').textContent = user.id || '';
      
      // Show lawyer dashboard
      showSection(lawyerDashboard);
    } else if (role === 'judge') {
      // Update judge info
      document.getElementById('judge-name').textContent = user.name;
      document.getElementById('judge-avatar').textContent = getInitials(user.name);
      document.getElementById('judge-id').textContent = user.id || '';
      
      // Show judge dashboard
      showSection(judgeDashboard);
    } else if (role === 'client') {
      // Update client info
      document.getElementById('client-name').textContent = user.name;
      document.getElementById('client-avatar').textContent = getInitials(user.name);
      document.getElementById('client-company').textContent = user.company || '';
      
      // Show client dashboard
      showSection(clientDashboard);
    }
  }
  
  // Helper function to get initials from name
  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  const activeRole = localStorage.getItem('activeRole');
  
  if (user && activeRole) {
    showDashboard(activeRole, user);
  } else {
    showSection(homeSection);
  }
});
