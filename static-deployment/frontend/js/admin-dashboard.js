// Admin Dashboard Module for E-Vault Law Management System
import { initMetaMask, connectMetaMask, getCurrentAccount, getUserRegistryContract, getExplorerUrl } from './improved-metamask.js';

// Global variables
let userRegistryContract;
let pendingApprovals = [];
let allUsers = [];
let allCases = [];
let allDocuments = [];

// DOM elements
const pendingApprovalsCount = document.getElementById('pending-approvals-count');
const totalUsersCount = document.getElementById('total-users-count');
const totalCasesCount = document.getElementById('total-cases-count');
const totalDocumentsCount = document.getElementById('total-documents-count');
const pendingApprovalsTableBody = document.getElementById('pending-approvals-table-body');
const allUsersTableBody = document.getElementById('all-users-table-body');
const allCasesTableBody = document.getElementById('all-cases-table-body');
const allDocumentsTableBody = document.getElementById('all-documents-table-body');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading overlay
    showLoading();
    
    try {
        // Initialize MetaMask
        await initMetaMask();
        
        // Check if user is admin
        await checkAdminAccess();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load dashboard data
        await loadDashboardData();
        
        // Hide loading overlay
        hideLoading();
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        hideLoading();
        
        // If not admin, redirect to access denied page
        if (error.message === 'Access denied: Not an admin') {
            window.location.href = 'access-denied.html?message=Only administrators can access this page.';
        } else {
            alert(`Error: ${error.message}`);
        }
    }
});

// Check if user is admin
async function checkAdminAccess() {
    const account = getCurrentAccount();
    if (!account) {
        throw new Error('No wallet connected. Please connect your MetaMask wallet.');
    }
    
    // Get user registry contract
    userRegistryContract = getUserRegistryContract();
    
    // Check if user is admin
    const isAdmin = await userRegistryContract.isAdmin();
    
    if (!isAdmin) {
        throw new Error('Access denied: Not an admin');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Navigation links
    document.getElementById('pending-approvals-link').addEventListener('click', showPendingApprovals);
    document.getElementById('all-users-link').addEventListener('click', showAllUsers);
    document.getElementById('all-cases-link').addEventListener('click', showAllCases);
    document.getElementById('all-documents-link').addEventListener('click', showAllDocuments);
    
    // Dashboard cards
    document.getElementById('view-pending-approvals').addEventListener('click', showPendingApprovals);
    document.getElementById('view-all-users').addEventListener('click', showAllUsers);
    document.getElementById('view-all-cases').addEventListener('click', showAllCases);
    document.getElementById('view-all-documents').addEventListener('click', showAllDocuments);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userAddress');
        window.location.href = 'index.html';
    });
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load pending approvals
        await loadPendingApprovals();
        
        // Load all users
        await loadAllUsers();
        
        // Load all cases
        await loadAllCases();
        
        // Load all documents
        await loadAllDocuments();
        
        // Update dashboard counts
        updateDashboardCounts();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw new Error('Failed to load dashboard data');
    }
}

// Load pending approvals
async function loadPendingApprovals() {
    try {
        // Get pending approval users
        const pendingApprovalAddresses = await userRegistryContract.getPendingApprovalUsers();
        
        // Get details for each user
        pendingApprovals = await Promise.all(
            pendingApprovalAddresses.map(async (address) => {
                const userDetails = await userRegistryContract.getUserDetails(address);
                return {
                    address,
                    name: userDetails.name,
                    email: userDetails.email,
                    role: userDetails.role,
                    id: userDetails.id,
                    registrationDate: new Date(userDetails.registrationDate.toNumber() * 1000)
                };
            })
        );
        
        // Update pending approvals table
        updatePendingApprovalsTable();
    } catch (error) {
        console.error('Error loading pending approvals:', error);
        throw new Error('Failed to load pending approvals');
    }
}

