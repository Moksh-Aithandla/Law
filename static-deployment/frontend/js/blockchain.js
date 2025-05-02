// Blockchain integration for E-Vault Law Management System
// This file handles interactions with Ethereum blockchain and IPFS

// Import contract addresses from config.js
import { userRegistryAddress, caseManagerAddress, ipfsManagerAddress } from '../config.js';

// Global variables
let provider;
let signer;
let userRegistryContract;
let caseManagerContract;
let ipfsManagerContract;
let ipfsClient;
let currentAccount;
let networkInfo = {
  // Default to localhost for development
  chainId: 31337,
  name: 'Localhost',
  explorer: 'https://etherscan.io'
};

// Set contract addresses from config
const USER_REGISTRY_ADDRESS = userRegistryAddress;
const CASE_MANAGER_ADDRESS = caseManagerAddress;
const IPFS_MANAGER_ADDRESS = ipfsManagerAddress;

// Function to load contract ABI from file
async function loadContractABI(contractName) {
  try {
    const response = await fetch(`/abi/${contractName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${contractName} ABI: ${response.statusText}`);
    }
    const data = await response.json();
    return data.abi;
  } catch (error) {
    console.error(`Error loading ${contractName} ABI:`, error);
    throw error;
  }
}

// Placeholder ABI for fallback
const PLACEHOLDER_ABI = [
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
        "indexed": false,
        "internalType": "string",
        "name": "documentName",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "uploaderWallet",
        "type": "address"
      }
    ],
    "name": "DocumentAdded",
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
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "submittedBy",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "submitterWallet",
        "type": "address"
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
        "internalType": "string",
        "name": "oldStatus",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newStatus",
        "type": "string"
      }
    ],
    "name": "CaseStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "userWallet",
        "type": "address"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_documentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_documentContent",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_documentType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_uploadedBy",
        "type": "string"
      }
    ],
    "name": "addDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "cases",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "caseType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "submittedBy",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "assignedTo",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "judge",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "filingDate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "caseCount",
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
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      }
    ],
    "name": "getCaseDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "caseType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "submittedBy",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "assignedTo",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "judge",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "status",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "filingDate",
            "type": "uint256"
          }
        ],
        "internalType": "struct EVaultLaw.Case",
        "name": "",
        "type": "tuple"
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
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_documentIndex",
        "type": "uint256"
      }
    ],
    "name": "getDocumentContent",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
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
    "name": "getDocuments",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "documentContent",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "documentType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "uploadedBy",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "uploadDate",
            "type": "uint256"
          }
        ],
        "internalType": "struct EVaultLaw.Document[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_wallet",
        "type": "address"
      }
    ],
    "name": "getUserEmail",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
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
        "internalType": "string",
        "name": "_submittedBy",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_assignedTo",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_judge",
        "type": "string"
      }
    ],
    "name": "registerCase",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
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
    "name": "registerUser",
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
        "internalType": "string",
        "name": "_newStatus",
        "type": "string"
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userWallets",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize blockchain connection
async function initBlockchain() {
  try {
    // Check if MetaMask is installed
    if (window.ethereum) {
      // Create ethers provider
      provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the signer
      signer = provider.getSigner();
      currentAccount = await signer.getAddress();
      
      // Get the current network
      const network = await provider.getNetwork();
      console.log("Connected to network:", network);
      
      // Set network info based on chainId
      if (network.chainId === 31337) {
        // Local Hardhat network
        networkInfo = {
          chainId: 31337,
          name: 'Localhost',
          explorer: 'https://etherscan.io' // Placeholder, no explorer for localhost
        };
        console.log("Connected to local Hardhat network");
      } else if (network.chainId === 11155111) {
        // Sepolia testnet
        networkInfo = {
          chainId: 11155111,
          name: 'Sepolia',
          explorer: 'https://sepolia.etherscan.io'
        };
        console.log("Connected to Sepolia testnet");
      } else {
        // If not on localhost or Sepolia, try to switch to localhost first
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }], // 0x7A69 is hex for 31337 (Hardhat)
          });
          networkInfo = {
            chainId: 31337,
            name: 'Localhost',
            explorer: 'https://etherscan.io'
          };
          console.log("Switched to local Hardhat network");
        } catch (switchError) {
          console.log("Failed to switch to localhost, trying Sepolia");
          // If can't switch to localhost, try Sepolia
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // 0xaa36a7 is hex for 11155111
            });
            networkInfo = {
              chainId: 11155111,
              name: 'Sepolia',
              explorer: 'https://sepolia.etherscan.io'
            };
            console.log("Switched to Sepolia testnet");
          } catch (sepoliaError) {
            // If Sepolia is not added, add it
            if (sepoliaError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                  },
                ],
              });
              networkInfo = {
                chainId: 11155111,
                name: 'Sepolia',
                explorer: 'https://sepolia.etherscan.io'
              };
              console.log("Added and switched to Sepolia testnet");
            } else {
              console.error("Failed to switch networks:", sepoliaError);
              throw sepoliaError;
            }
          }
        }
      }
      
      // Load contract ABIs
      const userRegistryABI = await loadContractABI('UserRegistry');
      const caseManagerABI = await loadContractABI('CaseManager');
      const ipfsManagerABI = await loadContractABI('IPFSManager');
      
      // Create contract instances
      userRegistryContract = new ethers.Contract(USER_REGISTRY_ADDRESS, userRegistryABI, signer);
      caseManagerContract = new ethers.Contract(CASE_MANAGER_ADDRESS, caseManagerABI, signer);
      ipfsManagerContract = new ethers.Contract(IPFS_MANAGER_ADDRESS, ipfsManagerABI, signer);
      
      console.log("Contracts initialized with addresses:", {
        UserRegistry: USER_REGISTRY_ADDRESS,
        CaseManager: CASE_MANAGER_ADDRESS,
        IPFSManager: IPFS_MANAGER_ADDRESS
      });
      
      // Initialize IPFS client
      ipfsClient = await initIPFS();
      
      // Update UI to show connected wallet
      updateWalletStatus(currentAccount);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return true;
    } else {
      console.error('MetaMask is not installed');
      alert('Please install MetaMask to use blockchain features');
      return false;
    }
  } catch (error) {
    console.error('Error initializing blockchain:', error);
    alert('Error connecting to blockchain. Please make sure MetaMask is installed and unlocked.');
    return false;
  }
}

