// judge-dashboard.js - Handles judge dashboard functionality

// Web3 instance and contract instances
let web3;
let userRegistryContract;
let documentStorageContract;
let caseManagerContract;
let currentAccount;

// DOM elements
const judgeName = document.querySelectorAll('.judge-name');
const judgeRole = document.querySelectorAll('.judge-role');
const walletAddress = document.querySelectorAll('.wallet-address');
const profileImage = document.querySelectorAll('.profile-image');
const totalCasesCount = document.querySelector('.total-cases-count');
const upcomingHearingsCount = document.querySelector('.upcoming-hearings-count');
const closedCasesCount = document.querySelector('.closed-cases-count');
const pendingJudgmentsCount = document.querySelector('.pending-judgments-count');
const upcomingHearingsTable = document.querySelector('.upcoming-hearings-table tbody');
const editProfileButton = document.querySelector('.edit-profile-button');
const logoutButton = document.querySelector('.logout-button');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Web3
    await initWeb3();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load judge profile
    await loadJudgeProfile();
    
    // Load cases and hearings
    await loadCasesAndHearings();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Initialize charts if they exist
    initializeCharts();
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
            
            // Check if user is registered and is a judge
            const isRegistered = await checkUserRegistration();
            if (!isRegistered) {
                window.location.href = 'Blockchain-Law-Firm-DApp.html';
                return false;
            }
            
            // Check if user is a judge
            const userRole = await userRegistryContract.methods.getUserRole(currentAccount).call();
            if (userRole !== 'judge') {
                showToast("You are not registered as a judge");
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
    if (editProfileButton) {
        editProfileButton.addEventListener('click', showEditProfileModal);
    }
    
    // Logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('userRole');
            window.location.href = 'Blockchain-Law-Firm-DApp.html';
        });
    }
    
    // Add event listeners for schedule hearing buttons
    document.querySelectorAll('.schedule-hearing-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const caseId = this.getAttribute('data-case-id');
            showScheduleHearingModal(caseId);
        });
    });
    
    // Add event listeners for complete hearing buttons
    document.querySelectorAll('.complete-hearing-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const caseId = this.getAttribute('data-case-id');
            const hearingId = this.getAttribute('data-hearing-id');
            completeHearing(caseId, hearingId);
        });
    });
}

// Load judge profile
async function loadJudgeProfile() {
    try {
        if (!userRegistryContract || !currentAccount) return;
        
        const userDetails = await userRegistryContract.methods.getUserDetails(currentAccount).call();
        
        // Update profile information
        judgeName.forEach(el => {
            if (el) el.textContent = userDetails.name;
        });
        
        judgeRole.forEach(el => {
            if (el) el.textContent = "Senior Judge";
        });
        
        // Format wallet address
        const formattedAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
        walletAddress.forEach(el => {
            if (el) el.textContent = formattedAddress;
        });
        
        // Update profile image with MetaMask address (using a placeholder for now)
        profileImage.forEach(el => {
            if (el) el.src = `https://robohash.org/${currentAccount}?set=set3`;
        });
        
        // Set current date
        const currentDate = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.querySelectorAll('.current-date').forEach(el => {
            if (el) el.textContent = currentDate.toLocaleDateString('en-US', options);
        });
    } catch (error) {
        console.error("Error loading judge profile:", error);
        showToast("Error loading profile: " + error.message);
    }
}

