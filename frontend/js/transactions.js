// Transactions display for E-Vault Law Management System
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const transactionsSection = document.getElementById('transactions-section');
  const transactionsTable = document.getElementById('transactions-table');
  const transactionsBody = document.getElementById('transactions-body');
  const backToHomeBtn = document.getElementById('back-to-home-from-transactions');
  const viewTransactionsBtn = document.getElementById('view-transactions-btn');
  const homeSection = document.getElementById('home-section');
  
  // Helper function to show a specific section
  function showSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('main > section');
    sections.forEach(s => {
      s.style.display = 'none';
    });
    
    // Show the requested section
    if (section) {
      section.style.display = 'block';
    }
  }
  
  // View transactions button
  if (viewTransactionsBtn) {
    viewTransactionsBtn.addEventListener('click', () => {
      loadTransactions();
      showSection(transactionsSection);
    });
  }
  
  // Back to home button
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', () => {
      showSection(homeSection);
    });
  }
  
  // Function to load transactions
  function loadTransactions() {
    if (!transactionsBody) return;
    
    // Clear existing rows
    transactionsBody.innerHTML = '';
    
    // Get transactions from localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
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
    
    // Sort transactions by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Add transactions to table
    transactions.forEach(tx => {
      const row = document.createElement('tr');
      
      // Transaction type
      const typeCell = document.createElement('td');
      typeCell.textContent = tx.type;
      row.appendChild(typeCell);
      
      // Details
      const detailsCell = document.createElement('td');
      detailsCell.textContent = tx.details;
      row.appendChild(detailsCell);
      
      // Block number
      const blockCell = document.createElement('td');
      blockCell.textContent = tx.blockNumber || 'Pending';
      row.appendChild(blockCell);
      
      // Date
      const dateCell = document.createElement('td');
      dateCell.textContent = new Date(tx.timestamp).toLocaleString();
      row.appendChild(dateCell);
      
      // Actions
      const actionsCell = document.createElement('td');
      const viewButton = document.createElement('a');
      viewButton.href = `${networkInfo.explorer}/tx/${tx.hash}`;
      viewButton.target = '_blank';
      viewButton.className = 'btn btn-small';
      viewButton.textContent = 'View on Etherscan';
      actionsCell.appendChild(viewButton);
      row.appendChild(actionsCell);
      
      transactionsBody.appendChild(row);
    });
  }
  
  // Add network info to the page
  const networkInfoElement = document.getElementById('network-info');
  if (networkInfoElement && window.networkInfo) {
    networkInfoElement.textContent = `Connected to ${window.networkInfo.name} (Chain ID: ${window.networkInfo.chainId})`;
  }
});