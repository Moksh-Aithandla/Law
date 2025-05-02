// MetaMask Integration Script

// Variables
let currentAccount = null;
let isMetaMaskConnected = false;
let web3 = null;
let userRegistryContract = null;
let caseManagerContract = null;

// Contract ABIs and addresses
const userRegistryABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "enum UserRegistry.Role",
        "name": "role",
        "type": "uint8"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "enum UserRegistry.Role",
        "name": "role",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      }
    ],
    "name": "registerAsClient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      }
    ],
    "name": "registerAsLawyer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      }
    ],
    "name": "registerAsJudge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userAddress",
        "type": "address"
      }
    ],
    "name": "getUserRole",
    "outputs": [
      {
        "internalType": "enum UserRegistry.Role",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userAddress",
        "type": "address"
      }
    ],
    "name": "isUserRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_experience",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_specialization",
        "type": "string"
      }
    ],
    "name": "registerJudge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_experience",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_specialization",
        "type": "string"
      }
    ],
    "name": "registerLawyer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_company",
        "type": "string"
      }
    ],
    "name": "registerClient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const caseManagerABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "lawyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "CaseRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum CaseManager.CaseStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "CaseStatusUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "judge",
        "type": "address"
      }
    ],
    "name": "JudgeAssigned",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_judge",
        "type": "address"
      }
    ],
    "name": "registerJudge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_client",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_lawyer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "registerCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_judge",
        "type": "address"
      }
    ],
    "name": "assignJudge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      },
      {
        "internalType": "enum CaseManager.CaseStatus",
        "name": "_status",
        "type": "uint8"
      }
    ],
    "name": "updateCaseStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      }
    ],
    "name": "getCaseDetails",
    "outputs": [
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "lawyer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "judge",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "enum CaseManager.CaseStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCaseCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_client",
        "type": "address"
      }
    ],
    "name": "getClientCases",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_lawyer",
        "type": "address"
      }
    ],
    "name": "getLawyerCases",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_judge",
        "type": "address"
      }
    ],
    "name": "getJudgeCases",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_caseType",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_client",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_lawyer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_judge",
        "type": "address"
      }
    ],
    "name": "createCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract addresses (will be loaded from config.js)
let userRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let caseManagerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Initialize Web3 and contracts
async function initWeb3() {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      
      // Initialize contracts
      userRegistryContract = new web3.eth.Contract(userRegistryABI, userRegistryAddress);
      caseManagerContract = new web3.eth.Contract(caseManagerABI, caseManagerAddress);
      
      return true;
    } catch (error) {
      console.error("User denied account access");
      return false;
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    
    // Initialize contracts
    userRegistryContract = new web3.eth.Contract(userRegistryABI, userRegistryAddress);
    caseManagerContract = new web3.eth.Contract(caseManagerABI, caseManagerAddress);
    
    return true;
  } else {
    console.log("No Ethereum browser extension detected, install MetaMask");
    return false;
  }
}

// Check if MetaMask is installed
async function checkMetaMaskInstalled() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
    return true;
  } else {
    console.log('MetaMask is not installed!');
    alert('MetaMask is not installed. Please install MetaMask to use this application.');
    return false;
  }
}

// Connect to MetaMask
async function connectMetaMask() {
  if (await checkMetaMaskInstalled()) {
    try {
      // Initialize Web3
      const initialized = await initWeb3();
      if (!initialized) {
        throw new Error("Failed to initialize Web3");
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      currentAccount = accounts[0];
      isMetaMaskConnected = true;
      
      // Update wallet status
      updateWalletStatus();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return currentAccount;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
      return null;
    }
  }
  return null;
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    currentAccount = null;
    isMetaMaskConnected = false;
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    isMetaMaskConnected = true;
  }
  
  // Update wallet status
  updateWalletStatus();
}

// Update wallet status display
function updateWalletStatus() {
  const walletStatusLogin = document.getElementById('wallet-status-login');
  const walletStatusRegister = document.getElementById('wallet-status-register');
  const walletStatus = document.getElementById('wallet-status');
  
  if (isMetaMaskConnected && currentAccount) {
    const shortAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
    
    if (walletStatusLogin) {
      walletStatusLogin.textContent = `Connected: ${shortAddress}`;
      walletStatusLogin.style.color = '#4ade80';
    }
    
    if (walletStatusRegister) {
      walletStatusRegister.textContent = `Connected: ${shortAddress}`;
      walletStatusRegister.style.color = '#4ade80';
    }
    
    if (walletStatus) {
      walletStatus.textContent = `Wallet: ${shortAddress}`;
      walletStatus.style.display = 'inline-block';
    }
  } else {
    if (walletStatusLogin) {
      walletStatusLogin.textContent = 'Not connected';
      walletStatusLogin.style.color = '#ef4444';
    }
    
    if (walletStatusRegister) {
      walletStatusRegister.textContent = 'Not connected';
      walletStatusRegister.style.color = '#ef4444';
    }
    
    if (walletStatus) {
      walletStatus.style.display = 'none';
    }
  }
}