// Load all users
async function loadAllUsers() {
    try {
        // Get all lawyers
        const lawyerAddresses = await userRegistryContract.getAllLawyers();
        
        // Get all judges
        const judgeAddresses = await userRegistryContract.getAllJudges();
        
        // Get all clients
        const clientAddresses = await userRegistryContract.getAllClients();
        
        // Combine all addresses
        const allAddresses = [...lawyerAddresses, ...judgeAddresses, ...clientAddresses];
        
        // Get details for each user
        allUsers = await Promise.all(
            allAddresses.map(async (address) => {
                const userDetails = await userRegistryContract.getUserDetails(address);
                return {
                    address,
                    name: userDetails.name,
                    email: userDetails.email,
                    role: userDetails.role,
                    id: userDetails.id,
                    isActive: userDetails.isActive,
                    isApproved: userDetails.isApproved,
                    registrationDate: new Date(userDetails.registrationDate.toNumber() * 1000)
                };
            })
        );
        
        // Update all users table
        updateAllUsersTable();
    } catch (error) {
        console.error('Error loading all users:', error);
        throw new Error('Failed to load all users');
    }
}

// Load all cases
async function loadAllCases() {
    try {
        // Get case manager contract
        const caseManagerContract = window.caseManagerContract;
        
        // Get case count
        const caseCount = await caseManagerContract.getCaseCount();
        
        // Get details for each case
        allCases = await Promise.all(
            Array.from({ length: caseCount.toNumber() }, (_, i) => i + 1).map(async (caseId) => {
                try {
                    const caseDetails = await caseManagerContract.getCaseDetails(caseId);
                    return {
                        caseId,
                        title: caseDetails.title,
                        description: caseDetails.description,
                        caseType: caseDetails.caseType,
                        client: caseDetails.client,
                        lawyer: caseDetails.lawyer,
                        judge: caseDetails.judge,
                        status: caseDetails.status,
                        filingDate: new Date(caseDetails.filingDate.toNumber() * 1000)
                    };
                } catch (error) {
                    console.error(`Error loading case #${caseId}:`, error);
                    return null;
                }
            })
        );
        
        // Filter out null values
        allCases = allCases.filter(c => c !== null);
        
        // Update all cases table
        updateAllCasesTable();
    } catch (error) {
        console.error('Error loading all cases:', error);
        throw new Error('Failed to load all cases');
    }
}

// Load all documents
async function loadAllDocuments() {
    try {
        // Get document storage contract
        const documentStorageContract = window.documentStorageContract;
        
        // Get document count
        const documentCount = await documentStorageContract.documentCounter();
        
        // Get details for each document
        allDocuments = await Promise.all(
            Array.from({ length: documentCount.toNumber() }, (_, i) => i + 1).map(async (documentId) => {
                try {
                    const documentDetails = await documentStorageContract.getDocument(documentId);
                    return {
                        documentId,
                        name: documentDetails.name,
                        description: documentDetails.description,
                        contentCID: documentDetails.contentCID,
                        documentType: documentDetails.documentType,
                        owner: documentDetails.owner,
                        uploadDate: new Date(documentDetails.uploadDate.toNumber() * 1000),
                        caseId: documentDetails.caseId.toNumber(),
                        isPublic: documentDetails.isPublic
                    };
                } catch (error) {
                    console.error(`Error loading document #${documentId}:`, error);
                    return null;
                }
            })
        );
        
        // Filter out null values
        allDocuments = allDocuments.filter(d => d !== null);
        
        // Update all documents table
        updateAllDocumentsTable();
    } catch (error) {
        console.error('Error loading all documents:', error);
        throw new Error('Failed to load all documents');
    }
}

// Update dashboard counts
function updateDashboardCounts() {
    pendingApprovalsCount.textContent = pendingApprovals.length;
    totalUsersCount.textContent = allUsers.length;
    totalCasesCount.textContent = allCases.length;
    totalDocumentsCount.textContent = allDocuments.length;
}

