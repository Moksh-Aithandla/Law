// blockchain-service.js - Service for interacting with the blockchain

import { CONTRACT_ADDRESSES, NETWORK_CONFIG, ADMIN_ADDRESS } from './contract-config.js';

// Web3 instance
let web3;

// Contract instances
let userRegistryContract;
let documentStorageContract;
let caseManagerContract;

// Contract ABIs
let userRegistryABI;
let documentStorageABI;
let caseManagerABI;

// Current account
let currentAccount = null;

// Initialize Web3 and contracts
async function initBlockchain() {
    try {
        // Check if Web3 is injected by MetaMask
        if (typeof window.ethereum !== 'undefined') {
            // Create Web3 instance
            web3 = new Web3(window.ethereum);
            
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
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
                    console.error("Failed to switch network:", switchError);
                    throw new Error(`Please switch to the ${NETWORK_CONFIG.name} network in MetaMask`);
                }
            }
            
            // Set up listeners for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            
            // Load contract ABIs
            await loadContractABIs();
            
            // Initialize contract instances
            initContractInstances();
            
            return {
                success: true,
                account: currentAccount
            };
        } else {
            throw new Error("MetaMask is not installed");
        }
    } catch (error) {
        console.error("Error initializing blockchain:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Handle account changes in MetaMask
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has no accounts
        window.location.reload();
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        window.location.reload();
    }
}