// Load cases and hearings
async function loadCasesAndHearings() {
    try {
        if (!caseManagerContract || !currentAccount) return;
        
        // Get judge cases
        const caseIds = await caseManagerContract.methods.getJudgeCases(currentAccount).call();
        
        // Count cases by status
        let totalCases = caseIds.length;
        let closedCases = 0;
        let pendingJudgments = 0;
        let upcomingHearings = 0;
        
        // Clear existing table rows
        if (upcomingHearingsTable) {
            upcomingHearingsTable.innerHTML = '';
        }
        
        // Process each case
        for (const caseId of caseIds) {
            const caseDetails = await caseManagerContract.methods.getCaseDetails(caseId).call();
            
            // Count cases by status
            // Status: Registered, InProgress, OnHold, Resolved, Closed, Appealed
            if (caseDetails.status == 3 || caseDetails.status == 4) {
                closedCases++;
            } else if (caseDetails.status == 1) {
                pendingJudgments++;
            }
            
            // Get hearings for this case
            const hearings = await caseManagerContract.methods.getCaseHearings(caseId).call();
            
            // Count upcoming hearings
            const now = Math.floor(Date.now() / 1000);
            const upcomingHearingsForCase = hearings.filter(h => 
                parseInt(h.scheduledDate) > now && !h.completed
            );
            
            upcomingHearings += upcomingHearingsForCase.length;
            
            // Add upcoming hearings to the table
            if (upcomingHearingsTable) {
                for (const hearing of upcomingHearingsForCase.slice(0, 5)) { // Limit to 5 hearings
                    await addHearingToTable(caseId, caseDetails, hearing);
                }
            }
        }
        
        // Update case counts
        if (totalCasesCount) totalCasesCount.textContent = totalCases;
        if (upcomingHearingsCount) upcomingHearingsCount.textContent = upcomingHearings;
        if (closedCasesCount) closedCasesCount.textContent = closedCases;
        if (pendingJudgmentsCount) pendingJudgmentsCount.textContent = pendingJudgments;
    } catch (error) {
        console.error("Error loading cases and hearings:", error);
        showToast("Error loading cases and hearings: " + error.message);
    }
}

