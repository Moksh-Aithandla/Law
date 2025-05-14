// admin-dashboard.js - Handles admin dashboard functionality and smart contract interactions

import { CONTRACT_ADDRESSES, NETWORK_CONFIG, SEPOLIA_ETHERSCAN_URL, ADMIN_ADDRESS, FILEBASE_CONFIG } from './contract-config.js';

// Web3 instance
let web3;

// Contract instances
let userRegistryContract;
let documentStorageContract;
let caseManagerContract;

// Current admin account
let currentAccount = null;

// Transaction tracking
let transactionLog = [];
const TRANSACTION_LOG_KEY = 'blockchain_law_transaction_log';

// Initialize the dashboard
async function initDashboard() {
    try {
        // Import the blockchain service
        const { initBlockchain, isAdmin } = await import('./blockchain-service.js');
        
        // Initialize blockchain
        const blockchainResult = await initBlockchain();
        
        if (!blockchainResult.success) {
            alert(blockchainResult.error);
            window.location.href = 'Blockchain-Law-Firm-DApp.html';
            return;
        }
        
        // Set current account
        currentAccount = blockchainResult.account;
        
        // Check if the current account is the admin
        const adminResult = await isAdmin(currentAccount);
        
        if (!adminResult) {
            alert("You are not authorized to access the admin dashboard.");
            window.location.href = 'Blockchain-Law-Firm-DApp.html';
            return;
        }
        
        // Load dashboard data
        await loadDashboardData();
        
        // Set up event listeners for forms
        setupFormListeners();
        
        // Display admin address
        displayAdminInfo();
        
        // Initialize transaction tracking
        initTransactionTracking();
        
        // Set up transaction event listeners
        setupTransactionEventListeners();
        
        // Initialize charts
        initializeCharts();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        alert("Error initializing dashboard. Please check the console for details.");
    }
}

// Initialize charts
function initializeCharts() {
    // User Registration Chart
    const userRegistrationChart = echarts.init(document.getElementById('user-registration-chart'));
    const userRegistrationOption = {
        animation: false,
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            textStyle: {
                color: '#1f2937'
            }
        },
        legend: {
            data: ['Lawyers', 'Judges', 'Clients'],
            textStyle: {
                color: '#1f2937'
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
            boundaryGap: false,
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            axisLine: {
                lineStyle: {
                    color: '#1f2937'
                }
            },
            axisLabel: {
                color: '#1f2937'
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#1f2937'
                }
            },
            axisLabel: {
                color: '#1f2937'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(31, 41, 55, 0.1)'
                }
            }
        },
        series: [
            {
                name: 'Lawyers',
                type: 'line',
                smooth: true,
                data: [8, 12, 15, 20, 25],
                itemStyle: {
                    color: 'rgba(87, 181, 231, 1)'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(87, 181, 231, 0.2)'
                        }, {
                            offset: 1, color: 'rgba(87, 181, 231, 0.01)'
                        }]
                    }
                }
            },
            {
                name: 'Judges',
                type: 'line',
                smooth: true,
                data: [3, 4, 6, 2, 3],
                itemStyle: {
                    color: 'rgba(141, 211, 199, 1)'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(141, 211, 199, 0.2)'
                        }, {
                            offset: 1, color: 'rgba(141, 211, 199, 0.01)'
                        }]
                    }
                }
            },
            {
                name: 'Clients',
                type: 'line',
                smooth: true,
                data: [15, 22, 28, 35, 42],
                itemStyle: {
                    color: 'rgba(251, 191, 114, 1)'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(251, 191, 114, 0.2)'
                        }, {
                            offset: 1, color: 'rgba(251, 191, 114, 0.01)'
                        }]
                    }
                }
            }
        ]
    };
    userRegistrationChart.setOption(userRegistrationOption);
    
    // Document Verification Chart
    const documentVerificationChart = echarts.init(document.getElementById('document-verification-chart'));
    const documentVerificationOption = {
        animation: false,
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            textStyle: {
                color: '#1f2937'
            }
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: {
                color: '#1f2937'
            }
        },
        series: [
            {
                name: 'Document Types',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '14',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 42, name: 'Case Files', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
                    { value: 28, name: 'Evidence Docs', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
                    { value: 18, name: 'Judgments', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
                    { value: 12, name: 'Other', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
                ]
            }
        ]
    };
    documentVerificationChart.setOption(documentVerificationOption);
    
    // Responsive charts
    window.addEventListener('resize', function() {
        userRegistrationChart.resize();
        documentVerificationChart.resize();
    });
}
}

// Handle account changes in MetaMask
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has no accounts
        alert("Please connect to MetaMask.");
        window.location.href = 'Blockchain-Law-Firm-DApp.html';
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        
        // Check if the new account is the admin
        if (currentAccount.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
            alert("You are not authorized to access the admin dashboard.");
            window.location.href = 'Blockchain-Law-Firm-DApp.html';
        } else {
            // Reload the dashboard data
            loadDashboardData();
        }
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
    } catch (error) {
        console.error("Error loading contract ABIs:", error);
        throw error;
    }
}

