const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Create necessary directories
const frontendDir = path.join(__dirname, 'frontend');
const dataDir = path.join(frontendDir, 'data');
const jsDir = path.join(frontendDir, 'js');
const cssDir = path.join(frontendDir, 'css');

// Ensure directories exist
[frontendDir, dataDir, jsDir, cssDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve static files
app.use(express.static(frontendDir));
app.use(express.json());

// Simple API endpoints
app.get('/api/users', (req, res) => {
  const usersPath = path.join(frontendDir, 'users.json');
  if (fs.existsSync(usersPath)) {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    res.json(users);
  } else {
    res.status(404).json({ error: 'Users data not found' });
  }
});

app.get('/api/cases', (req, res) => {
  const casesPath = path.join(dataDir, 'cases.json');
  if (fs.existsSync(casesPath)) {
    const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
    res.json(cases);
  } else {
    res.status(404).json({ error: 'Cases data not found' });
  }
});

// Create js directory and files if they don't exist
const web3Path = path.join(jsDir, 'web3.min.js');
if (!fs.existsSync(web3Path)) {
  const web3Content = `// Web3.js minified version - placeholder
// In a real application, you would include the actual web3.min.js file
// This is just a placeholder to simulate the presence of the file
console.log("Web3.js loaded");`;
  fs.writeFileSync(web3Path, web3Content);
  console.log(`Created web3.min.js at ${web3Path}`);
}

const metamaskPath = path.join(jsDir, 'metamask.js');
if (!fs.existsSync(metamaskPath)) {
  const metamaskContent = `// MetaMask Integration Script
console.log("MetaMask integration script loaded");

// Check if MetaMask is installed
async function checkMetaMaskInstalled() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
    return true;
  } else {
    console.log('MetaMask is not installed!');
    alert('MetaMask is not installed. Please install MetaMask to use this application.');
    return false;
  }
}

// Connect to MetaMask
async function connectMetaMask() {
  if (await checkMetaMaskInstalled()) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      currentAccount = accounts[0];
      isMetaMaskConnected = true;
      
      // Update wallet status
      updateWalletStatus();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return currentAccount;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
      return null;
    }
  }
  return null;
}

// Export functions
window.metamask = {
  connectMetaMask
};`;
  fs.writeFileSync(metamaskPath, metamaskContent);
  console.log(`Created metamask.js at ${metamaskPath}`);
}

// Create a simple index.html if it doesn't exist
const indexPath = path.join(frontendDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Vault Law Management System</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      color: #333;
      background-color: #f4f7f9;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background-color: #1e3a8a;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    nav ul {
      display: flex;
      list-style: none;
    }
    nav ul li {
      margin-left: 1.5rem;
    }
    nav ul li a {
      color: white;
      text-decoration: none;
    }
    .hero {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
      margin-bottom: 2rem;
    }
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .hero p {
      font-size: 1.2rem;
      max-width: 800px;
      margin: 0 auto 2rem;
    }
    .btn {
      display: inline-block;
      background-color: #fbbf24;
      color: #1e3a8a;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
      margin: 0 0.5rem;
      border: none;
      cursor: pointer;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .card h2 {
      color: #1e3a8a;
      margin-top: 0;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .dashboard {
      display: none;
      margin-top: 2rem;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table th, table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    table th {
      background-color: #f9fafb;
      font-weight: bold;
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-registered {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .status-in-progress {
      background-color: #fef3c7;
      color: #92400e;
    }
    .status-closed {
      background-color: #d1fae5;
      color: #065f46;
    }
    footer {
      background-color: #1e3a8a;
      color: white;
      text-align: center;
      padding: 1.5rem 0;
      margin-top: 2rem;
    }
    .login-form {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 5px;
      font-size: 1rem;
    }
    .error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <div class="logo">E-Vault</div>
      <ul>
        <li><a href="#" id="home-link">Home</a></li>
        <li><a href="#" id="login-link">Login</a></li>
        <li><a href="#" id="register-link">Register</a></li>
      </ul>
    </nav>
  </header>

  <main class="container">
    <!-- Home Section -->
    <section id="home-section">
      <div class="hero">
        <h1>E-Vault Law Management System</h1>
        <p>A blockchain-based platform for secure and transparent management of legal cases and documents.</p>
        <div>
          <button class="btn" id="login-btn">Login</button>
          <button class="btn" id="register-btn">Register</button>
        </div>
      </div>

      <div class="card">
        <h2>About E-Vault</h2>
        <p>E-Vault is a decentralized application built on blockchain technology that provides a secure platform for managing legal cases, documents, and user roles including judges, lawyers, and clients.</p>
      </div>

      <div class="card">
        <h2>Key Features</h2>
        <ul>
          <li>Secure document storage using IPFS</li>
          <li>Transparent case management</li>
          <li>Role-based access control</li>
          <li>Immutable record keeping</li>
          <li>Real-time updates and notifications</li>
        </ul>
      </div>

      <div class="card">
        <h2>Pre-populated Data</h2>
        <p>The system comes pre-populated with:</p>
        <ul>
          <li>2 Judges: Judge Smith and Judge Patel</li>
          <li>3 Lawyers: John Doe, Jane Smith, and Robert Johnson</li>
          <li>2 Clients: Alice Brown (ABC Corporation) and Bob Wilson (XYZ Enterprises)</li>
          <li>3 Cases with different statuses</li>
        </ul>
      </div>
    </section>

    <!-- Login Section -->
    <section id="login-section" style="display: none;">
      <div class="login-form">
        <h2>Login to E-Vault</h2>
        <div class="form-group">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" placeholder="Enter your email">
        </div>
        <div class="form-group">
          <label for="login-id">ID (Bar ID or Judicial ID)</label>
          <input type="text" id="login-id" placeholder="Enter your ID (leave empty if client)">
        </div>
        <div class="form-group">
          <button class="btn" id="login-submit">Login</button>
        </div>
        <p id="login-error" class="error"></p>
        <p>Don't have an account? <a href="#" id="to-register">Register here</a></p>
      </div>
    </section>

    <!-- Register Section -->
    <section id="register-section" style="display: none;">
      <div class="login-form">
        <h2>Register for E-Vault</h2>
        <div class="form-group">
          <label for="register-name">Full Name</label>
          <input type="text" id="register-name" placeholder="Enter your full name">
        </div>
        <div class="form-group">
          <label for="register-email">Email</label>
          <input type="email" id="register-email" placeholder="Enter your email">
        </div>
        <div class="form-group">
          <label for="register-role">Role</label>
          <select id="register-role">
            <option value="">-- Select Role --</option>
            <option value="client">Client</option>
            <option value="lawyer">Lawyer</option>
            <option value="judge">Judge</option>
          </select>
        </div>
        <div class="form-group" id="id-field" style="display: none;">
          <label for="register-id">ID (Bar ID or Judicial ID)</label>
          <input type="text" id="register-id" placeholder="Enter your ID">
        </div>
        <div class="form-group">
          <button class="btn" id="register-submit">Register</button>
        </div>
        <p id="register-error" class="error"></p>
        <p>Already have an account? <a href="#" id="to-login">Login here</a></p>
      </div>
    </section>

    <!-- Dashboard Section -->
    <section id="dashboard-section" style="display: none;">
      <div class="dashboard-header">
        <h2>Welcome, <span id="user-name">User</span></h2>
        <button class="btn" id="logout-btn">Logout</button>
      </div>

      <div class="card">
        <h2>Your Cases</h2>
        <table id="cases-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Next Hearing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="cases-body">
            <!-- Cases will be loaded here -->
          </tbody>
        </table>
      </div>

      <div class="card-grid">
        <div class="card">
          <h2>Recent Activity</h2>
          <ul id="activity-list">
            <li>Case #1 status updated to "In Progress"</li>
            <li>New document uploaded for Case #2</li>
            <li>Hearing scheduled for Case #3</li>
          </ul>
        </div>
        <div class="card">
          <h2>Upcoming Hearings</h2>
          <ul id="hearings-list">
            <li>May 15, 2023 - Case #1 - Room 302</li>
            <li>June 5, 2023 - Case #3 - Room 201</li>
          </ul>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; 2023 E-Vault Law Management System. All rights reserved.</p>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Navigation
      const homeSection = document.getElementById('home-section');
      const loginSection = document.getElementById('login-section');
      const registerSection = document.getElementById('register-section');
      const dashboardSection = document.getElementById('dashboard-section');

      // Navigation links
      document.getElementById('home-link').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(homeSection);
      });

      document.getElementById('login-link').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(loginSection);
      });

      document.getElementById('register-link').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(registerSection);
      });

      // Buttons
      document.getElementById('login-btn').addEventListener('click', function() {
        showSection(loginSection);
      });

      document.getElementById('register-btn').addEventListener('click', function() {
        showSection(registerSection);
      });

      document.getElementById('to-register').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(registerSection);
      });

      document.getElementById('to-login').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(loginSection);
      });

      document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('user');
        showSection(homeSection);
      });

      // Register role selection
      document.getElementById('register-role').addEventListener('change', function() {
        const idField = document.getElementById('id-field');
        const role = this.value;
        
        if (role === 'lawyer' || role === 'judge') {
          idField.style.display = 'block';
        } else {
          idField.style.display = 'none';
        }
      });

      // Login form submission
      document.getElementById('login-submit').addEventListener('click', function() {
        const email = document.getElementById('login-email').value.trim();
        const id = document.getElementById('login-id').value.trim();
        const errorElement = document.getElementById('login-error');
        
        if (!email) {
          errorElement.textContent = 'Email is required';
          return;
        }
        
        // For demo purposes, we'll use simple validation
        // In a real app, this would check against the blockchain
        fetch('/api/users')
          .then(response => response.json())
          .then(users => {
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (user) {
              // Store user in localStorage
              localStorage.setItem('user', JSON.stringify(user));
              
              // Update dashboard
              document.getElementById('user-name').textContent = user.name;
              
              // Load cases
              loadCases();
              
              // Show dashboard
              showSection(dashboardSection);
            } else {
              errorElement.textContent = 'User not found';
            }
          })
          .catch(error => {
            console.error('Error:', error);
            errorElement.textContent = 'Error logging in. Please try again.';
          });
      });

      // Register form submission
      document.getElementById('register-submit').addEventListener('click', function() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const role = document.getElementById('register-role').value;
        const id = document.getElementById('register-id').value.trim();
        const errorElement = document.getElementById('register-error');
        
        if (!name || !email || !role) {
          errorElement.textContent = 'Please fill in all required fields';
          return;
        }
        
        if ((role === 'lawyer' || role === 'judge') && !id) {
          errorElement.textContent = 'ID is required for lawyers and judges';
          return;
        }
        
        // For demo purposes, we'll just show success
        // In a real app, this would register the user on the blockchain
        alert('Registration successful! Please login with your credentials.');
        showSection(loginSection);
      });

      // Function to load cases
      function loadCases() {
        const casesBody = document.getElementById('cases-body');
        casesBody.innerHTML = '';
        
        fetch('/api/cases')
          .then(response => response.json())
          .then(cases => {
            cases.forEach(caseItem => {
              const row = document.createElement('tr');
              
              // Case ID
              const idCell = document.createElement('td');
              idCell.textContent = caseItem.id;
              row.appendChild(idCell);
              
              // Title
              const titleCell = document.createElement('td');
              titleCell.textContent = caseItem.title;
              row.appendChild(titleCell);
              
              // Status
              const statusCell = document.createElement('td');
              const statusSpan = document.createElement('span');
              statusSpan.textContent = caseItem.status;
              statusSpan.className = 'status status-' + caseItem.status.toLowerCase().replace(' ', '-');
              statusCell.appendChild(statusSpan);
              row.appendChild(statusCell);
              
              // Next Hearing
              const hearingCell = document.createElement('td');
              hearingCell.textContent = caseItem.nextHearing;
              row.appendChild(hearingCell);
              
              // Actions
              const actionsCell = document.createElement('td');
              const viewButton = document.createElement('button');
              viewButton.textContent = 'View';
              viewButton.className = 'btn';
              viewButton.style.padding = '0.25rem 0.5rem';
              viewButton.style.fontSize = '0.875rem';
              viewButton.addEventListener('click', function() {
                alert('Viewing case: ' + caseItem.title);
              });
              actionsCell.appendChild(viewButton);
              row.appendChild(actionsCell);
              
              casesBody.appendChild(row);
            });
          })
          .catch(error => {
            console.error('Error:', error);
            casesBody.innerHTML = '<tr><td colspan="5">Error loading cases</td></tr>';
          });
      }

      // Function to show a section and hide others
      function showSection(section) {
        homeSection.style.display = 'none';
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        dashboardSection.style.display = 'none';
        
        section.style.display = 'block';
      }

      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        document.getElementById('user-name').textContent = user.name;
        loadCases();
        showSection(dashboardSection);
      } else {
        showSection(homeSection);
      }
    });
  </script>
</body>
</html>
  `;
  fs.writeFileSync(indexPath, htmlContent);
  console.log(`Created new index.html at ${indexPath}`);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});