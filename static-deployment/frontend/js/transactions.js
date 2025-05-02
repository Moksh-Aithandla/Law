// Blockchain Transactions Module for E-Vault Law Management System
import { getNetworkInfo, getCurrentAccount } from './blockchain-utils.js';

// Sample transaction data (replace with actual blockchain transactions)
const sampleTransactions = [
  {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'User Registration',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    icon: 'fa-user-plus'
  },
  {
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    type: 'Case Registration',
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
    icon: 'fa-gavel'
  },
  {
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    type: 'Document Upload',
    timestamp: Date.now() - 3600000 * 8, // 8 hours ago
    icon: 'fa-file-upload'
  },
  {
    hash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    type: 'Case Status Update',
    timestamp: Date.now() - 86400000, // 1 day ago
    icon: 'fa-sync-alt'
  },
  {
    hash: '0x5432109876fedcba5432109876fedcba5432109876fedcba5432109876fedcba',
    type: 'Hearing Scheduled',
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    icon: 'fa-calendar-alt'
  }
];

// Format timestamp to readable date
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Format transaction hash for display
function formatHash(hash) {
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}

// Get Etherscan URL for transaction
function getEtherscanUrl(hash) {
  const networkInfo = getNetworkInfo();
  return `${networkInfo.explorer}/tx/${hash}`;
}

// Load recent transactions
async function loadRecentTransactions(elementId) {
  const transactionFeed = document.getElementById(elementId);
  if (!transactionFeed) return;

  try {
    // In a real application, you would fetch actual transactions from the blockchain
    // For now, we'll use sample data
    const transactions = sampleTransactions;

    // Clear loading message
    transactionFeed.innerHTML = '';

    // Add transactions to feed
    transactions.forEach(tx => {
      const txElement = document.createElement('div');
      txElement.className = 'transaction-item';
      txElement.innerHTML = `
        <div class="transaction-icon">
          <i class="fas ${tx.icon}"></i>
        </div>
        <div class="transaction-details">
          <p class="transaction-type">${tx.type}</p>
          <p class="transaction-hash">${formatHash(tx.hash)}</p>
          <span class="transaction-time">${formatTimestamp(tx.timestamp)}</span>
        </div>
        <a href="${getEtherscanUrl(tx.hash)}" target="_blank" class="transaction-link">
          <i class="fas fa-external-link-alt"></i>
        </a>
      `;
      transactionFeed.appendChild(txElement);
    });
  } catch (error) {
    console.error('Error loading transactions:', error);
    transactionFeed.innerHTML = '<p class="error">Error loading transactions</p>';
  }
}

// Load transactions for the modal
function loadModalTransactions() {
  const transactionsBody = document.getElementById('transactions-body');
  if (!transactionsBody) return;
  
  try {
    // In a real application, you would fetch actual transactions from the blockchain
    // For now, we'll use sample data
    const transactions = sampleTransactions;
    
    // Clear existing rows
    transactionsBody.innerHTML = '';
    
    if (transactions.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'No transactions found';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      transactionsBody.appendChild(row);
      return;
    }
    
    // Add transactions to table
    transactions.forEach(tx => {
      const row = document.createElement('tr');
      
      // Transaction hash
      const hashCell = document.createElement('td');
      hashCell.textContent = formatHash(tx.hash);
      row.appendChild(hashCell);
      
      // Transaction type
      const typeCell = document.createElement('td');
      typeCell.textContent = tx.type;
      row.appendChild(typeCell);
      
      // Date
      const dateCell = document.createElement('td');
      dateCell.textContent = formatTimestamp(tx.timestamp);
      row.appendChild(dateCell);
      
      // Status
      const statusCell = document.createElement('td');
      statusCell.innerHTML = '<span class="status-badge status-confirmed">Confirmed</span>';
      row.appendChild(statusCell);
      
      // View button
      const viewCell = document.createElement('td');
      const viewButton = document.createElement('a');
      viewButton.href = getEtherscanUrl(tx.hash);
      viewButton.target = '_blank';
      viewButton.className = 'btn btn-small';
      viewButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
      viewCell.appendChild(viewButton);
      row.appendChild(viewCell);
      
      transactionsBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading transactions:', error);
    transactionsBody.innerHTML = '<tr><td colspan="5">Error loading transactions</td></tr>';
  }
}

// Initialize transactions module
function initTransactions() {
  // Load recent transactions on home page
  loadRecentTransactions('transaction-feed');
  
  // Set up event listener for transactions modal
  const viewTransactionsBtn = document.getElementById('view-transactions-btn');
  if (viewTransactionsBtn) {
    viewTransactionsBtn.addEventListener('click', () => {
      loadModalTransactions();
    });
  }
  
  // Set up periodic refresh (every 30 seconds)
  setInterval(() => {
    loadRecentTransactions('transaction-feed');
  }, 30000);
  
  // Add network info to the page
  const networkInfoElement = document.getElementById('network-info');
  if (networkInfoElement) {
    const networkInfo = getNetworkInfo();
    networkInfoElement.textContent = `Connected to ${networkInfo.name}`;
    networkInfoElement.title = `Chain ID: ${networkInfo.chainId}`;
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initTransactions);

export { initTransactions, loadRecentTransactions, loadModalTransactions };