// Initialize IPFS
async function initIPFS() {
  // Using Infura IPFS gateway
  return {
    add: async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        return data.Hash;
      } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
      }
    },
    get: (hash) => {
      return `https://ipfs.infura.io/ipfs/${hash}`;
    }
  };
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    updateWalletStatus(currentAccount);
  }
}

// Update wallet status in UI
function updateWalletStatus(account) {
  const walletStatus = document.getElementById('wallet-status');
  const walletStatusLogin = document.getElementById('wallet-status-login');
  const walletStatusRegister = document.getElementById('wallet-status-register');
  
  if (account) {
    const shortAccount = account.substring(0, 6) + '...' + account.substring(account.length - 4);
    
    if (walletStatus) {
      walletStatus.textContent = `Connected: ${shortAccount}`;
      walletStatus.style.display = 'inline-block';
      walletStatus.className = 'wallet-status wallet-connected';
    }
    
    if (walletStatusLogin) {
      walletStatusLogin.textContent = `Connected: ${shortAccount}`;
      walletStatusLogin.className = 'wallet-status-text wallet-connected';
    }
    
    if (walletStatusRegister) {
      walletStatusRegister.textContent = `Connected: ${shortAccount}`;
      walletStatusRegister.className = 'wallet-status-text wallet-connected';
    }
  } else {
    if (walletStatus) {
      walletStatus.textContent = 'Not connected';
      walletStatus.style.display = 'none';
      walletStatus.className = 'wallet-status wallet-disconnected';
    }
    
    if (walletStatusLogin) {
      walletStatusLogin.textContent = 'Not connected';
      walletStatusLogin.className = 'wallet-status-text wallet-disconnected';
    }
    
    if (walletStatusRegister) {
      walletStatusRegister.textContent = 'Not connected';
      walletStatusRegister.className = 'wallet-status-text wallet-disconnected';
    }
  }
}

