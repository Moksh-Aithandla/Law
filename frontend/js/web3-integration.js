// web3-integration.js - Handles MetaMask connection and smart contract interactions

// Import contract configuration
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './contract-config.js';

// Contract ABIs - These will be populated from the compiled contracts
let userRegistryABI;
let documentStorageABI;
let caseManagerABI;

// Web3 instance
let web3;

// Contract instances
let userRegistryContract;
let documentStorageContract;
let caseManagerContract;

// Current user account
let currentAccount = null;

// Initialize the web3 connection
async function initWeb3() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
            // Create Web3 instance
            web3 = new Web3(window.ethereum);
            
            // Check if we're on the right network
            const chainId = await web3.eth.getChainId();
            if (chainId.toString() !== NETWORK_CONFIG.chainId.toString()) {
                try {
                    // Try to switch to the correct network
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: web3.utils.toHex(NETWORK_CONFIG.chainId) }],
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (switchError.code === 4902) {
                        console.error("Network not available in MetaMask");
                        return { success: false, error: `Please add the ${NETWORK_CONFIG.name} network to MetaMask` };
                    }
                    console.error("Failed to switch network:", switchError);
                    return { success: false, error: "Failed to switch to the correct network" };
                }
            }
            
            // Set up listeners for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            
            // Load contract ABIs
            await loadContractABIs();
            
            // Initialize contract instances
            initContractInstances();
            
            // Check if user is registered
            const isRegistered = await checkUserRegistration();
            
            return { success: true, account: currentAccount, isRegistered };
        } catch (error) {
            console.error("Error initializing Web3:", error);
            return { success: false, error: error.message };
        }
    } else {
        console.error("MetaMask is not installed");
        return { success: false, error: "MetaMask is not installed" };
    }
}

// Handle account changes in MetaMask
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has no accounts
        console.log('Please connect to MetaMask.');
        currentAccount = null;
        // Redirect to home page
        window.location.href = 'Blockchain-Law-Firm-DApp.html';
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        // Check if the new account is registered
        checkUserRegistration().then(isRegistered => {
            if (!isRegistered) {
                // Redirect to registration page or show registration modal
                showRegistrationModal();
            } else {
                // Reload the page to update the UI with the new account
                window.location.reload();
            }
        });
    }
}

// Load contract ABIs from the frontend/abi directory
async function loadContractABIs() {
    try {
        // Fetch UserRegistry ABI
        const userRegistryResponse = await fetch('abi/UserRegistry.json');
        userRegistryABI = await userRegistryResponse.json();
        
        // Fetch DocumentStorage ABI
        const documentStorageResponse = await fetch('abi/DocumentStorage.json');
        documentStorageABI = await documentStorageResponse.json();
        
        // Fetch CaseManager ABI
        const caseManagerResponse = await fetch('abi/CaseManager.json');
        caseManagerABI = await caseManagerResponse.json();
    } catch (error) {
        console.error("Error loading contract ABIs:", error);
        throw error;
    }
}

// Initialize contract instances
function initContractInstances() {
    if (!web3 || !userRegistryABI || !documentStorageABI || !caseManagerABI) {
        throw new Error("Web3 or contract ABIs not initialized");
    }
    
    if (!CONTRACT_ADDRESSES.UserRegistry || !CONTRACT_ADDRESSES.DocumentStorage || !CONTRACT_ADDRESSES.CaseManager) {
        throw new Error("Contract addresses not set");
    }
    
    userRegistryContract = new web3.eth.Contract(
        userRegistryABI,
        CONTRACT_ADDRESSES.UserRegistry
    );
    
    documentStorageContract = new web3.eth.Contract(
        documentStorageABI,
        CONTRACT_ADDRESSES.DocumentStorage
    );
    
    caseManagerContract = new web3.eth.Contract(
        caseManagerABI,
        CONTRACT_ADDRESSES.CaseManager
    );
}

