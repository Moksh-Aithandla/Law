// Blockchain Utilities for E-Vault Law Management System
// This file provides utilities for interacting with Ethereum blockchain and IPFS/Firebase

import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './contract-config.js';

// Global variables
let provider;
let signer;
let currentAccount;
let networkInfo = NETWORK_CONFIG;
let contracts = {
  userRegistry: null,
  caseManager: null,
  documentStorage: null
};
let isInitialized = false;

// Initialize blockchain connection
async function initBlockchain() {
  try {
    // Check if already initialized
    if (isInitialized) return true;
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      console.error("MetaMask not detected. Please install MetaMask to use this application.");
      return false;
    }
    
    // Create ethers provider
    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get the signer
    signer = provider.getSigner();
    currentAccount = await signer.getAddress();
    
    // Check if we're on the correct network (Sepolia testnet)
    const network = await provider.getNetwork();
    if (network.chainId !== networkInfo.chainId) {
      try {
        // Try to switch to the correct network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + networkInfo.chainId.toString(16) }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x' + networkInfo.chainId.toString(16),
                chainName: networkInfo.name,
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: [networkInfo.explorer],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }
    
    // Load contract ABIs
    const userRegistryABI = await fetch('/abi/UserRegistry.json').then(res => res.json());
    const caseManagerABI = await fetch('/abi/CaseManager.json').then(res => res.json());
    const ipfsManagerABI = await fetch('/abi/IPFSManager.json').then(res => res.json());
    
    // Create contract instances
    contracts.userRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.UserRegistry,
      userRegistryABI,
      signer
    );
    
    contracts.caseManager = new ethers.Contract(
      CONTRACT_ADDRESSES.CaseManager,
      caseManagerABI,
      signer
    );
    
    contracts.documentStorage = new ethers.Contract(
      CONTRACT_ADDRESSES.IPFSManager,
      ipfsManagerABI,
      signer
    );
    
    // Set up event listeners for account and network changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Error initializing blockchain:", error);
    return false;
  }
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
    isInitialized = false;
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    // Reinitialize with new account
    isInitialized = false;
    initBlockchain();
    
    // Reload the page to refresh the UI
    window.location.reload();
  }
}

// Handle chain changes
function handleChainChanged() {
  // Reload the page when the chain changes
  window.location.reload();
}

// Get current account
function getCurrentAccount() {
  return currentAccount;
}

// Get network info
function getNetworkInfo() {
  return networkInfo;
}

// Check if user is registered
async function isUserRegistered() {
  try {
    if (!isInitialized) await initBlockchain();
    return await contracts.userRegistry.isUserRegistered(currentAccount);
  } catch (error) {
    console.error("Error checking user registration:", error);
    return false;
  }
}