// Connect to MetaMask
async function connectWallet() {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await provider.listAccounts();
    currentAccount = accounts[0];
    updateWalletStatus(currentAccount);
    return currentAccount;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

// Register a new case on the blockchain
async function registerCaseOnBlockchain(caseData) {
  try {
    if (!evaultContract) {
      throw new Error('Blockchain not initialized');
    }
    
    // Show transaction in progress
    const errorElement = document.getElementById('register-case-error');
    if (errorElement) {
      errorElement.textContent = 'Preparing transaction...';
    }
    
    const tx = await evaultContract.registerCase(
      caseData.title,
      caseData.description,
      caseData.caseType,
      caseData.submittedBy,
      caseData.assignedTo,
      caseData.judge
    );
    
    // Show transaction hash and Etherscan link
    if (errorElement) {
      const etherscanLink = `${networkInfo.explorer}/tx/${tx.hash}`;
      errorElement.innerHTML = `Transaction submitted: <a href="${etherscanLink}" target="_blank">View on Etherscan</a>`;
    }
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Get the case ID from the event logs
    const event = receipt.events.find(e => e.event === 'CaseRegistered');
    const caseId = event.args.caseId.toNumber();
    
    // Store transaction info in localStorage
    const txInfo = {
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      caseId: caseId,
      timestamp: Date.now(),
      type: 'Case Registration',
      details: `${caseData.title} (ID: ${caseId})`
    };
    
    // Get existing transactions or initialize empty array
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(txInfo);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    return caseId;
  } catch (error) {
    console.error('Error registering case on blockchain:', error);
    throw error;
  }
}

// Upload document directly to blockchain
async function uploadDocumentToBlockchain(file, caseId, uploadedBy) {
  try {
    if (!evaultContract) {
      throw new Error('Blockchain not initialized');
    }
    
    // Update status
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
      uploadStatus.textContent = 'Reading file...';
    }
    
    // Read file as text or base64
    const fileContent = await readFileAsBase64(file);
    
    if (uploadStatus) {
      uploadStatus.textContent = 'Preparing to upload document to blockchain...';
    }
    
    // Get file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Register document on blockchain
    const tx = await evaultContract.addDocument(
      caseId,
      file.name,
      fileContent,
      fileExtension,
      uploadedBy
    );
    
    // Show transaction hash and Etherscan link
    if (uploadStatus) {
      const etherscanLink = `${networkInfo.explorer}/tx/${tx.hash}`;
      uploadStatus.innerHTML = `Transaction submitted: <a href="${etherscanLink}" target="_blank">View on Etherscan</a>`;
    }
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Store transaction info in localStorage
    const txInfo = {
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      caseId: caseId,
      timestamp: Date.now(),
      type: 'Document Upload',
      details: `${file.name} for Case ID: ${caseId}`
    };
    
    // Get existing transactions or initialize empty array
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(txInfo);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    if (uploadStatus) {
      uploadStatus.innerHTML = `Document registered successfully! <a href="${networkInfo.explorer}/tx/${tx.hash}" target="_blank">View on Etherscan</a>`;
    }
    
    return {
      name: file.name,
      documentType: fileExtension,
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
      uploadStatus.innerHTML = `Error: ${error.message}`;
    }
    throw error;
  }
}

// Helper function to read file as base64
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Get the base64 string (remove the data:xxx;base64, prefix)
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Get case details from blockchain
async function getCaseFromBlockchain(caseId) {
  try {
    if (!evaultContract) {
      throw new Error('Blockchain not initialized');
    }
    
    const caseDetails = await evaultContract.getCaseDetails(caseId);
    const documents = await evaultContract.getDocuments(caseId);
    
    // Format case details
    const formattedCase = {
      id: caseId,
      title: caseDetails.title,
      description: caseDetails.description,
      caseType: caseDetails.caseType,
      submittedBy: caseDetails.submittedBy,
      assignedTo: caseDetails.assignedTo,
      judge: caseDetails.judge,
      status: caseDetails.status,
      filingDate: new Date(caseDetails.filingDate.toNumber() * 1000).toISOString().split('T')[0],
      documents: await Promise.all(documents.map(async (doc, index) => {
        // Create a data URL for the document content
        let dataUrl;
        if (doc.documentContent && doc.documentType) {
          dataUrl = `data:${getMimeType(doc.documentType)};base64,${doc.documentContent}`;
        } else {
          // For backward compatibility with old documents
          dataUrl = '#';
        }
        
        return {
          name: doc.name,
          url: dataUrl,
          documentType: doc.documentType || 'unknown',
          uploadedBy: doc.uploadedBy,
          uploadDate: new Date(doc.uploadDate.toNumber() * 1000).toISOString().split('T')[0],
          index: index,
          etherscanUrl: `${networkInfo.explorer}/tx/${doc.transactionHash || '0x0'}`
        };
      }))
    };
    
    return formattedCase;
  } catch (error) {
    console.error('Error getting case from blockchain:', error);
    throw error;
  }
}