// Load contract ABIs
async function loadContractABIs() {
    try {
        // Fetch UserRegistry ABI
        const userRegistryResponse = await fetch('../contracts/UserRegistry.json');
        userRegistryABI = await userRegistryResponse.json();
        
        // Fetch DocumentStorage ABI
        const documentStorageResponse = await fetch('../contracts/DocumentStorage.json');
        documentStorageABI = await documentStorageResponse.json();
        
        // Fetch CaseManager ABI
        const caseManagerResponse = await fetch('../contracts/CaseManager.json');
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

// Check if user is admin
async function isAdmin(address) {
    try {
        if (!userRegistryContract) {
            throw new Error("Contract not initialized");
        }
        
        return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

// Register user
async function registerUser(name, email, id, role, walletAddress) {
    try {
        if (!userRegistryContract) {
            throw new Error("Contract not initialized");
        }
        
        // Register the user
        const tx = await userRegistryContract.methods.requestRegistration(name, email, id, role).send({
            from: currentAccount,
            gas: 500000
        });
        
        // If the current user is admin, approve the user immediately
        if (await isAdmin(currentAccount)) {
            await userRegistryContract.methods.approveUser(walletAddress).send({
                from: currentAccount,
                gas: 200000
            });
        }
        
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error registering user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Approve user
async function approveUser(address) {
    try {
        if (!userRegistryContract) {
            throw new Error("Contract not initialized");
        }
        
        // Check if the current user is admin
        if (!(await isAdmin(currentAccount))) {
            throw new Error("Only admin can approve users");
        }
        
        const tx = await userRegistryContract.methods.approveUser(address).send({
            from: currentAccount,
            gas: 200000
        });
        
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error approving user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Reject user
async function rejectUser(address) {
    try {
        if (!userRegistryContract) {
            throw new Error("Contract not initialized");
        }
        
        // Check if the current user is admin
        if (!(await isAdmin(currentAccount))) {
            throw new Error("Only admin can reject users");
        }
        
        const tx = await userRegistryContract.methods.rejectUser(address).send({
            from: currentAccount,
            gas: 200000
        });
        
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error rejecting user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Upload document to blockchain
async function uploadDocument(cid, documentType, description) {
    try {
        if (!documentStorageContract) {
            throw new Error("Contract not initialized");
        }
        
        const tx = await documentStorageContract.methods.uploadDocument(cid, documentType, description).send({
            from: currentAccount,
            gas: 300000
        });
        
        return {
            success: true,
            transactionHash: tx.transactionHash,
            documentId: tx.events.DocumentUploaded.returnValues.documentId
        };
    } catch (error) {
        console.error("Error uploading document:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Verify document
async function verifyDocument(documentId) {
    try {
        if (!documentStorageContract) {
            throw new Error("Contract not initialized");
        }
        
        const tx = await documentStorageContract.methods.verifyDocument(documentId).send({
            from: currentAccount,
            gas: 200000
        });
        
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error verifying document:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Create case
async function createCase(title, description, clientAddress, lawyerAddress, documentIds) {
    try {
        if (!caseManagerContract) {
            throw new Error("Contract not initialized");
        }
        
        const tx = await caseManagerContract.methods.createCase(
            title,
            description,
            clientAddress,
            lawyerAddress,
            documentIds
        ).send({
            from: currentAccount,
            gas: 500000
        });
        
        return {
            success: true,
            transactionHash: tx.transactionHash,
            caseId: tx.events.CaseCreated.returnValues.caseId
        };
    } catch (error) {
        console.error("Error creating case:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Assign judge to case
async function assignJudge(caseId, judgeAddress) {
    try {
        if (!caseManagerContract) {
            throw new Error("Contract not initialized");
        }
        
        // Check if the current user is admin
        if (!(await isAdmin(currentAccount))) {
            throw new Error("Only admin can assign judges");
        }
        
        const tx = await caseManagerContract.methods.assignJudge(caseId, judgeAddress).send({
            from: currentAccount,
            gas: 200000
        });
        
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error assigning judge:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get all users
async function getAllUsers() {
    try {
        if (!userRegistryContract) {
            throw new Error("Contract not initialized");
        }
        
        const lawyers = await userRegistryContract.methods.getAllLawyers().call();
        const judges = await userRegistryContract.methods.getAllJudges().call();
        const clients = await userRegistryContract.methods.getAllClients().call();
        
        return {
            success: true,
            lawyers,
            judges,
            clients
        };
    } catch (error) {
        console.error("Error getting all users:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get user details
async function getUserDetails(address) {
    try {
        if (!userRegistryContract) {
            throw new Error("Contract not initialized");
        }
        
        const userDetails = await userRegistryContract.methods.getUserDetails(address).call();
        
        return {
            success: true,
            userDetails
        };
    } catch (error) {
        console.error("Error getting user details:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get pending approval users
async function getPendingApprovalUsers() {
    try {
        if (!userRegistryContract) {
            throw new Error("Contract not initialized");
        }
        
        const pendingUsers = await userRegistryContract.methods.getPendingApprovalUsers().call();
        
        return {
            success: true,
            pendingUsers
        };
    } catch (error) {
        console.error("Error getting pending approval users:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get all cases
async function getAllCases() {
    try {
        if (!caseManagerContract) {
            throw new Error("Contract not initialized");
        }
        
        const cases = await caseManagerContract.methods.getAllCases().call();
        
        return {
            success: true,
            cases
        };
    } catch (error) {
        console.error("Error getting all cases:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get case details
async function getCaseDetails(caseId) {
    try {
        if (!caseManagerContract) {
            throw new Error("Contract not initialized");
        }
        
        const caseDetails = await caseManagerContract.methods.getCaseDetails(caseId).call();
        
        return {
            success: true,
            caseDetails
        };
    } catch (error) {
        console.error("Error getting case details:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get document details
async function getDocumentDetails(documentId) {
    try {
        if (!documentStorageContract) {
            throw new Error("Contract not initialized");
        }
        
        const documentDetails = await documentStorageContract.methods.getDocument(documentId).call();
        
        return {
            success: true,
            documentDetails
        };
    } catch (error) {
        console.error("Error getting document details:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export functions
export {
    initBlockchain,
    isAdmin,
    registerUser,
    approveUser,
    rejectUser,
    uploadDocument,
    verifyDocument,
    createCase,
    assignJudge,
    getAllUsers,
    getUserDetails,
    getPendingApprovalUsers,
    getAllCases,
    getCaseDetails,
    getDocumentDetails
};