// Check if the current user is registered
async function checkUserRegistration() {
    if (!userRegistryContract || !currentAccount) {
        return false;
    }
    
    try {
        const isRegistered = await userRegistryContract.methods.isUserRegistered(currentAccount).call();
        if (isRegistered) {
            const isApproved = await userRegistryContract.methods.isUserApproved(currentAccount).call();
            if (isApproved) {
                // Get user role and store it
                const userRole = await userRegistryContract.methods.getUserRole(currentAccount).call();
                localStorage.setItem('userRole', userRole);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Error checking user registration:", error);
        return false;
    }
}

// Connect to MetaMask
async function connectMetaMask() {
    const result = await initWeb3();
    
    if (result.success) {
        if (result.isRegistered) {
            // User is registered, redirect to appropriate dashboard
            redirectToDashboard();
        } else {
            // User is not registered, show registration modal
            showRegistrationModal();
        }
        return { success: true, account: result.account };
    } else {
        return { success: false, error: result.error };
    }
}

// Redirect to the appropriate dashboard based on user role
function redirectToDashboard() {
    const userRole = localStorage.getItem('userRole');
    
    switch (userRole) {
        case 'lawyer':
            window.location.href = 'Lawyer-Dashboard.html';
            break;
        case 'judge':
            window.location.href = 'judge.html';
            break;
        case 'client':
            window.location.href = 'client.html';
            break;
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        default:
            // If role is unknown, show registration
            showRegistrationModal();
    }
}

// Show registration modal
function showRegistrationModal() {
    // This function would display a modal for user registration
    // For now, we'll just show a placeholder message
    const modalTitle = "Complete Registration";
    const modalContent = `
        <p class="text-gray-600 mb-4">Please complete your registration to access the LexChain platform.</p>
        <div class="space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" id="name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter your full name">
            </div>
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter your email">
            </div>
            <div>
                <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select id="role" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="client">Client</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="judge">Judge</option>
                </select>
            </div>
            <div id="idField" class="hidden">
                <label for="id" class="block text-sm font-medium text-gray-700 mb-1">Professional ID</label>
                <input type="text" id="id" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter your Bar ID or Judicial ID">
            </div>
            <button id="registerButton" class="bg-primary text-white px-4 py-2 rounded-button whitespace-nowrap w-full font-medium hover:bg-opacity-90 transition-all">Register</button>
        </div>
    `;
    
    // Show the modal
    showModal(modalTitle, modalContent);
    
    // Add event listeners for the role select and register button
    setTimeout(() => {
        const roleSelect = document.getElementById('role');
        const idField = document.getElementById('idField');
        const registerButton = document.getElementById('registerButton');
        
        if (roleSelect) {
            roleSelect.addEventListener('change', function() {
                if (this.value === 'lawyer' || this.value === 'judge') {
                    idField.classList.remove('hidden');
                } else {
                    idField.classList.add('hidden');
                }
            });
        }
        
        if (registerButton) {
            registerButton.addEventListener('click', registerUser);
        }
    }, 100);
}

// Register a new user
async function registerUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const id = document.getElementById('id')?.value || '';
    
    if (!name || !email) {
        showToast('Please fill in all required fields');
        return;
    }
    
    if ((role === 'lawyer' || role === 'judge') && !id) {
        showToast(`Please enter your ${role === 'lawyer' ? 'Bar ID' : 'Judicial ID'}`);
        return;
    }
    
    try {
        let result;
        
        switch (role) {
            case 'lawyer':
                result = await userRegistryContract.methods.registerAsLawyer(name, email, id).send({ from: currentAccount });
                break;
            case 'judge':
                result = await userRegistryContract.methods.registerAsJudge(name, email, id).send({ from: currentAccount });
                break;
            case 'client':
                result = await userRegistryContract.methods.registerAsClient(name, email).send({ from: currentAccount });
                break;
            default:
                throw new Error("Invalid role");
        }
        
        if (result) {
            hideModal();
            showToast('Registration submitted successfully! Please wait for admin approval.');
        }
    } catch (error) {
        console.error("Error registering user:", error);
        showToast(`Registration failed: ${error.message}`);
    }
}

// Export functions for use in other files
window.connectMetaMask = connectMetaMask;
window.checkUserRegistration = checkUserRegistration;
window.redirectToDashboard = redirectToDashboard;