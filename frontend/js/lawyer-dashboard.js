// lawyer-dashboard.js - Handles lawyer dashboard functionality

// Web3 instance and contract instances
let web3;
let userRegistryContract;
let documentStorageContract;
let caseManagerContract;
let currentAccount;

// DOM elements
const profileSection = document.getElementById('profile-section');
const activeCasesCount = document.getElementById('active-cases-count');
const caseScheduleTable = document.getElementById('case-schedule-table');
const caseScheduleBody = document.getElementById('case-schedule-body');
const uploadBtn = document.getElementById('uploadBtn');
const recentDocumentsTable = document.getElementById('recent-documents-table');
const recentDocumentsBody = document.getElementById('recent-documents-body');
const editProfileBtn = document.getElementById('editProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const mobileMenuButton = document.getElementById('mobile-menu-button');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Web3
    await initWeb3();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load lawyer profile
    await loadLawyerProfile();
    
    // Load cases
    await loadCases();
    
    // Load recent documents
    await loadRecentDocuments();
    
    // Mobile menu toggle
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.body.classList.toggle('mobile-menu-open');
        });
    }
});

// Initialize Web3 and contracts
async function initWeb3() {
    try {
        // Check if Web3 is injected by MetaMask
        if (typeof window.ethereum !== 'undefined') {
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
                    console.error("Failed to switch network:", switchError);
                    showToast("Please switch to the " + NETWORK_CONFIG.name + " network in MetaMask");
                    return false;
                }
            }
            
            // Set up listeners for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            
            // Load contract ABIs
            await loadContractABIs();
            
            // Initialize contract instances
            initContractInstances();
            
            // Check if user is registered and is a lawyer
            const isRegistered = await checkUserRegistration();
            if (!isRegistered) {
                window.location.href = 'Blockchain-Law-Firm-DApp.html';
                return false;
            }
            
            // Check if user is a lawyer
            const userRole = await userRegistryContract.methods.getUserRole(currentAccount).call();
            if (userRole !== 'lawyer') {
                showToast("You are not registered as a lawyer");
                window.location.href = 'Blockchain-Law-Firm-DApp.html';
                return false;
            }
            
            return true;
        } else {
            showToast("MetaMask is not installed");
            return false;
        }
    } catch (error) {
        console.error("Error initializing Web3:", error);
        showToast("Error connecting to blockchain: " + error.message);
        return false;
    }
}

// Handle account changes in MetaMask
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has no accounts
        showToast('Please connect to MetaMask.');
        window.location.href = 'Blockchain-Law-Firm-DApp.html';
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        // Reload the page to update the UI with the new account
        window.location.reload();
    }
}

// Load contract ABIs
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
        showToast("Error loading contract ABIs: " + error.message);
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
            return isApproved;
        }
        return false;
    } catch (error) {
        console.error("Error checking user registration:", error);
        return false;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Edit profile button
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfileModal);
    }
    
    // Upload document button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', showUploadDocumentModal);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('userRole');
            window.location.href = 'Blockchain-Law-Firm-DApp.html';
        });
    }
}

// Load lawyer profile
async function loadLawyerProfile() {
    try {
        if (!userRegistryContract || !currentAccount) return;
        
        const userDetails = await userRegistryContract.methods.getUserDetails(currentAccount).call();
        
        // Update profile information
        document.getElementById('lawyer-name').textContent = userDetails.name;
        document.getElementById('lawyer-email').textContent = userDetails.email;
        document.getElementById('lawyer-bar-id').textContent = userDetails.id;
        
        // Update profile image with MetaMask address (using a placeholder for now)
        document.getElementById('profile-image').src = `https://robohash.org/${currentAccount}?set=set3`;
        
        // Update header profile info
        document.getElementById('header-lawyer-name').textContent = userDetails.name;
        document.getElementById('header-lawyer-role').textContent = "Defense Attorney";
        document.getElementById('header-profile-image').src = `https://robohash.org/${currentAccount}?set=set3`;
        
        // Format wallet address
        const formattedAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
        document.getElementById('wallet-address').textContent = formattedAddress;
    } catch (error) {
        console.error("Error loading lawyer profile:", error);
        showToast("Error loading profile: " + error.message);
    }
}