// Update pending approvals table
function updatePendingApprovalsTable() {
    // Clear table
    pendingApprovalsTableBody.innerHTML = '';
    
    if (pendingApprovals.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="no-data">No pending approvals</td>';
        pendingApprovalsTableBody.appendChild(row);
        return;
    }
    
    // Add rows for each pending approval
    pendingApprovals.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${capitalizeFirstLetter(user.role)}</td>
            <td>${user.id || 'N/A'}</td>
            <td>${formatDate(user.registrationDate)}</td>
            <td class="actions">
                <button class="approve-btn" data-address="${user.address}">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="reject-btn" data-address="${user.address}">
                    <i class="fas fa-times"></i> Reject
                </button>
            </td>
        `;
        pendingApprovalsTableBody.appendChild(row);
    });
    
    // Add event listeners for approve/reject buttons
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', () => approveUser(button.dataset.address));
    });
    
    document.querySelectorAll('.reject-btn').forEach(button => {
        button.addEventListener('click', () => rejectUser(button.dataset.address));
    });
}

// Update all users table
function updateAllUsersTable() {
    // Clear table
    allUsersTableBody.innerHTML = '';
    
    if (allUsers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="no-data">No users found</td>';
        allUsersTableBody.appendChild(row);
        return;
    }
    
    // Add rows for each user
    allUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${capitalizeFirstLetter(user.role)}</td>
            <td>${user.id || 'N/A'}</td>
            <td>
                <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${formatDate(user.registrationDate)}</td>
            <td class="actions">
                <button class="view-btn" data-address="${user.address}">
                    <i class="fas fa-eye"></i> View
                </button>
                ${user.isActive ? 
                    `<button class="deactivate-btn" data-address="${user.address}">
                        <i class="fas fa-ban"></i> Deactivate
                    </button>` : 
                    `<button class="activate-btn" data-address="${user.address}">
                        <i class="fas fa-check"></i> Activate
                    </button>`
                }
            </td>
        `;
        allUsersTableBody.appendChild(row);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => viewUser(button.dataset.address));
    });
    
    document.querySelectorAll('.deactivate-btn').forEach(button => {
        button.addEventListener('click', () => deactivateUser(button.dataset.address));
    });
    
    document.querySelectorAll('.activate-btn').forEach(button => {
        button.addEventListener('click', () => activateUser(button.dataset.address));
    });
}

// Update all cases table
function updateAllCasesTable() {
    // Clear table
    allCasesTableBody.innerHTML = '';
    
    if (allCases.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" class="no-data">No cases found</td>';
        allCasesTableBody.appendChild(row);
        return;
    }
    
    // Add rows for each case
    allCases.forEach(caseItem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${caseItem.caseId}</td>
            <td>${caseItem.title}</td>
            <td>${caseItem.caseType}</td>
            <td>${formatAddress(caseItem.client)}</td>
            <td>${formatAddress(caseItem.lawyer)}</td>
            <td>${formatAddress(caseItem.judge)}</td>
            <td>
                <span class="status-badge status-${caseItem.status.toLowerCase()}">
                    ${capitalizeFirstLetter(caseItem.status)}
                </span>
            </td>
            <td>${formatDate(caseItem.filingDate)}</td>
            <td class="actions">
                <button class="view-case-btn" data-case-id="${caseItem.caseId}">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        allCasesTableBody.appendChild(row);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.view-case-btn').forEach(button => {
        button.addEventListener('click', () => viewCase(button.dataset.caseId));
    });
}