// Get user role
async function getUserRole() {
  try {
    if (!isInitialized) await initBlockchain();
    return await contracts.userRegistry.getUserRole(currentAccount);
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Get user details
async function getUserDetails() {
  try {
    if (!isInitialized) await initBlockchain();
    return await contracts.userRegistry.getUserDetails(currentAccount);
  } catch (error) {
    console.error("Error getting user details:", error);
    return null;
  }
}

// Register as client
async function registerAsClient(name, email) {
  try {
    if (!isInitialized) await initBlockchain();
    const tx = await contracts.userRegistry.registerAsClient(name, email);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error registering as client:", error);
    return false;
  }
}

// Register as lawyer
async function registerAsLawyer(name, email, barId) {
  try {
    if (!isInitialized) await initBlockchain();
    const tx = await contracts.userRegistry.registerAsLawyer(name, email, barId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error registering as lawyer:", error);
    return false;
  }
}

// Register as judge
async function registerAsJudge(name, email, judicialId) {
  try {
    if (!isInitialized) await initBlockchain();
    const tx = await contracts.userRegistry.registerAsJudge(name, email, judicialId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error registering as judge:", error);
    return false;
  }
}

// Register a new case
async function registerCase(title, description, caseType, lawyerAddress) {
  try {
    if (!isInitialized) await initBlockchain();
    const tx = await contracts.caseManager.registerCase(title, description, caseType, lawyerAddress);
    const receipt = await tx.wait();
    
    // Get the case ID from the event
    const event = receipt.events.find(event => event.event === 'CaseRegistered');
    const caseId = event.args.caseId.toNumber();
    
    return caseId;
  } catch (error) {
    console.error("Error registering case:", error);
    throw error;
  }
}

// Get case details
async function getCaseDetails(caseId) {
  try {
    if (!isInitialized) await initBlockchain();
    return await contracts.caseManager.getCaseDetails(caseId);
  } catch (error) {
    console.error("Error getting case details:", error);
    return null;
  }
}

// Get case documents
async function getCaseDocuments(caseId) {
  try {
    if (!isInitialized) await initBlockchain();
    return await contracts.caseManager.getCaseDocuments(caseId);
  } catch (error) {
    console.error("Error getting case documents:", error);
    return [];
  }
}

// Get user cases based on role
async function getUserCases() {
  try {
    if (!isInitialized) await initBlockchain();
    
    const role = await getUserRole();
    let caseIds = [];
    
    if (role === "client") {
      caseIds = await contracts.caseManager.getClientCases(currentAccount);
    } else if (role === "lawyer") {
      caseIds = await contracts.caseManager.getLawyerCases(currentAccount);
    } else if (role === "judge") {
      caseIds = await contracts.caseManager.getJudgeCases(currentAccount);
    }
    
    // Convert BigNumber to regular numbers
    return caseIds.map(id => id.toNumber());
  } catch (error) {
    console.error("Error getting user cases:", error);
    return [];
  }
}

// Update case status
async function updateCaseStatus(caseId, status) {
  try {
    if (!isInitialized) await initBlockchain();
    const tx = await contracts.caseManager.updateCaseStatus(caseId, status);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error updating case status:", error);
    return false;
  }
}

// Upload document to IPFS/Firebase and store reference on blockchain
async function uploadDocument(file, caseId, name, description, isPublic = false) {
  try {
    if (!isInitialized) await initBlockchain();
    
    // First, upload the file to IPFS or Firebase
    const contentCID = await uploadFileToStorage(file);
    
    // Then store the reference on the blockchain
    const documentType = file.name.split('.').pop();
    const tx = await contracts.documentStorage.storeDocument(
      name || file.name,
      description || '',
      contentCID,
      documentType,
      caseId,
      isPublic
    );
    
    const receipt = await tx.wait();
    
    // Get the document ID from the event
    const event = receipt.events.find(event => event.event === 'DocumentStored');
    const documentId = event.args.documentId.toNumber();
    
    // If case ID is provided, add document to case
    if (caseId > 0) {
      const addTx = await contracts.caseManager.addDocument(
        caseId,
        name || file.name,
        contentCID,
        documentType,
        isPublic
      );
      await addTx.wait();
    }
    
    return {
      documentId,
      contentCID
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

// Upload file to IPFS or Firebase
async function uploadFileToStorage(file) {
  // This is a placeholder function that should be implemented based on your storage choice
  // For IPFS, you would use a library like ipfs-http-client
  // For Firebase, you would use the Firebase Storage SDK
  
  // For now, we'll simulate the upload and return a fake CID
  return new Promise((resolve, reject) => {
    // Simulate upload delay
    setTimeout(() => {
      // Generate a fake CID based on file name and current time
      const fakeCID = `ipfs-${btoa(file.name + Date.now()).replace(/=/g, '')}`;
      resolve(fakeCID);
    }, 1000);
  });
}

// Get document details
async function getDocument(documentId) {
  try {
    if (!isInitialized) await initBlockchain();
    return await contracts.documentStorage.getDocument(documentId);
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
}

// Get user documents
async function getUserDocuments() {
  try {
    if (!isInitialized) await initBlockchain();
    const documentIds = await contracts.documentStorage.getUserDocuments(currentAccount);
    
    // Convert BigNumber to regular numbers
    return documentIds.map(id => id.toNumber());
  } catch (error) {
    console.error("Error getting user documents:", error);
    return [];
  }
}

// Get transaction URL for Etherscan
function getTransactionUrl(txHash) {
  return `${networkInfo.explorer}/tx/${txHash}`;
}

// Get address URL for Etherscan
function getAddressUrl(address) {
  return `${networkInfo.explorer}/address/${address}`;
}

// Export all functions
export {
  initBlockchain,
  getCurrentAccount,
  getNetworkInfo,
  isUserRegistered,
  getUserRole,
  getUserDetails,
  registerAsClient,
  registerAsLawyer,
  registerAsJudge,
  registerCase,
  getCaseDetails,
  getCaseDocuments,
  getUserCases,
  updateCaseStatus,
  uploadDocument,
  getDocument,
  getUserDocuments,
  getTransactionUrl,
  getAddressUrl
};