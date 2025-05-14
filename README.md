is # E-Vault Law Management System

A blockchain-based law firm management system built on Ethereum's Sepolia testnet, using Alchemy, MetaMask, and Filebase for IPFS document storage.

## Project Overview

The E-Vault Law Management System is a decentralized application (dApp) that enables:

- Admin-controlled user registration and role-based access control (Client, Lawyer, Judge, Admin)
- Case creation and management
- Document storage on IPFS via Filebase
- Transaction monitoring and verification through Alchemy
- Blockchain-based audit trail for all actions

## Key Features

- **Authentication via MetaMask**: Users authenticate using their MetaMask wallet
- **Admin-Only Registration**: Only admins can register new users, ensuring controlled access
- **Role-Based Access Control**: Different dashboards and permissions for clients, lawyers, judges, and admins
- **IPFS Document Storage**: All case documents are stored securely on IPFS via Filebase
- **Blockchain Transparency**: All actions are recorded on the blockchain for transparency and auditability
- **Etherscan Transaction Tracking**: Admin dashboard includes comprehensive transaction tracking with Etherscan integration

## Project Structure

- `/backend`: Smart contracts and deployment scripts
- `/frontend`: Web interface for interacting with the system
- `/filebase-proxy`: Proxy server for IPFS document storage via Filebase

## Technologies Used

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contracts**: Solidity
- **Development Framework**: Hardhat
- **Frontend**: HTML, CSS, JavaScript
- **Web3 Integration**: MetaMask, ethers.js
- **Document Storage**: IPFS via Filebase
- **Blockchain API**: Alchemy

## Setup Instructions

### Prerequisites

- Node.js and npm
- MetaMask browser extension
- Sepolia testnet ETH (for deployment and testing)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
   
   The file should contain:
   ```
   ALCHEMY_API_KEY=RuOilkGBfCJflqOLZND0WrLWvLFtooRA
   PRIVATE_KEY=06fe5cf665ced25f071ef6d237c21b1f36222605c2822135839aec503006b4f0
   ```

4. Deploy the AdminDashboard contract to Sepolia testnet:
   ```
   npm run deploy-admin-dashboard
   ```

### Filebase Proxy Setup

1. Navigate to the filebase-proxy directory:
   ```
   cd filebase-proxy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3001
   FILEBASE_API_KEY=8C7456690C30D12D749F
   FILEBASE_SECRET_KEY=TX2i0euuxWAA6hlyjIyOQUAbk72LL8G2L7pOwE3I
   FILEBASE_BUCKET=evault-law
   ```

4. Start the proxy server:
   ```
   node server.js
   ```

### Frontend Setup

1. After deploying the contracts, the frontend configuration will be automatically updated with the contract addresses.

2. Serve the frontend files using a web server. For development, you can use a simple HTTP server:
   ```
   cd frontend
   npx http-server
   ```

3. Open the application in your browser and connect with MetaMask.

## Smart Contracts

- **AdminDashboard.sol**: Main contract that handles user management, case management, and IPFS document storage
- **UserRegistry.sol**: Legacy contract for user registration and role-based access control
- **CaseIPFSManager.sol**: Legacy contract for case creation and IPFS document storage

## User Roles

- **Client**: Can create cases and view their own cases
- **Lawyer**: Can view and manage assigned cases, upload documents
- **Judge**: Can close cases and upload documents
- **Admin**: Can add/remove users, create cases for clients, assign lawyers/judges to cases, and manage all aspects of the system

## Etherscan Transaction Tracking Feature

The admin dashboard includes a comprehensive transaction tracking feature that integrates with Etherscan to provide real-time monitoring of all blockchain transactions.

### Transaction Tracking Features

- **Transaction Hash Storage**:
  - All blockchain transaction hashes are automatically captured and stored
  - Transaction data is stored locally in the browser's localStorage
  - Data can be exported as a JSON file using the "Download Transaction Log" button

- **Etherscan Integration**:
  - Direct links to Sepolia Etherscan for each transaction
  - Real-time transaction status monitoring (Pending, Confirmed, Failed)
  - Complete transaction details including gas usage and block confirmation

- **Admin-Only Access**:
  - Transaction tracking is only accessible from the admin dashboard
  - Authentication checks ensure only authorized users can access this feature
  - Secure export functionality for transaction logs

- **Transaction Filtering**:
  - Filter transactions by user role (Client, Lawyer, Judge, Admin)
  - Date range filtering to find transactions within specific time periods
  - Search functionality to locate specific transaction hashes

### Using the Transaction Tracking Feature

1. Log in to the admin dashboard using the admin account.
2. Navigate to the Transaction Tracking section.
3. View all transactions in the table.
4. Use the filters to narrow down transactions by role, date, or search term.
5. Click the Etherscan icon to view transaction details on Etherscan.
6. Use the "Download Transaction Log" button to export the transaction data.

## License

This project is licensed under the MIT License - see the LICENSE file for details.