// Register a new user
async function registerUser(name, email, role, id = "") {
  if (!isMetaMaskConnected) {
    throw new Error("MetaMask not connected");
  }
  
  try {
    let tx;
    
    if (role === 'judge') {
      tx = await userRegistryContract.methods.registerJudge(name, email, id, 5, "General").send({ from: currentAccount });
    } else if (role === 'lawyer') {
      tx = await userRegistryContract.methods.registerLawyer(name, email, id, 3, "General").send({ from: currentAccount });
    } else if (role === 'client') {
      tx = await userRegistryContract.methods.registerClient(name, email, "Company").send({ from: currentAccount });
    } else {
      throw new Error("Invalid role");
    }
    
    return tx;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Login a user
async function loginUser(email, id = "") {
  if (!isMetaMaskConnected) {
    throw new Error("MetaMask not connected");
  }
  
  try {
    // Check if the user is registered
    const isRegistered = await userRegistryContract.methods.isUserRegistered(currentAccount).call();
    
    if (!isRegistered) {
      throw new Error("User not registered");
    }
    
    // Get the user's role
    const roleNum = await userRegistryContract.methods.getUserRole(currentAccount).call();
    let role;
    
    switch (parseInt(roleNum)) {
      case 0:
        role = "none";
        break;
      case 1:
        role = "client";
        break;
      case 2:
        role = "lawyer";
        break;
      case 3:
        role = "judge";
        break;
      default:
        role = "unknown";
    }
    
    // Get the user's details from the users.json file
    const response = await fetch('/api/users');
    const users = await response.json();
    
    // Find the user with the matching address
    const user = users.find(u => u.address.toLowerCase() === currentAccount.toLowerCase());
    
    if (!user) {
      throw new Error("User not found in the database");
    }
    
    // Check if the email matches
    if (user.email !== email) {
      throw new Error("Email does not match");
    }
    
    // Check if the ID matches (for lawyers and judges)
    if ((role === 'lawyer' || role === 'judge') && user.id !== id) {
      throw new Error("ID does not match");
    }
    
    return {
      name: user.name,
      email: user.email,
      role: role,
      id: user.id || "",
      address: currentAccount
    };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// Create a new case
async function createCase(title, description, caseType, clientAddress, judgeAddress) {
  if (!isMetaMaskConnected) {
    throw new Error("MetaMask not connected");
  }
  
  try {
    const tx = await caseManagerContract.methods.createCase(
      title,
      description,
      caseType,
      clientAddress,
      currentAccount,
      judgeAddress
    ).send({ from: currentAccount });
    
    return tx;
  } catch (error) {
    console.error("Error creating case:", error);
    throw error;
  }
}

// Get all cases for a user
async function getUserCases(role) {
  if (!isMetaMaskConnected) {
    throw new Error("MetaMask not connected");
  }
  
  try {
    let caseIds;
    
    if (role === 'client') {
      caseIds = await caseManagerContract.methods.getClientCases(currentAccount).call();
    } else if (role === 'lawyer') {
      caseIds = await caseManagerContract.methods.getLawyerCases(currentAccount).call();
    } else if (role === 'judge') {
      caseIds = await caseManagerContract.methods.getJudgeCases(currentAccount).call();
    } else {
      throw new Error("Invalid role");
    }
    
    const cases = [];
    
    for (const caseId of caseIds) {
      const caseDetails = await caseManagerContract.methods.getCaseDetails(caseId).call();
      cases.push({
        id: caseId,
        client: caseDetails.client,
        lawyer: caseDetails.lawyer,
        judge: caseDetails.judge,
        description: caseDetails.description,
        status: caseDetails.status
      });
    }
    
    return cases;
  } catch (error) {
    console.error("Error getting user cases:", error);
    throw error;
  }
}

// Export functions
window.metamask = {
  connectMetaMask,
  registerUser,
  loginUser,
  createCase,
  getUserCases,
  updateWalletStatus
};