// Load cases
async function loadCases() {
    try {
        if (!caseManagerContract || !currentAccount) return;
        
        // Get lawyer cases
        const caseIds = await caseManagerContract.methods.getLawyerCases(currentAccount).call();
        
        // Count active cases
        let activeCount = 0;
        const casePromises = [];
        
        // Clear existing table rows
        caseScheduleBody.innerHTML = '';
        
        // Process each case
        for (const caseId of caseIds) {
            casePromises.push(caseManagerContract.methods.getCaseDetails(caseId).call());
        }
        
        const cases = await Promise.all(casePromises);
        
        // Process case details
        cases.forEach((caseDetails, index) => {
            // Count active cases (status 0 = Registered, 1 = InProgress)
            if (caseDetails.status == 0 || caseDetails.status == 1) {
                activeCount++;
            }
            
            // Add case to table (limit to 5 most recent)
            if (index < 5) {
                addCaseToTable(caseDetails);
            }
        });
        
        // Update active cases count
        activeCasesCount.textContent = activeCount;
    } catch (error) {
        console.error("Error loading cases:", error);
        showToast("Error loading cases: " + error.message);
    }
}

// Add case to table
function addCaseToTable(caseDetails) {
    // Get client name
    getUserName(caseDetails.client).then(clientName => {
        // Get opposing lawyer name
        getUserName(caseDetails.judge).then(judgeName => {
            // Create table row
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-100';
            
            // Format date
            const hearingDate = new Date(caseDetails.filingDate * 1000);
            const formattedDate = hearingDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Get status text and class
            const statusInfo = getCaseStatusInfo(caseDetails.status);
            
            // Create row HTML
            tr.innerHTML = `
                <td class="py-4 pr-4">
                    <div class="font-medium">#${caseDetails.caseId}</div>
                </td>
                <td class="py-4 pr-4">
                    <div class="font-medium">${clientName}</div>
                </td>
                <td class="py-4 pr-4">
                    <div>${formattedDate}</div>
                </td>
                <td class="py-4 pr-4">
                    <div>${judgeName}</div>
                </td>
                <td class="py-4 pr-4">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class} whitespace-nowrap">${statusInfo.text}</span>
                </td>
                <td class="py-4">
                    <div class="flex space-x-2">
                        <button class="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-gray-100 !rounded-button view-case" data-case-id="${caseDetails.caseId}">
                            <i class="ri-eye-line"></i>
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-gray-100 !rounded-button edit-case" data-case-id="${caseDetails.caseId}">
                            <i class="ri-edit-line"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Add event listeners
            const viewBtn = tr.querySelector('.view-case');
            const editBtn = tr.querySelector('.edit-case');
            
            viewBtn.addEventListener('click', () => viewCase(caseDetails.caseId));
            editBtn.addEventListener('click', () => editCase(caseDetails.caseId));
            
            // Add to table
            caseScheduleBody.appendChild(tr);
        });
    });
}

// Get case status info
function getCaseStatusInfo(status) {
    // Status: Registered, InProgress, OnHold, Resolved, Closed, Appealed
    switch (parseInt(status)) {
        case 0:
            return { text: 'Scheduled', class: 'status-scheduled' };
        case 1:
            return { text: 'In Progress', class: 'status-in-progress' };
        case 2:
            return { text: 'On Hold', class: 'status-withdrawn' };
        case 3:
            return { text: 'Resolved', class: 'status-settled' };
        case 4:
            return { text: 'Closed', class: 'status-settled' };
        case 5:
            return { text: 'Appealed', class: 'status-withdrawn' };
        default:
            return { text: 'Unknown', class: 'status-withdrawn' };
    }
}

// Get user name from address
async function getUserName(address) {
    try {
        const userDetails = await userRegistryContract.methods.getUserDetails(address).call();
        return userDetails.name;
    } catch (error) {
        console.error("Error getting user name:", error);
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
}

// Load recent documents
async function loadRecentDocuments() {
    try {
        if (!documentStorageContract || !currentAccount) return;
        
        // Get user documents
        const documentIds = await documentStorageContract.methods.getUserDocuments(currentAccount).call();
        
        // Clear existing table rows
        recentDocumentsBody.innerHTML = '';
        
        // Process each document (limit to 5 most recent)
        const recentDocIds = documentIds.slice(-5).reverse();
        
        for (const docId of recentDocIds) {
            const docDetails = await documentStorageContract.methods.getDocument(docId).call();
            addDocumentToTable(docDetails);
        }
    } catch (error) {
        console.error("Error loading documents:", error);
        showToast("Error loading documents: " + error.message);
    }
}

// Add document to table
function addDocumentToTable(docDetails) {
    // Create table row
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50';
    
    // Format date
    const uploadDate = new Date(docDetails.uploadDate * 1000);
    const formattedDate = uploadDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Get document icon based on type
    const docIcon = getDocumentIcon(docDetails.documentType);
    
    // Get status
    const status = docDetails.isPublic ? 
        '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Public</span>' : 
        '<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Private</span>';
    
    // Create row HTML
    tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
                <div class="w-8 h-8 flex items-center justify-center mr-3 text-gray-500">
                    <i class="${docIcon}"></i>
                </div>
                <span class="text-sm text-gray-700">${docDetails.name}</span>
            </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${formattedDate}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            ${status}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
            <div class="flex space-x-2">
                <button class="text-gray-600 hover:text-primary view-document" data-cid="${docDetails.contentCID}">
                    <div class="w-6 h-6 flex items-center justify-center">
                        <i class="ri-eye-line"></i>
                    </div>
                </button>
                <button class="text-gray-600 hover:text-primary download-document" data-cid="${docDetails.contentCID}">
                    <div class="w-6 h-6 flex items-center justify-center">
                        <i class="ri-download-line"></i>
                    </div>
                </button>
            </div>
        </td>
    `;
    
    // Add event listeners
    const viewBtn = tr.querySelector('.view-document');
    const downloadBtn = tr.querySelector('.download-document');
    
    viewBtn.addEventListener('click', () => viewDocument(docDetails.contentCID));
    downloadBtn.addEventListener('click', () => downloadDocument(docDetails.contentCID, docDetails.name));
    
    // Add to table
    recentDocumentsBody.appendChild(tr);
}

// Get document icon based on type
function getDocumentIcon(documentType) {
    const type = documentType.toLowerCase();
    if (type.includes('pdf')) {
        return 'ri-file-pdf-line';
    } else if (type.includes('doc') || type.includes('word')) {
        return 'ri-file-word-line';
    } else if (type.includes('xls') || type.includes('excel')) {
        return 'ri-file-excel-line';
    } else if (type.includes('ppt') || type.includes('powerpoint')) {
        return 'ri-file-ppt-line';
    } else if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif')) {
        return 'ri-file-image-line';
    } else if (type.includes('zip') || type.includes('rar')) {
        return 'ri-file-zip-line';
    } else if (type.includes('txt')) {
        return 'ri-file-text-line';
    } else {
        return 'ri-file-line';
    }
}

// Show edit profile modal
function showEditProfileModal() {
    // Get current user details
    userRegistryContract.methods.getUserDetails(currentAccount).call().then(userDetails => {
        const modalTitle = "Edit Profile";
        const modalContent = `
            <div class="space-y-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="edit-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${userDetails.name}">
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="edit-email" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${userDetails.email}">
                </div>
                <div>
                    <label for="barId" class="block text-sm font-medium text-gray-700 mb-1">Bar ID</label>
                    <input type="text" id="edit-bar-id" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${userDetails.id}" readonly>
                    <p class="text-xs text-gray-500 mt-1">Bar ID cannot be changed</p>
                </div>
                <div>
                    <label for="specialty" class="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <select id="edit-specialty" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="Criminal Law">Criminal Law</option>
                        <option value="Civil Law">Civil Law</option>
                        <option value="Family Law">Family Law</option>
                        <option value="Corporate Law">Corporate Law</option>
                        <option value="Intellectual Property">Intellectual Property</option>
                        <option value="Tax Law">Tax Law</option>
                    </select>
                </div>
                <div>
                    <label for="experience" class="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input type="number" id="edit-experience" class="w-full px-3 py-2 border border-gray-300 rounded-md" min="1" max="50" value="12">
                </div>
                <div>
                    <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                    <input type="text" id="edit-location" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="Manhattan, New York">
                </div>
                <button id="saveProfileBtn" class="bg-primary text-white px-4 py-2 rounded-button whitespace-nowrap w-full font-medium hover:bg-opacity-90 transition-all">Save Changes</button>
            </div>
        `;
        
        // Show the modal
        showModal(modalTitle, modalContent);
        
        // Add event listener for save button
        setTimeout(() => {
            const saveProfileBtn = document.getElementById('saveProfileBtn');
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', updateProfile);
            }
        }, 100);
    }).catch(error => {
        console.error("Error getting user details:", error);
        showToast("Error loading profile: " + error.message);
    });
}

// Update profile
async function updateProfile() {
    try {
        const name = document.getElementById('edit-name').value;
        const email = document.getElementById('edit-email').value;
        const specialty = document.getElementById('edit-specialty').value;
        const experience = document.getElementById('edit-experience').value;
        const location = document.getElementById('edit-location').value;
        
        if (!name || !email) {
            showToast('Please fill in all required fields');
            return;
        }
        
        // Update profile in UserRegistry contract
        // Note: The current contract doesn't have a direct method to update profile
        // We would need to add this functionality to the contract
        // For now, we'll just update the UI
        
        // Update UI
        document.getElementById('lawyer-name').textContent = name;
        document.getElementById('lawyer-email').textContent = email;
        document.getElementById('header-lawyer-name').textContent = name;
        
        // Close modal
        hideModal();
        
        // Show success message
        showToast('Profile updated successfully');
    } catch (error) {
        console.error("Error updating profile:", error);
        showToast("Error updating profile: " + error.message);
    }
}

// Show upload document modal
function showUploadDocumentModal() {
    const modalTitle = "Upload Document";
    const modalContent = `
        <div class="space-y-4">
            <div>
                <label for="doc-name" class="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input type="text" id="doc-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter document name">
            </div>
            <div>
                <label for="doc-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="doc-description" class="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" placeholder="Enter document description"></textarea>
            </div>
            <div>
                <label for="doc-case" class="block text-sm font-medium text-gray-700 mb-1">Associated Case (Optional)</label>
                <select id="doc-case" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="0">None</option>
                    <!-- Cases will be loaded dynamically -->
                </select>
            </div>
            <div>
                <label for="doc-public" class="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <input type="checkbox" id="doc-public" class="mr-2">
                    Make document publicly accessible
                </label>
            </div>
            <div>
                <label for="doc-file" class="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input type="file" id="doc-file" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <button id="uploadDocBtn" class="bg-primary text-white px-4 py-2 rounded-button whitespace-nowrap w-full font-medium hover:bg-opacity-90 transition-all">Upload Document</button>
        </div>
    `;
    
    // Show the modal
    showModal(modalTitle, modalContent);
    
    // Load cases for the dropdown
    setTimeout(async () => {
        const caseSelect = document.getElementById('doc-case');
        if (caseSelect) {
            try {
                const caseIds = await caseManagerContract.methods.getLawyerCases(currentAccount).call();
                
                // Process each case
                for (const caseId of caseIds) {
                    const caseDetails = await caseManagerContract.methods.getCaseDetails(caseId).call();
                    const option = document.createElement('option');
                    option.value = caseId;
                    option.textContent = `#${caseId} - ${caseDetails.title}`;
                    caseSelect.appendChild(option);
                }
            } catch (error) {
                console.error("Error loading cases for dropdown:", error);
            }
        }
        
        // Add event listener for upload button
        const uploadDocBtn = document.getElementById('uploadDocBtn');
        if (uploadDocBtn) {
            uploadDocBtn.addEventListener('click', uploadDocument);
        }
    }, 100);
}

// Upload document
async function uploadDocument() {
    try {
        const name = document.getElementById('doc-name').value;
        const description = document.getElementById('doc-description').value;
        const caseId = document.getElementById('doc-case').value;
        const isPublic = document.getElementById('doc-public').checked;
        const fileInput = document.getElementById('doc-file');
        
        if (!name || !fileInput.files[0]) {
            showToast('Please fill in all required fields and select a file');
            return;
        }
        
        // Show loading state
        document.getElementById('uploadDocBtn').textContent = 'Uploading...';
        document.getElementById('uploadDocBtn').disabled = true;
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        // Upload file to IPFS via Filebase proxy
        const response = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'x-user-address': currentAccount
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload file to IPFS');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.cid) {
            throw new Error('Failed to get CID from IPFS');
        }
        
        // Store document reference in blockchain
        await documentStorageContract.methods.storeDocument(
            name,
            description,
            data.cid,
            fileInput.files[0].type,
            caseId,
            isPublic
        ).send({ from: currentAccount });
        
        // If associated with a case, add to case documents
        if (caseId !== '0') {
            await caseManagerContract.methods.addDocument(
                caseId,
                name,
                data.cid,
                fileInput.files[0].type,
                isPublic
            ).send({ from: currentAccount });
        }
        
        // Close modal
        hideModal();
        
        // Reload documents
        await loadRecentDocuments();
        
        // Show success message
        showToast('Document uploaded successfully');
    } catch (error) {
        console.error("Error uploading document:", error);
        showToast("Error uploading document: " + error.message);
        
        // Reset button state
        const uploadBtn = document.getElementById('uploadDocBtn');
        if (uploadBtn) {
            uploadBtn.textContent = 'Upload Document';
            uploadBtn.disabled = false;
        }
    }
}

// View document
function viewDocument(cid) {
    window.open(`https://ipfs.filebase.io/ipfs/${cid}`, '_blank');
}

// Download document
function downloadDocument(cid, name) {
    const link = document.createElement('a');
    link.href = `https://ipfs.filebase.io/ipfs/${cid}`;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// View case
function viewCase(caseId) {
    // Implement case viewing functionality
    showToast(`Viewing case #${caseId}`);
}

// Edit case
function editCase(caseId) {
    // Implement case editing functionality
    showToast(`Editing case #${caseId}`);
}

// Show modal
function showModal(title, content) {
    // Check if modal container exists
    let modalContainer = document.getElementById('modal-container');
    
    // Create modal container if it doesn't exist
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
        document.body.appendChild(modalContainer);
    }
    
    // Create modal content
    modalContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
            <div class="flex items-center justify-between px-6 py-4 border-b">
                <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                <button id="close-modal" class="text-gray-400 hover:text-gray-500">
                    <i class="ri-close-line text-xl"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                ${content}
            </div>
        </div>
    `;
    
    // Show modal
    modalContainer.style.display = 'flex';
    
    // Add event listener for close button
    document.getElementById('close-modal').addEventListener('click', hideModal);
}

// Hide modal
function hideModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}

// Show toast notification
function showToast(message) {
    // Check if toast container exists
    let toastContainer = document.getElementById('toast-container');
    
    // Create toast container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-4 right-4 z-50';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg mb-3 animate-fade-in flex items-center';
    toast.innerHTML = `
        <div class="mr-2">
            <i class="ri-information-line"></i>
        </div>
        <div>${message}</div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}