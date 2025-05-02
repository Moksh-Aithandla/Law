// Registration script for E-Vault Law Management System
import { initMetaMask, connectMetaMask, getCurrentAccount, getUserRegistryContract, getExplorerUrl } from './improved-metamask.js';

// DOM elements
let walletAddressElement;
let registerForm;
let roleSelect;
let barIdField;
let barIdLabel;
let fullNameField;
let submitButton;
let statusMessage;
let transactionLink;

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    walletAddressElement = document.getElementById('wallet-address');
    registerForm = document.getElementById('registerForm');
    roleSelect = document.getElementById('role');
    barIdField = document.getElementById('barId');
    barIdLabel = document.getElementById('barIdLabel');
    fullNameField = document.getElementById('fullName');
    submitButton = document.getElementById('submitButton');
    statusMessage = document.getElementById('statusMessage');
    transactionLink = document.getElementById('transactionLink');
    
    // Initialize MetaMask
    await initMetaMask();
    
    // Add event listeners
    document.getElementById('connectWalletBtn').addEventListener('click', handleConnectWallet);
    roleSelect.addEventListener('change', handleRoleChange);
    registerForm.addEventListener('submit', handleRegistration);
    
    // Check if MetaMask is already connected
    if (window.ethereum && ethereum.selectedAddress) {
        updateWalletAddress(ethereum.selectedAddress);
        enableForm();
    } else {
        disableForm();
    }
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                updateWalletAddress(accounts[0]);
                enableForm();
            } else {
                updateWalletAddress(null);
                disableForm();
            }
        });
    }
    
    // Initial role change to set up form fields
    handleRoleChange();
});

// Handle wallet connection
async function handleConnectWallet() {
    const connected = await connectMetaMask();
    if (connected) {
        const account = getCurrentAccount();
        updateWalletAddress(account);
        enableForm();
    }
}

// Update wallet address display
function updateWalletAddress(address) {
    if (address) {
        walletAddressElement.textContent = `${address.substring(0, 6)}...${address.substring(38)}`;
        walletAddressElement.classList.add('connected');
    } else {
        walletAddressElement.textContent = 'Not Connected';
        walletAddressElement.classList.remove('connected');
    }
}

// Enable form after wallet connection
function enableForm() {
    registerForm.classList.add('enabled');
    submitButton.disabled = false;
    fullNameField.disabled = false;
    roleSelect.disabled = false;
    
    // Enable or disable barId field based on selected role
    handleRoleChange();
}

// Disable form when wallet is not connected
function disableForm() {
    registerForm.classList.remove('enabled');
    submitButton.disabled = true;
    fullNameField.disabled = true;
    roleSelect.disabled = true;
    barIdField.disabled = true;
}

// Handle role change to show/hide Bar ID field
function handleRoleChange() {
    const selectedRole = roleSelect.value;
    
    if (selectedRole === 'lawyer' || selectedRole === 'judge') {
        barIdField.style.display = 'block';
        barIdLabel.style.display = 'block';
        barIdField.required = true;
        
        // Update label text based on role
        if (selectedRole === 'lawyer') {
            barIdLabel.textContent = 'Bar ID:';
            barIdField.placeholder = 'Enter your Bar ID';
        } else {
            barIdLabel.textContent = 'Judicial ID:';
            barIdField.placeholder = 'Enter your Judicial ID';
        }
    } else {
        barIdField.style.display = 'none';
        barIdLabel.style.display = 'none';
        barIdField.required = false;
    }
}

// Handle form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    // Get form values
    const fullName = fullNameField.value.trim();
    const role = roleSelect.value;
    const barId = barIdField.value.trim();
    
    // Validate form
    if (!fullName) {
        showError('Please enter your full name');
        return;
    }
    
    if (!role) {
        showError('Please select a role');
        return;
    }
    
    if ((role === 'lawyer' || role === 'judge') && !barId) {
        showError(`Please enter your ${role === 'lawyer' ? 'Bar ID' : 'Judicial ID'}`);
        return;
    }
    
    // Get current account
    const account = getCurrentAccount();
    if (!account) {
        showError('No wallet connected. Please connect your MetaMask wallet.');
        return;
    }
    
    // Show loading state
    showLoading('Registering your account...');
    
    try {
        // Get contract
        const userRegistry = getUserRegistryContract();
        
        // Call appropriate registration function based on role
        let tx;
        
        switch (role) {
            case 'client':
                tx = await userRegistry.registerAsClient(fullName, '');
                break;
            case 'lawyer':
                tx = await userRegistry.registerAsLawyer(fullName, '', barId);
                break;
            case 'judge':
                tx = await userRegistry.registerAsJudge(fullName, '', barId);
                break;
            default:
                showError('Invalid role selected');
                return;
        }
        
        // Wait for transaction to be mined
        showLoading('Transaction submitted. Waiting for confirmation...');
        const receipt = await tx.wait();
        
        // Show success message with transaction link
        const txHash = receipt.transactionHash;
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        const explorerUrl = getExplorerUrl(parseInt(chainId, 16), txHash);
        
        showSuccess('Registration successful! Your account is pending approval by an administrator.');
        showTransactionLink(explorerUrl);
        
        // Reset form
        registerForm.reset();
        handleRoleChange();
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error messages
        if (error.message.includes('User already registered')) {
            showError('This wallet address is already registered');
        } else if (error.message.includes('Bar ID already registered')) {
            showError('This Bar ID is already registered');
        } else if (error.message.includes('Judicial ID already registered')) {
            showError('This Judicial ID is already registered');
        } else {
            showError(`Registration failed: ${error.message}`);
        }
    }
}

// Show error message
function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'error-message';
    transactionLink.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'success-message';
}

// Show loading message
function showLoading(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'loading-message';
    transactionLink.style.display = 'none';
}

// Show transaction link
function showTransactionLink(url) {
    transactionLink.href = url;
    transactionLink.textContent = 'View transaction on Etherscan';
    transactionLink.style.display = 'block';
}