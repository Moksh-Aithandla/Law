// app.js - Main application logic for E-Vault Law Management System

import { CONTRACT_ADDRESSES, NETWORK_CONFIG, ADMIN_ADDRESS } from './contract-config.js';

// Web3 instance
let web3;

// Contract instances
let userRegistryContract;
let documentStorageContract;
let caseManagerContract;

// Current account
let currentAccount = null;

// Check if MetaMask is installed
export function isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
}

// Handle login
export async function handleLogin() {
    try {
        // Check if MetaMask is installed
        if (!isMetaMaskInstalled()) {
            showError("MetaMask is not installed. Please install MetaMask to use this application.");
            return;
        }
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        // Check if we're on the right network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x' + parseInt(NETWORK_CONFIG.chainId).toString(16)) {
            try {
                // Try to switch to the correct network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + parseInt(NETWORK_CONFIG.chainId).toString(16) }],
                });
            } catch (switchError) {
                showError(`Please switch to the ${NETWORK_CONFIG.name} network in MetaMask`);
                return;
            }
        }
        
        // Initialize Web3
        web3 = new Web3(window.ethereum);
        
        // Load contract ABIs
        await loadContractABIs();
        
        // Check user role and redirect to appropriate dashboard
        await checkUserRoleAndRedirect();
    } catch (error) {
        console.error("Login error:", error);
        showError("Error connecting to MetaMask: " + error.message);
    }
}

// Load contract ABIs
async function loadContractABIs() {
    try {
        // Fetch UserRegistry ABI
        const userRegistryResponse = await fetch('abi/UserRegistry.json');
        const userRegistryABI = await userRegistryResponse.json();
        
        // Fetch DocumentStorage ABI
        const documentStorageResponse = await fetch('abi/DocumentStorage.json');
        const documentStorageABI = await documentStorageResponse.json();
        
        // Fetch CaseManager ABI
        const caseManagerResponse = await fetch('abi/CaseManager.json');
        const caseManagerABI = await caseManagerResponse.json();
        
        // Initialize contract instances
        userRegistryContract = new web3.eth.Contract(
            JSON.parse(userRegistryABI),
            CONTRACT_ADDRESSES.UserRegistry
        );
        
        documentStorageContract = new web3.eth.Contract(
            JSON.parse(documentStorageABI),
            CONTRACT_ADDRESSES.DocumentStorage
        );
        
        caseManagerContract = new web3.eth.Contract(
            JSON.parse(caseManagerABI),
            CONTRACT_ADDRESSES.CaseManager
        );
    } catch (error) {
        console.error("Error loading contract ABIs:", error);
        throw error;
    }
}

// Check user role and redirect to appropriate dashboard
async function checkUserRoleAndRedirect() {
    try {
        // Check if the current account is the admin
        if (currentAccount.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
            window.location.href = 'admin.html';
            return;
        }
        
        // Check if the user is registered
        const userDetails = await userRegistryContract.methods.getUserDetails(currentAccount).call();
        
        // If user is not registered or not approved
        if (!userDetails.isRegistered || !userDetails.isApproved) {
            showError("You are not registered or your registration is pending approval. Please contact the administrator.");
            return;
        }
        
        // Redirect based on user role
        if (userDetails.role === 'lawyer') {
            window.location.href = 'lawyer-dashboard.html';
        } else if (userDetails.role === 'judge') {
            window.location.href = 'judge-dashboard.html';
        } else if (userDetails.role === 'client') {
            window.location.href = 'client-dashboard.html';
        } else {
            showError("Unknown user role. Please contact the administrator.");
        }
    } catch (error) {
        console.error("Error checking user role:", error);
        showError("Error checking user role: " + error.message);
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

// Handle account changes in MetaMask
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has no accounts
        showError("Please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        // Reload the page to re-check user role
        window.location.reload();
    }
}

// Set up event listeners for MetaMask
if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => {
        // Reload the page when the chain changes
        window.location.reload();
    });
}