// Update all documents table
function updateAllDocumentsTable() {
    // Clear table
    allDocumentsTableBody.innerHTML = '';
    
    if (allDocuments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="no-data">No documents found</td>';
        allDocumentsTableBody.appendChild(row);
        return;
    }
    
    // Add rows for each document
    allDocuments.forEach(document => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${document.documentId}</td>
            <td>${document.name}</td>
            <td>${document.documentType.toUpperCase()}</td>
            <td>${formatAddress(document.owner)}</td>
            <td>${document.caseId > 0 ? document.caseId : 'N/A'}</td>
            <td>${formatDate(document.uploadDate)}</td>
            <td>
                <span class="status-badge ${document.isPublic ? 'public' : 'private'}">
                    ${document.isPublic ? 'Public' : 'Private'}
                </span>
            </td>
            <td class="actions">
                <a href="https://ipfs.filebase.io/ipfs/${document.contentCID}" target="_blank" class="view-doc-btn">
                    <i class="fas fa-eye"></i> View
                </a>
                <button class="copy-cid-btn" data-cid="${document.contentCID}">
                    <i class="fas fa-copy"></i> Copy CID
                </button>
            </td>
        `;
        allDocumentsTableBody.appendChild(row);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.copy-cid-btn').forEach(button => {
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(button.dataset.cid)
                .then(() => {
                    // Show copied message
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy CID: ', err);
                });
        });
    });
}

// Approve user
async function approveUser(address) {
    try {
        showLoading();
        
        // Call approveUser function
        const tx = await userRegistryContract.approveUser(address);
        
        // Wait for transaction to be mined
        await tx.wait();
        
        // Reload data
        await loadPendingApprovals();
        await loadAllUsers();
        
        // Update dashboard counts
        updateDashboardCounts();
        
        hideLoading();
        
        // Show success message
        alert('User approved successfully!');
    } catch (error) {
        console.error('Error approving user:', error);
        hideLoading();
        alert(`Error approving user: ${error.message}`);
    }
}

// Reject user
async function rejectUser(address) {
    try {
        showLoading();
        
        // Call rejectUser function
        const tx = await userRegistryContract.rejectUser(address);
        
        // Wait for transaction to be mined
        await tx.wait();
        
        // Reload data
        await loadPendingApprovals();
        
        // Update dashboard counts
        updateDashboardCounts();
        
        hideLoading();
        
        // Show success message
        alert('User rejected successfully!');
    } catch (error) {
        console.error('Error rejecting user:', error);
        hideLoading();
        alert(`Error rejecting user: ${error.message}`);
    }
}

// View user
function viewUser(address) {
    // Find user
    const user = allUsers.find(u => u.address === address);
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Show user details in a modal or redirect to user details page
    alert(`
        Name: ${user.name}
        Email: ${user.email}
        Role: ${capitalizeFirstLetter(user.role)}
        ID: ${user.id || 'N/A'}
        Status: ${user.isActive ? 'Active' : 'Inactive'}
        Registration Date: ${formatDate(user.registrationDate)}
        Address: ${user.address}
    `);
}

// Deactivate user
async function deactivateUser(address) {
    try {
        showLoading();
        
        // Call deactivateUser function
        const tx = await userRegistryContract.setUserStatus(address, false);
        
        // Wait for transaction to be mined
        await tx.wait();
        
        // Reload data
        await loadAllUsers();
        
        hideLoading();
        
        // Show success message
        alert('User deactivated successfully!');
    } catch (error) {
        console.error('Error deactivating user:', error);
        hideLoading();
        alert(`Error deactivating user: ${error.message}`);
    }
}

// Activate user
async function activateUser(address) {
    try {
        showLoading();
        
        // Call activateUser function
        const tx = await userRegistryContract.setUserStatus(address, true);
        
        // Wait for transaction to be mined
        await tx.wait();
        
        // Reload data
        await loadAllUsers();
        
        hideLoading();
        
        // Show success message
        alert('User activated successfully!');
    } catch (error) {
        console.error('Error activating user:', error);
        hideLoading();
        alert(`Error activating user: ${error.message}`);
    }
}

// View case
function viewCase(caseId) {
    // Redirect to case details page
    window.location.href = `case-details.html?id=${caseId}`;
}

// Show pending approvals section
function showPendingApprovals() {
    // Hide all sections
    hideAllSections();
    
    // Show pending approvals section
    document.getElementById('pending-approvals-section').style.display = 'block';
}

// Show all users section
function showAllUsers() {
    // Hide all sections
    hideAllSections();
    
    // Show all users section
    document.getElementById('all-users-section').style.display = 'block';
}

// Show all cases section
function showAllCases() {
    // Hide all sections
    hideAllSections();
    
    // Show all cases section
    document.getElementById('all-cases-section').style.display = 'block';
}

// Show all documents section
function showAllDocuments() {
    // Hide all sections
    hideAllSections();
    
    // Show all documents section
    document.getElementById('all-documents-section').style.display = 'block';
}

// Hide all sections
function hideAllSections() {
    document.getElementById('dashboard-overview').style.display = 'none';
    document.getElementById('pending-approvals-section').style.display = 'none';
    document.getElementById('all-users-section').style.display = 'none';
    document.getElementById('all-cases-section').style.display = 'none';
    document.getElementById('all-documents-section').style.display = 'none';
}

// Show loading overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to format address
function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
}