// Helper function to get MIME type from file extension
function getMimeType(extension) {
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

// Get all cases from blockchain
async function getAllCasesFromBlockchain() {
  try {
    if (!evaultContract) {
      throw new Error('Blockchain not initialized');
    }
    
    const caseCount = await evaultContract.getCaseCount();
    const cases = [];
    
    for (let i = 1; i <= caseCount; i++) {
      try {
        const caseDetails = await getCaseFromBlockchain(i);
        cases.push(caseDetails);
      } catch (error) {
        console.error(`Error fetching case ${i}:`, error);
      }
    }
    
    return cases;
  } catch (error) {
    console.error('Error getting all cases from blockchain:', error);
    throw error;
  }
}

// Initialize blockchain when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Make network info globally available
  window.networkInfo = networkInfo;
  
  // Update contract address in UI
  const contractAddressLink = document.getElementById('contract-address-link');
  if (contractAddressLink) {
    contractAddressLink.href = `${networkInfo.explorer}/address/${CONTRACT_ADDRESS}`;
    contractAddressLink.textContent = CONTRACT_ADDRESS;
  }
  
  // Update network info in UI
  const networkInfoDetail = document.getElementById('network-info-detail');
  if (networkInfoDetail) {
    networkInfoDetail.textContent = `${networkInfo.name} Testnet (Chain ID: ${networkInfo.chainId})`;
  }
  
  // Connect wallet buttons
  const connectMetamaskBtn = document.getElementById('connect-metamask');
  const connectMetamaskRegisterBtn = document.getElementById('connect-metamask-register');
  
  if (connectMetamaskBtn) {
    connectMetamaskBtn.addEventListener('click', async () => {
      try {
        await initBlockchain();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    });
  }
  
  if (connectMetamaskRegisterBtn) {
    connectMetamaskRegisterBtn.addEventListener('click', async () => {
      try {
        await initBlockchain();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    });
  }
  
  // Register case with blockchain integration
  const registerCaseSubmit = document.getElementById('register-case-submit');
  if (registerCaseSubmit) {
    const originalClickHandler = registerCaseSubmit.onclick;
    registerCaseSubmit.onclick = null;
    
    registerCaseSubmit.addEventListener('click', async () => {
      const title = document.getElementById('case-title').value.trim();
      const description = document.getElementById('case-description').value.trim();
      const caseType = document.getElementById('case-type').value;
      const lawyer = document.getElementById('case-lawyer').value;
      const errorElement = document.getElementById('register-case-error');
      
      if (!title || !description || !caseType || !lawyer) {
        errorElement.textContent = 'Please fill in all required fields';
        return;
      }
      
      try {
        // Initialize blockchain if not already initialized
        if (!evaultContract) {
          const initialized = await initBlockchain();
          if (!initialized) {
            errorElement.textContent = 'Please connect your wallet first';
            return;
          }
        }
        
        // Get current user
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
          errorElement.textContent = 'You must be logged in to register a case';
          return;
        }
        
        // Create case data for blockchain
        const caseData = {
          title: title,
          description: description,
          caseType: caseType,
          submittedBy: user.name,
          assignedTo: lawyer,
          judge: 'Judge Smith' // Default judge
        };
        
        // Register case on blockchain
        errorElement.textContent = 'Registering case on blockchain...';
        const caseId = await registerCaseOnBlockchain(caseData);
        
        alert(`Case registered successfully on blockchain with ID: ${caseId}`);
        
        // Clear form
        document.getElementById('case-title').value = '';
        document.getElementById('case-description').value = '';
        document.getElementById('case-type').value = '';
        document.getElementById('case-lawyer').value = '';
        errorElement.textContent = '';
        
        // Show client dashboard
        const clientDashboard = document.getElementById('client-dashboard');
        const registerCaseSection = document.getElementById('register-case-section');
        
        if (clientDashboard) clientDashboard.style.display = 'block';
        if (registerCaseSection) registerCaseSection.style.display = 'none';
      } catch (error) {
        console.error('Error registering case:', error);
        errorElement.textContent = 'Error registering case. Please try again.';
      }
    });
  }
  
  // Try to initialize blockchain on page load
  try {
    if (window.ethereum) {
      await initBlockchain();
    }
  } catch (error) {
    console.error('Error initializing blockchain on page load:', error);
  }
});

// Export functions for use in other files
window.blockchainUtils = {
  initBlockchain,
  connectWallet,
  registerCaseOnBlockchain,
  uploadDocumentToBlockchain,
  getCaseFromBlockchain,
  getAllCasesFromBlockchain
};