// Initialize contract instances
function initContractInstances() {
    if (!web3 || !userRegistryContract || !documentStorageContract || !caseManagerContract) {
        throw new Error("Web3 or contract instances not initialized");
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Get counts of lawyers, judges, and clients
        const lawyers = await userRegistryContract.methods.getAllLawyers().call();
        const judges = await userRegistryContract.methods.getAllJudges().call();
        const clients = await userRegistryContract.methods.getAllClients().call();
        
        // Update the dashboard counters
        document.querySelector('.total-lawyers').textContent = lawyers.length;
        document.querySelector('.total-judges').textContent = judges.length;
        document.querySelector('.total-clients').textContent = clients.length;
        
        // Get pending approval users
        const pendingUsers = await userRegistryContract.methods.getPendingApprovalUsers().call();
        
        // Load user details for the table
        await loadUserTable(lawyers, judges, clients, pendingUsers);
        
        // Update charts with real data
        updateCharts(lawyers, judges, clients);
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        alert("Error loading dashboard data. Please check the console for details.");
    }
}

// Load user table
async function loadUserTable(lawyers, judges, clients, pendingUsers) {
    try {
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        
        // Combine all users
        const allUsers = [...lawyers, ...judges, ...clients, ...pendingUsers];
        const uniqueUsers = [...new Set(allUsers)]; // Remove duplicates
        
        // Get user details for each user
        for (const userAddress of uniqueUsers) {
            const userDetails = await userRegistryContract.methods.getUserDetails(userAddress).call();
            
            // Create table row
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // Format wallet address for display
            const formattedAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
            
            // Determine status class and text
            let statusClass = '';
            let statusText = '';
            
            if (userDetails.isApproved) {
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'Active';
            } else {
                statusClass = 'bg-yellow-100 text-yellow-800';
                statusText = 'Pending';
            }
            
            // Format date
            const date = new Date(userDetails.registrationDate * 1000);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Create row HTML
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="text-blue-600 font-medium">${userDetails.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${userDetails.name}</div>
                            <div class="text-sm text-gray-500">${userDetails.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${userDetails.id || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formattedAddress}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formattedDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button class="text-primary hover:text-primary/80 view-user" data-address="${userAddress}">
                            <div class="w-5 h-5 flex items-center justify-center">
                                <i class="ri-eye-line"></i>
                            </div>
                        </button>
                        ${!userDetails.isApproved ? `
                            <button class="text-green-600 hover:text-green-700 approve-user" data-address="${userAddress}">
                                <div class="w-5 h-5 flex items-center justify-center">
                                    <i class="ri-check-line"></i>
                                </div>
                            </button>
                            <button class="text-red-600 hover:text-red-700 reject-user" data-address="${userAddress}">
                                <div class="w-5 h-5 flex items-center justify-center">
                                    <i class="ri-close-line"></i>
                                </div>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // Add event listeners to the buttons
        document.querySelectorAll('.approve-user').forEach(button => {
            button.addEventListener('click', async function() {
                const userAddress = this.getAttribute('data-address');
                await approveUser(userAddress);
            });
        });
        
        document.querySelectorAll('.reject-user').forEach(button => {
            button.addEventListener('click', async function() {
                const userAddress = this.getAttribute('data-address');
                await rejectUser(userAddress);
            });
        });
        
        document.querySelectorAll('.view-user').forEach(button => {
            button.addEventListener('click', async function() {
                const userAddress = this.getAttribute('data-address');
                await viewUserDetails(userAddress);
            });
        });
    } catch (error) {
        console.error("Error loading user table:", error);
        alert("Error loading user table. Please check the console for details.");
    }
}

// Update charts with real data
function updateCharts(lawyers, judges, clients) {
    try {
        // Get chart instances
        const userRegistrationChart = echarts.getInstanceByDom(document.getElementById('user-registration-chart'));
        const documentVerificationChart = echarts.getInstanceByDom(document.getElementById('document-verification-chart'));
        
        if (userRegistrationChart) {
            // Update user registration chart with real data
            // For now, we'll use dummy data for the trend
            // In a real application, you would fetch historical data
            const lawyerData = [lawyers.length - 4, lawyers.length - 2, lawyers.length - 1, lawyers.length];
            const judgeData = [judges.length - 2, judges.length - 1, judges.length - 1, judges.length];
            const clientData = [clients.length - 10, clients.length - 6, clients.length - 3, clients.length];
            
            userRegistrationChart.setOption({
                series: [
                    {
                        name: 'Lawyers',
                        data: lawyerData
                    },
                    {
                        name: 'Judges',
                        data: judgeData
                    },
                    {
                        name: 'Clients',
                        data: clientData
                    }
                ]
            });
        }
        
        // For document verification chart, we would need to fetch document data
        // For now, we'll leave it with the dummy data
    } catch (error) {
        console.error("Error updating charts:", error);
    }
}

// Set up form listeners
function setupFormListeners() {
    // Add Lawyer Form
    const addLawyerForm = document.querySelector('.add-lawyer-form');
    if (addLawyerForm) {
        addLawyerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await registerUser('lawyer', this);
        });
    }
    
    // Add Judge Form
    const addJudgeForm = document.querySelector('.add-judge-form');
    if (addJudgeForm) {
        addJudgeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await registerUser('judge', this);
        });
    }
    
    // Add Client Form
    const addClientForm = document.querySelector('.add-client-form');
    if (addClientForm) {
        addClientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await registerUser('client', this);
        });
    }
    
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Clear any stored data
            localStorage.removeItem('userRole');
            
            // Redirect to home page
            window.location.href = 'Blockchain-Law-Firm-DApp.html';
        });
    }
}

// Register a new user
async function registerUser(role, form) {
    try {
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const walletAddress = form.querySelector('input[placeholder="0x..."]').value;
        
        if (!name || !email || !walletAddress) {
            alert("Please fill in all required fields.");
            return;
        }
        
        // Validate wallet address
        if (!web3.utils.isAddress(walletAddress)) {
            alert("Invalid wallet address. Please enter a valid Ethereum address.");
            return;
        }
        
        // Check if the user is already registered
        const isRegistered = await userRegistryContract.methods.isUserRegistered(walletAddress).call();
        if (isRegistered) {
            alert("This wallet address is already registered.");
            return;
        }
        
        let id = '';
        
        // Get ID based on role
        if (role === 'lawyer') {
            id = form.querySelector('input[placeholder="BAR12345678"]').value;
            if (!id) {
                alert("Please enter a Bar ID.");
                return;
            }
            
            // Check if the Bar ID is already registered
            const isValidBarId = await userRegistryContract.methods.isValidBarId(id).call();
            if (isValidBarId) {
                alert("This Bar ID is already registered.");
                return;
            }
        } else if (role === 'judge') {
            id = form.querySelector('input[placeholder="JUD12345678"]').value;
            if (!id) {
                alert("Please enter a Judicial ID.");
                return;
            }
            
            // Check if the Judicial ID is already registered
            const isValidJudicialId = await userRegistryContract.methods.isValidJudicialId(id).call();
            if (isValidJudicialId) {
                alert("This Judicial ID is already registered.");
                return;
            }
        }
        
        // Register the user using the admin's account
        // Since we're registering on behalf of the user, we'll use the requestRegistration function
        await userRegistryContract.methods.requestRegistration(name, email, id, role).send({
            from: currentAccount,
            gas: 500000
        });
        
        // Approve the user immediately since it's added by the admin
        await userRegistryContract.methods.approveUser(walletAddress).send({
            from: currentAccount,
            gas: 200000
        });
        
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered and approved successfully.`);
        
        // Reset the form
        form.reset();
        
        // Reload dashboard data
        await loadDashboardData();
    } catch (error) {
        console.error(`Error registering ${role}:`, error);
        alert(`Error registering ${role}. Please check the console for details.`);
    }
}

// Approve a user
async function approveUser(userAddress) {
    try {
        await userRegistryContract.methods.approveUser(userAddress).send({
            from: currentAccount,
            gas: 200000
        });
        
        alert("User approved successfully.");
        
        // Reload dashboard data
        await loadDashboardData();
    } catch (error) {
        console.error("Error approving user:", error);
        alert("Error approving user. Please check the console for details.");
    }
}

// Reject a user
async function rejectUser(userAddress) {
    try {
        await userRegistryContract.methods.rejectUser(userAddress).send({
            from: currentAccount,
            gas: 200000
        });
        
        alert("User rejected successfully.");
        
        // Reload dashboard data
        await loadDashboardData();
    } catch (error) {
        console.error("Error rejecting user:", error);
        alert("Error rejecting user. Please check the console for details.");
    }
}

// View user details
async function viewUserDetails(userAddress) {
    try {
        const userDetails = await userRegistryContract.methods.getUserDetails(userAddress).call();
        
        // Display user details in a modal or alert
        alert(`
            Name: ${userDetails.name}
            Email: ${userDetails.email}
            Role: ${userDetails.role}
            ID: ${userDetails.id || 'N/A'}
            Status: ${userDetails.isApproved ? 'Approved' : 'Pending'}
            Registration Date: ${new Date(userDetails.registrationDate * 1000).toLocaleString()}
        `);
    } catch (error) {
        console.error("Error viewing user details:", error);
        alert("Error viewing user details. Please check the console for details.");
    }
}

// Display admin info
function displayAdminInfo() {
    // Display admin address in the header
    const adminAddressElement = document.querySelector('.admin-address');
    if (adminAddressElement) {
        adminAddressElement.textContent = `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Import the blockchain service
        const { getAllUsers, getPendingApprovalUsers } = await import('./blockchain-service.js');
        
        // Get all users
        const usersResult = await getAllUsers();
        
        if (!usersResult.success) {
            throw new Error(usersResult.error);
        }
        
        // Get pending approval users
        const pendingResult = await getPendingApprovalUsers();
        
        if (!pendingResult.success) {
            throw new Error(pendingResult.error);
        }
        
        // Update user counts
        updateUserCounts(usersResult.lawyers.length, usersResult.judges.length, usersResult.clients.length);
        
        // Update user tables
        await loadUserTable(usersResult.lawyers, usersResult.judges, usersResult.clients, pendingResult.pendingUsers);
        
        // Update pending approvals
        await loadPendingApprovals(pendingResult.pendingUsers);
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        alert("Error loading dashboard data. Please check the console for details.");
    }
}

// Update user counts
function updateUserCounts(lawyersCount, judgesCount, clientsCount) {
    const totalLawyers = document.querySelector('.total-lawyers');
    const totalJudges = document.querySelector('.total-judges');
    const totalClients = document.querySelector('.total-clients');
    
    if (totalLawyers) totalLawyers.textContent = lawyersCount;
    if (totalJudges) totalJudges.textContent = judgesCount;
    if (totalClients) totalClients.textContent = clientsCount;
}

// Load user table
async function loadUserTable(lawyers, judges, clients, pendingUsers) {
    try {
        // Import the blockchain service
        const { getUserDetails } = await import('./blockchain-service.js');
        
        const usersList = document.querySelector('.users-list');
        if (!usersList) return;
        
        // Clear existing users
        usersList.innerHTML = '';
        
        // Combine all users
        const allUsers = [...lawyers, ...judges, ...clients];
        const uniqueUsers = [...new Set(allUsers)]; // Remove duplicates
        
        // Process each user
        for (const userAddress of uniqueUsers) {
            // Skip pending users
            if (pendingUsers.includes(userAddress)) continue;
            
            // Get user details
            const result = await getUserDetails(userAddress);
            
            if (!result.success) {
                console.error(`Error getting details for user ${userAddress}:`, result.error);
                continue;
            }
            
            const userDetails = result.userDetails;
            
            // Determine role
            let role = '';
            if (lawyers.includes(userAddress)) {
                role = 'lawyer';
            } else if (judges.includes(userAddress)) {
                role = 'judge';
            } else if (clients.includes(userAddress)) {
                role = 'client';
            }
            
            // Add user to list
            addUserToList(userAddress, userDetails, role, usersList);
        }
    } catch (error) {
        console.error("Error loading user table:", error);
    }
}

// Add user to list
function addUserToList(address, userDetails, role, usersList) {
    // Create user card
    const userCard = document.createElement('div');
    userCard.className = 'bg-white shadow rounded-lg overflow-hidden';
    
    // Get role icon and color
    let roleIcon, roleColor, roleText;
    switch (role) {
        case 'lawyer':
            roleIcon = 'ri-scales-3-line';
            roleColor = 'bg-blue-100 text-primary';
            roleText = 'Lawyer';
            break;
        case 'judge':
            roleIcon = 'ri-government-line';
            roleColor = 'bg-purple-100 text-purple-600';
            roleText = 'Judge';
            break;
        case 'client':
            roleIcon = 'ri-user-3-line';
            roleColor = 'bg-green-100 text-green-600';
            roleText = 'Client';
            break;
    }
    
    // Format address
    const formattedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    
    // Create user card HTML
    userCard.innerHTML = `
        <div class="p-5">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 rounded-full ${roleColor} flex items-center justify-center mr-3">
                    <div class="w-5 h-5 flex items-center justify-center">
                        <i class="${roleIcon}"></i>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${userDetails.name}</h3>
                    <p class="text-sm text-gray-500">${roleText}</p>
                </div>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-mail-line"></i>
                    </div>
                    <span class="text-gray-600">${userDetails.email}</span>
                </div>
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-wallet-3-line"></i>
                    </div>
                    <span class="text-gray-600">${formattedAddress}</span>
                </div>
                ${role !== 'client' ? `
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-fingerprint-line"></i>
                    </div>
                    <span class="text-gray-600">${userDetails.id}</span>
                </div>
                ` : ''}
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-calendar-line"></i>
                    </div>
                    <span class="text-gray-600">Registered: ${new Date(userDetails.registrationDate * 1000).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="mt-4 flex justify-between">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${userDetails.isActive ? 'Active' : 'Inactive'}
                </span>
                <button class="text-red-600 hover:text-red-800 text-sm font-medium toggle-user-status-btn" data-address="${address}" data-active="${userDetails.isActive}">
                    ${userDetails.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `;
    
    // Add event listener for toggle status button
    const toggleBtn = userCard.querySelector('.toggle-user-status-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            toggleUserStatus(address, this.dataset.active === 'false');
        });
    }
    
    // Add to list
    usersList.appendChild(userCard);
}

// Load pending approvals
async function loadPendingApprovals(pendingUsers) {
    try {
        // Import the blockchain service
        const { getUserDetails, approveUser, rejectUser } = await import('./blockchain-service.js');
        
        const pendingApprovalsList = document.querySelector('.pending-approvals-list');
        if (!pendingApprovalsList) return;
        
        // Clear existing approvals
        pendingApprovalsList.innerHTML = '';
        
        // Check if there are any pending approvals
        if (pendingUsers.length === 0) {
            pendingApprovalsList.innerHTML = `
                <div class="bg-gray-50 p-6 text-center">
                    <div class="w-16 h-16 mx-auto flex items-center justify-center text-gray-400 mb-4">
                        <i class="ri-checkbox-circle-line ri-2x"></i>
                    </div>
                    <p class="text-gray-600">No pending approvals</p>
                </div>
            `;
            return;
        }
        
        // Process each pending user
        for (const userAddress of pendingUsers) {
            // Get user details
            const result = await getUserDetails(userAddress);
            
            if (!result.success) {
                console.error(`Error getting details for user ${userAddress}:`, result.error);
                continue;
            }
            
            const userDetails = result.userDetails;
            
            // Add pending approval to list
            addPendingApprovalToList(userAddress, userDetails, pendingApprovalsList, approveUser, rejectUser);
        }
    } catch (error) {
        console.error("Error loading pending approvals:", error);
    }
}

// Add pending approval to list
function addPendingApprovalToList(address, userDetails, pendingApprovalsList, approveUser, rejectUser) {
    // Create approval card
    const approvalCard = document.createElement('div');
    approvalCard.className = 'bg-white shadow rounded-lg overflow-hidden mb-4';
    
    // Get role icon and color
    let roleIcon, roleColor, roleText;
    switch (userDetails.role) {
        case 'lawyer':
            roleIcon = 'ri-scales-3-line';
            roleColor = 'bg-blue-100 text-primary';
            roleText = 'Lawyer';
            break;
        case 'judge':
            roleIcon = 'ri-government-line';
            roleColor = 'bg-purple-100 text-purple-600';
            roleText = 'Judge';
            break;
        case 'client':
            roleIcon = 'ri-user-3-line';
            roleColor = 'bg-green-100 text-green-600';
            roleText = 'Client';
            break;
    }
    
    // Format address
    const formattedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    
    // Format date
    const registrationDate = new Date(userDetails.registrationDate * 1000);
    const formattedDate = registrationDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create approval card HTML
    approvalCard.innerHTML = `
        <div class="p-5">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 rounded-full ${roleColor} flex items-center justify-center mr-3">
                    <div class="w-5 h-5 flex items-center justify-center">
                        <i class="${roleIcon}"></i>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${userDetails.name}</h3>
                    <div class="flex items-center">
                        <span class="text-sm text-gray-500 mr-2">${roleText}</span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Approval
                        </span>
                    </div>
                </div>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-mail-line"></i>
                    </div>
                    <span class="text-gray-600">${userDetails.email}</span>
                </div>
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-wallet-3-line"></i>
                    </div>
                    <span class="text-gray-600">${formattedAddress}</span>
                </div>
                ${userDetails.role !== 'client' ? `
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-fingerprint-line"></i>
                    </div>
                    <span class="text-gray-600">${userDetails.id}</span>
                </div>
                ` : ''}
                <div class="flex items-center">
                    <div class="w-5 h-5 flex items-center justify-center text-gray-400 mr-2">
                        <i class="ri-calendar-line"></i>
                    </div>
                    <span class="text-gray-600">Requested: ${formattedDate}</span>
                </div>
            </div>
            <div class="mt-4 flex space-x-3">
                <button class="flex-1 bg-primary text-white py-2 px-4 !rounded-button hover:bg-primary/90 transition-colors whitespace-nowrap approve-user-btn" data-address="${address}">
                    Approve
                </button>
                <button class="flex-1 bg-red-600 text-white py-2 px-4 !rounded-button hover:bg-red-700 transition-colors whitespace-nowrap reject-user-btn" data-address="${address}">
                    Reject
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners for approve and reject buttons
    const approveBtn = approvalCard.querySelector('.approve-user-btn');
    const rejectBtn = approvalCard.querySelector('.reject-user-btn');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', async function() {
            await handleApproveUser(address, approveUser);
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', async function() {
            await handleRejectUser(address, rejectUser);
        });
    }
    
    // Add to list
    pendingApprovalsList.appendChild(approvalCard);
}

// Handle approve user
async function handleApproveUser(address, approveUser) {
    try {
        // Show loading state
        const approveBtn = document.querySelector(`.approve-user-btn[data-address="${address}"]`);
        const originalButtonText = approveBtn.innerHTML;
        approveBtn.innerHTML = 'Approving...';
        approveBtn.disabled = true;
        
        // Approve user
        const result = await approveUser(address);
        
        // Reset button state
        approveBtn.innerHTML = originalButtonText;
        approveBtn.disabled = false;
        
        if (result.success) {
            alert('User approved successfully');
            
            // Add transaction to log
            const transaction = {
                hash: result.transactionHash,
                blockNumber: 0, // This will be updated when the transaction is mined
                timestamp: Math.floor(Date.now() / 1000),
                from: currentAccount,
                to: CONTRACT_ADDRESSES.UserRegistry,
                value: '0',
                gasUsed: 0, // This will be updated when the transaction is mined
                status: 'Pending', // This will be updated when the transaction is mined
                contractName: 'UserRegistry',
                eventName: 'UserApproved',
                functionName: 'approveUser',
                userRole: 'admin',
                metadata: {
                    userAddress: address
                }
            };
            
            // Add to transaction log
            transactionLog.push(transaction);
            
            // Save transaction log
            saveTransactionLog();
            
            // Update UI if transaction tab is active
            updateTransactionTable();
            
            // Reload dashboard data
            await loadDashboardData();
        } else {
            alert(`Error approving user: ${result.error}`);
        }
    } catch (error) {
        console.error("Error approving user:", error);
        alert("Error approving user: " + error.message);
    }
}

// Handle reject user
async function handleRejectUser(address, rejectUser) {
    try {
        // Show loading state
        const rejectBtn = document.querySelector(`.reject-user-btn[data-address="${address}"]`);
        const originalButtonText = rejectBtn.innerHTML;
        rejectBtn.innerHTML = 'Rejecting...';
        rejectBtn.disabled = true;
        
        // Reject user
        const result = await rejectUser(address);
        
        // Reset button state
        rejectBtn.innerHTML = originalButtonText;
        rejectBtn.disabled = false;
        
        if (result.success) {
            alert('User rejected successfully');
            
            // Add transaction to log
            const transaction = {
                hash: result.transactionHash,
                blockNumber: 0, // This will be updated when the transaction is mined
                timestamp: Math.floor(Date.now() / 1000),
                from: currentAccount,
                to: CONTRACT_ADDRESSES.UserRegistry,
                value: '0',
                gasUsed: 0, // This will be updated when the transaction is mined
                status: 'Pending', // This will be updated when the transaction is mined
                contractName: 'UserRegistry',
                eventName: 'UserRejected',
                functionName: 'rejectUser',
                userRole: 'admin',
                metadata: {
                    userAddress: address
                }
            };
            
            // Add to transaction log
            transactionLog.push(transaction);
            
            // Save transaction log
            saveTransactionLog();
            
            // Update UI if transaction tab is active
            updateTransactionTable();
            
            // Reload dashboard data
            await loadDashboardData();
        } else {
            alert(`Error rejecting user: ${result.error}`);
        }
    } catch (error) {
        console.error("Error rejecting user:", error);
        alert("Error rejecting user: " + error.message);
    }
}

// Toggle user status
async function toggleUserStatus(address, isActive) {
    try {
        // This functionality would need to be added to the UserRegistry contract
        // For now, we'll just show a toast message
        alert(`User status ${isActive ? 'activated' : 'deactivated'}`);
        
        // Add transaction to log
        const transaction = {
            hash: web3.utils.sha3(Date.now().toString()), // Generate a fake hash for demo
            blockNumber: 0,
            timestamp: Math.floor(Date.now() / 1000),
            from: currentAccount,
            to: CONTRACT_ADDRESSES.UserRegistry,
            value: '0',
            gasUsed: 0,
            status: 'Confirmed',
            contractName: 'UserRegistry',
            eventName: isActive ? 'UserActivated' : 'UserDeactivated',
            functionName: isActive ? 'activateUser' : 'deactivateUser',
            userRole: 'admin',
            metadata: {
                userAddress: address,
                isActive: isActive
            }
        };
        
        // Add to transaction log
        transactionLog.push(transaction);
        
        // Save transaction log
        saveTransactionLog();
        
        // Update UI if transaction tab is active
        updateTransactionTable();
        
        // Reload dashboard data
        await loadDashboardData();
    } catch (error) {
        console.error("Error toggling user status:", error);
        alert("Error toggling user status: " + error.message);
    }
}

// Handle file uploads to Filebase/IPFS
async function uploadFile(file) {
    try {
        // Import the filebase service
        const { uploadToFilebase } = await import('./filebase-service.js');
        
        // Import the blockchain service
        const { uploadDocument } = await import('./blockchain-service.js');
        
        // Upload file to Filebase
        const filebaseResult = await uploadToFilebase(file);
        
        if (!filebaseResult.success) {
            throw new Error(filebaseResult.error);
        }
        
        // Upload document to blockchain
        const documentType = file.type.split('/')[0]; // e.g., 'image', 'application'
        const description = `Uploaded by admin: ${file.name}`;
        
        const blockchainResult = await uploadDocument(filebaseResult.cid, documentType, description);
        
        if (!blockchainResult.success) {
            throw new Error(blockchainResult.error);
        }
        
        // Log the transaction to our transaction tracking system
        const transaction = {
            hash: blockchainResult.transactionHash,
            blockNumber: 0, // This will be updated when the transaction is mined
            timestamp: Math.floor(Date.now() / 1000),
            from: currentAccount,
            to: CONTRACT_ADDRESSES.DocumentStorage,
            value: '0',
            gasUsed: 0, // This will be updated when the transaction is mined
            status: 'Pending', // This will be updated when the transaction is mined
            contractName: 'DocumentStorage',
            eventName: 'DocumentUploaded',
            functionName: 'uploadDocument',
            userRole: 'admin',
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                cid: filebaseResult.cid,
                documentId: blockchainResult.documentId
            }
        };
        
        // Add to transaction log
        transactionLog.push(transaction);
        
        // Save transaction log
        saveTransactionLog();
        
        // Update UI if transaction tab is active
        updateTransactionTable();
        
        return {
            success: true,
            cid: filebaseResult.cid,
            url: filebaseResult.url,
            documentId: blockchainResult.documentId,
            transactionHash: blockchainResult.transactionHash
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Initialize transaction tracking
function initTransactionTracking() {
    // Load transaction log from local storage
    loadTransactionLog();
    
    // Set up event listeners for transaction tracking UI
    setupTransactionTrackingListeners();
}

// Set up transaction event listeners
function setupTransactionEventListeners() {
    // Listen for transaction events from UserRegistry contract
    userRegistryContract.events.allEvents({
        fromBlock: 'latest'
    })
    .on('data', event => {
        captureTransaction(event, 'UserRegistry');
    })
    .on('error', error => {
        console.error("Error in UserRegistry events:", error);
    });
    
    // Listen for transaction events from DocumentStorage contract
    documentStorageContract.events.allEvents({
        fromBlock: 'latest'
    })
    .on('data', event => {
        captureTransaction(event, 'DocumentStorage');
    })
    .on('error', error => {
        console.error("Error in DocumentStorage events:", error);
    });
    
    // Listen for transaction events from CaseManager contract
    caseManagerContract.events.allEvents({
        fromBlock: 'latest'
    })
    .on('data', event => {
        captureTransaction(event, 'CaseManager');
    })
    .on('error', error => {
        console.error("Error in CaseManager events:", error);
    });
}

// Set up transaction tracking UI listeners
function setupTransactionTrackingListeners() {
    // Download transactions button
    const downloadBtn = document.getElementById('download-transactions-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTransactionLog);
    }
    
    // Refresh transactions button
    const refreshBtn = document.getElementById('refresh-transactions-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', updateTransactionTable);
    }
    
    // Transaction filter
    const transactionFilter = document.getElementById('transaction-filter');
    if (transactionFilter) {
        transactionFilter.addEventListener('change', () => {
            document.getElementById('current-page').textContent = '1';
            updateTransactionTable();
        });
    }
    
    // Date filters
    const dateFromFilter = document.getElementById('transaction-date-from');
    const dateToFilter = document.getElementById('transaction-date-to');
    if (dateFromFilter && dateToFilter) {
        dateFromFilter.addEventListener('change', () => {
            document.getElementById('current-page').textContent = '1';
            updateTransactionTable();
        });
        dateToFilter.addEventListener('change', () => {
            document.getElementById('current-page').textContent = '1';
            updateTransactionTable();
        });
    }
    
    // Search filter
    const searchFilter = document.getElementById('transaction-search');
    if (searchFilter) {
        searchFilter.addEventListener('input', () => {
            document.getElementById('current-page').textContent = '1';
            updateTransactionTable();
        });
    }
    
    // Pagination buttons
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            const currentPage = parseInt(document.getElementById('current-page').textContent);
            if (currentPage > 1) {
                document.getElementById('current-page').textContent = (currentPage - 1).toString();
                updateTransactionTable();
            }
        });
        nextPageBtn.addEventListener('click', () => {
            const currentPage = parseInt(document.getElementById('current-page').textContent);
            const totalPages = parseInt(document.getElementById('total-pages').textContent);
            if (currentPage < totalPages) {
                document.getElementById('current-page').textContent = (currentPage + 1).toString();
                updateTransactionTable();
            }
        });
    }
}

// Capture transaction and add to log
async function captureTransaction(event, contractName) {
    try {
        // Get transaction details
        const tx = await web3.eth.getTransaction(event.transactionHash);
        const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
        
        // Get user role
        let userRole = 'Unknown';
        try {
            if (tx.from.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
                userRole = 'admin';
            } else {
                userRole = await userRegistryContract.methods.getUserRole(tx.from).call();
            }
        } catch (error) {
            console.error("Error getting user role:", error);
        }
        
        // Get function name
        let functionName = 'Unknown Function';
        if (tx.input && tx.input.length >= 10) {
            const methodId = tx.input.substring(0, 10);
            // Try to match method ID with known functions
            functionName = getFunctionNameFromMethodId(methodId, contractName);
        }
        
        // Create transaction record
        const transaction = {
            hash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: Math.floor(Date.now() / 1000), // Current timestamp
            from: tx.from,
            to: tx.to,
            value: web3.utils.fromWei(tx.value, 'ether'),
            gasUsed: receipt.gasUsed,
            status: receipt.status ? 'Confirmed' : 'Failed',
            contractName: contractName,
            eventName: event.event,
            functionName: functionName,
            userRole: userRole
        };
        
        // Add to transaction log
        transactionLog.push(transaction);
        
        // Save transaction log
        saveTransactionLog();
        
        // Update UI
        updateTransactionTable();
    } catch (error) {
        console.error("Error capturing transaction:", error);
    }
}

// Get function name from method ID
function getFunctionNameFromMethodId(methodId, contractName) {
    // This is a simplified approach - in a production environment, you'd use a more robust method
    // You would need to build a mapping of method IDs to function names
    const functionMap = {
        // UserRegistry functions
        '0x1a695230': 'registerUser',
        '0x095ea7b3': 'approve',
        '0x42842e0e': 'safeTransferFrom',
        '0x8da5cb5b': 'owner',
        '0x24d7806c': 'approveUser',
        '0x6c9789b0': 'rejectUser',
        
        // DocumentStorage functions
        '0x6f8b44b0': 'uploadDocument',
        '0x3d238ad3': 'verifyDocument',
        '0x2c8e8dca': 'getDocument',
        
        // CaseManager functions
        '0x4f0cd691': 'createCase',
        '0x7acb7757': 'assignJudge',
        '0x5c40f6f4': 'scheduleHearing',
        '0x8456cb59': 'pause',
        '0x3f4ba83a': 'unpause'
    };
    
    return functionMap[methodId] || `${contractName} Function`;
}

// Load transaction log from local storage
function loadTransactionLog() {
    try {
        const savedLog = localStorage.getItem(TRANSACTION_LOG_KEY);
        if (savedLog) {
            transactionLog = JSON.parse(savedLog);
            updateTransactionTable();
        }
    } catch (error) {
        console.error("Error loading transaction log:", error);
    }
}

// Save transaction log to local storage
function saveTransactionLog() {
    try {
        localStorage.setItem(TRANSACTION_LOG_KEY, JSON.stringify(transactionLog));
    } catch (error) {
        console.error("Error saving transaction log:", error);
    }
}

// Download transaction log as JSON file
function downloadTransactionLog() {
    try {
        const dataStr = JSON.stringify(transactionLog, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'transaction_log.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } catch (error) {
        console.error("Error downloading transaction log:", error);
        alert("Error downloading transaction log: " + error.message);
    }
}

// Update transaction table with filtered data
function updateTransactionTable() {
    const tableBody = document.getElementById('transaction-table-body');
    if (!tableBody) return;
    
    // Get filter values
    const roleFilter = document.getElementById('transaction-filter')?.value || 'all';
    const dateFromFilter = document.getElementById('transaction-date-from')?.value || '';
    const dateToFilter = document.getElementById('transaction-date-to')?.value || '';
    const searchFilter = document.getElementById('transaction-search')?.value?.toLowerCase() || '';
    
    // Apply filters
    let filteredTransactions = [...transactionLog];
    
    // Filter by role
    if (roleFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.userRole.toLowerCase() === roleFilter);
    }
    
    // Filter by date range
    if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter).getTime() / 1000;
        filteredTransactions = filteredTransactions.filter(tx => tx.timestamp >= fromDate);
    }
    
    if (dateToFilter) {
        const toDate = new Date(dateToFilter).getTime() / 1000 + 86400; // Add one day to include the end date
        filteredTransactions = filteredTransactions.filter(tx => tx.timestamp <= toDate);
    }
    
    // Filter by search term
    if (searchFilter) {
        filteredTransactions = filteredTransactions.filter(tx => 
            tx.hash.toLowerCase().includes(searchFilter) ||
            tx.from.toLowerCase().includes(searchFilter) ||
            tx.functionName.toLowerCase().includes(searchFilter)
        );
    }
    
    // Sort by timestamp (newest first)
    filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Pagination
    const itemsPerPage = 10;
    const currentPage = parseInt(document.getElementById('current-page')?.textContent || '1');
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
    
    if (document.getElementById('total-pages')) {
        document.getElementById('total-pages').textContent = totalPages.toString();
    }
    
    if (document.getElementById('transaction-count')) {
        document.getElementById('transaction-count').textContent = filteredTransactions.length.toString();
    }
    
    // Get current page data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredTransactions.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add rows
    if (currentPageData.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                No transactions found
            </td>
        `;
        tableBody.appendChild(tr);
    } else {
        currentPageData.forEach(tx => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            
            // Format date
            const date = new Date(tx.timestamp * 1000);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Format address
            const formattedAddress = `${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`;
            
            // Status badge
            let statusBadge;
            switch (tx.status) {
                case 'Confirmed':
                    statusBadge = '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Confirmed</span>';
                    break;
                case 'Failed':
                    statusBadge = '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>';
                    break;
                default:
                    statusBadge = '<span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>';
            }
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <span class="text-sm text-gray-900 font-medium">${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${formattedDate}</div>
                    <div class="text-sm text-gray-500">${formattedTime}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${formattedAddress}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${tx.userRole}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${tx.functionName}</div>
                    <div class="text-sm text-gray-500">${tx.contractName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="${SEPOLIA_ETHERSCAN_URL}${tx.hash}" target="_blank" class="text-primary hover:text-primary/80">
                        <div class="w-5 h-5 flex items-center justify-center">
                            <i class="ri-external-link-line"></i>
                        </div>
                    </a>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
}

// Set up form listeners
function setupFormListeners() {
    // Add lawyer form
    const addLawyerForm = document.querySelector('.add-lawyer-form');
    if (addLawyerForm) {
        addLawyerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            await handleUserRegistration(this, 'lawyer');
        });
    }
    
    // Add judge form
    const addJudgeForm = document.querySelector('.add-judge-form');
    if (addJudgeForm) {
        addJudgeForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            await handleUserRegistration(this, 'judge');
        });
    }
    
    // Add client form
    const addClientForm = document.querySelector('.add-client-form');
    if (addClientForm) {
        addClientForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            await handleUserRegistration(this, 'client');
        });
    }
}

// Handle user registration
async function handleUserRegistration(form, role) {
    try {
        // Import the blockchain service
        const { registerUser } = await import('./blockchain-service.js');
        
        // Get form data
        const name = form.querySelector('input[placeholder="Enter full name"]').value;
        const email = form.querySelector('input[placeholder="email@example.com"]').value;
        const walletAddress = form.querySelector('input[placeholder="0x..."]').value;
        
        // Validate inputs
        if (!name || !email || !walletAddress) {
            alert("Please fill in all required fields.");
            return;
        }
        
        // Validate wallet address
        if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
            alert("Please enter a valid wallet address.");
            return;
        }
        
        let id = '';
        
        // Get ID based on role
        if (role === 'lawyer') {
            id = form.querySelector('input[placeholder="BAR12345678"]').value;
            if (!id) {
                alert("Please enter a Bar ID.");
                return;
            }
        } else if (role === 'judge') {
            id = form.querySelector('input[placeholder="JUD12345678"]').value;
            if (!id) {
                alert("Please enter a Judicial ID.");
                return;
            }
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = 'Registering...';
        submitButton.disabled = true;
        
        // Register the user
        const result = await registerUser(name, email, id, role, walletAddress);
        
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        if (result.success) {
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully.`);
            
            // Add transaction to log
            const transaction = {
                hash: result.transactionHash,
                blockNumber: 0, // This will be updated when the transaction is mined
                timestamp: Math.floor(Date.now() / 1000),
                from: currentAccount,
                to: CONTRACT_ADDRESSES.UserRegistry,
                value: '0',
                gasUsed: 0, // This will be updated when the transaction is mined
                status: 'Pending', // This will be updated when the transaction is mined
                contractName: 'UserRegistry',
                eventName: 'UserRegistered',
                functionName: 'registerUser',
                userRole: 'admin',
                metadata: {
                    name: name,
                    email: email,
                    role: role,
                    walletAddress: walletAddress
                }
            };
            
            // Add to transaction log
            transactionLog.push(transaction);
            
            // Save transaction log
            saveTransactionLog();
            
            // Update UI if transaction tab is active
            updateTransactionTable();
            
            // Reset the form
            form.reset();
            
            // Reload dashboard data
            await loadDashboardData();
        } else {
            alert(`Error registering ${role}: ${result.error}`);
        }
    } catch (error) {
        console.error(`Error registering ${role}:`, error);
        alert(`Error registering ${role}: ${error.message}`);
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Export functions for use in the HTML file
export {
    initDashboard,
    handleUserRegistration,
    handleApproveUser,
    handleRejectUser,
    toggleUserStatus,
    uploadFile,
    downloadTransactionLog,
    updateTransactionTable
};