// Add hearing to table
async function addHearingToTable(caseId, caseDetails, hearing) {
    try {
        // Get client name
        const clientName = await getUserName(caseDetails.client);
        
        // Get lawyer name
        const lawyerName = await getUserName(caseDetails.lawyer);
        
        // Format date
        const hearingDate = new Date(hearing.scheduledDate * 1000);
        const formattedDate = hearingDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedTime = hearingDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Create table row
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        
        // Create row HTML
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${caseId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${clientName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${lawyerName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${formattedDate} - ${formattedTime}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge scheduled px-2.5 py-1 rounded-full text-xs font-medium">Scheduled</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary hover:text-primary/80 mr-3 view-case-btn" data-case-id="${caseId}">
                    <div class="w-5 h-5 flex items-center justify-center">
                        <i class="ri-eye-line"></i>
                    </div>
                </button>
                <button class="text-primary hover:text-primary/80 complete-hearing-btn" data-case-id="${caseId}" data-hearing-id="${hearing.hearingId}">
                    <div class="w-5 h-5 flex items-center justify-center">
                        <i class="ri-check-line"></i>
                    </div>
                </button>
            </td>
        `;
        
        // Add event listeners
        const viewCaseBtn = tr.querySelector('.view-case-btn');
        const completeHearingBtn = tr.querySelector('.complete-hearing-btn');
        
        viewCaseBtn.addEventListener('click', () => viewCase(caseId));
        completeHearingBtn.addEventListener('click', () => completeHearing(caseId, hearing.hearingId));
        
        // Add to table
        upcomingHearingsTable.appendChild(tr);
    } catch (error) {
        console.error("Error adding hearing to table:", error);
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

// View case
function viewCase(caseId) {
    // Implement case viewing functionality
    showToast(`Viewing case #${caseId}`);
}

// Complete hearing
async function completeHearing(caseId, hearingId) {
    try {
        await caseManagerContract.methods.completeHearing(caseId, hearingId).send({ from: currentAccount });
        showToast('Hearing marked as completed');
        
        // Reload cases and hearings
        await loadCasesAndHearings();
    } catch (error) {
        console.error("Error completing hearing:", error);
        showToast("Error completing hearing: " + error.message);
    }
}

// Show schedule hearing modal
function showScheduleHearingModal(caseId) {
    const modalTitle = "Schedule Hearing";
    const modalContent = `
        <div class="space-y-4">
            <div>
                <label for="hearing-date" class="block text-sm font-medium text-gray-700 mb-1">Hearing Date</label>
                <input type="date" id="hearing-date" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label for="hearing-time" class="block text-sm font-medium text-gray-700 mb-1">Hearing Time</label>
                <input type="time" id="hearing-time" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label for="hearing-location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" id="hearing-location" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter hearing location">
            </div>
            <div>
                <label for="hearing-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="hearing-description" class="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" placeholder="Enter hearing description"></textarea>
            </div>
            <button id="scheduleHearingBtn" class="bg-primary text-white px-4 py-2 rounded-button whitespace-nowrap w-full font-medium hover:bg-opacity-90 transition-all" data-case-id="${caseId}">Schedule Hearing</button>
        </div>
    `;
    
    // Show the modal
    showModal(modalTitle, modalContent);
    
    // Add event listener for schedule button
    setTimeout(() => {
        const scheduleHearingBtn = document.getElementById('scheduleHearingBtn');
        if (scheduleHearingBtn) {
            scheduleHearingBtn.addEventListener('click', scheduleHearing);
        }
    }, 100);
}

// Schedule hearing
async function scheduleHearing() {
    try {
        const caseId = document.getElementById('scheduleHearingBtn').getAttribute('data-case-id');
        const hearingDate = document.getElementById('hearing-date').value;
        const hearingTime = document.getElementById('hearing-time').value;
        const location = document.getElementById('hearing-location').value;
        const description = document.getElementById('hearing-description').value;
        
        if (!hearingDate || !hearingTime || !location) {
            showToast('Please fill in all required fields');
            return;
        }
        
        // Convert date and time to timestamp
        const hearingDateTime = new Date(`${hearingDate}T${hearingTime}`);
        const timestamp = Math.floor(hearingDateTime.getTime() / 1000);
        
        // Schedule hearing
        await caseManagerContract.methods.scheduleHearing(
            caseId,
            timestamp,
            location,
            description
        ).send({ from: currentAccount });
        
        // Close modal
        hideModal();
        
        // Reload cases and hearings
        await loadCasesAndHearings();
        
        // Show success message
        showToast('Hearing scheduled successfully');
    } catch (error) {
        console.error("Error scheduling hearing:", error);
        showToast("Error scheduling hearing: " + error.message);
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
                    <label for="judicialId" class="block text-sm font-medium text-gray-700 mb-1">Judicial ID</label>
                    <input type="text" id="edit-judicial-id" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${userDetails.id}" readonly>
                    <p class="text-xs text-gray-500 mt-1">Judicial ID cannot be changed</p>
                </div>
                <div>
                    <label for="department" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select id="edit-department" class="w-full px-3 py-2 border border-gray-300 rounded-md">
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
                    <input type="number" id="edit-experience" class="w-full px-3 py-2 border border-gray-300 rounded-md" min="1" max="50" value="15">
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
        const department = document.getElementById('edit-department').value;
        const experience = document.getElementById('edit-experience').value;
        
        if (!name || !email) {
            showToast('Please fill in all required fields');
            return;
        }
        
        // Update profile in UserRegistry contract
        // Note: The current contract doesn't have a direct method to update profile
        // We would need to add this functionality to the contract
        // For now, we'll just update the UI
        
        // Update UI
        judgeName.forEach(el => {
            if (el) el.textContent = name;
        });
        
        // Close modal
        hideModal();
        
        // Show success message
        showToast('Profile updated successfully');
    } catch (error) {
        console.error("Error updating profile:", error);
        showToast("Error updating profile: " + error.message);
    }
}

// Initialize charts
function initializeCharts() {
    // Case Status Distribution Chart
    const caseStatusChart = document.getElementById('caseStatusChart');
    if (caseStatusChart) {
        const chart = echarts.init(caseStatusChart);
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center',
                data: ['Active', 'Resolved', 'On Hold', 'Appealed']
            },
            series: [
                {
                    name: 'Case Status',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: 35, name: 'Active', itemStyle: { color: '#3b82f6' } },
                        { value: 20, name: 'Resolved', itemStyle: { color: '#22c55e' } },
                        { value: 15, name: 'On Hold', itemStyle: { color: '#f97316' } },
                        { value: 10, name: 'Appealed', itemStyle: { color: '#ef4444' } }
                    ]
                }
            ]
        };
        chart.setOption(option);
        
        // Resize chart on window resize
        window.addEventListener('resize', function() {
            chart.resize();
        });
    }
    
    // Monthly Case Trend Chart
    const caseTrendChart = document.getElementById('caseTrendChart');
    if (caseTrendChart) {
        const chart = echarts.init(caseTrendChart);
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'New Cases',
                    type: 'bar',
                    barWidth: '60%',
                    data: [10, 15, 12, 18, 20, 15],
                    itemStyle: {
                        color: '#4f46e5'
                    }
                }
            ]
        };
        chart.setOption(option);
        
        // Resize chart on window resize
        window.addEventListener('resize', function() {
            chart.resize();
        });
    }
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