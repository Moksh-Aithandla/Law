# E-Vault Law Management System

A blockchain-based law management system for managing legal cases, documents, and user roles (judges, lawyers, clients).

## Quick Start Guide

### For Windows Users

Simply double-click the `start-project.bat` file or run it from the command line:

```
start-project.bat
```

This will:
1. Check for dependencies and install them if needed
2. Start the Hardhat node (local blockchain)
3. Deploy the contracts with initial data (judges, lawyers, clients, and cases)
4. Start the frontend server
5. Open your browser to http://localhost:3000

To stop the application:
- Run the `stop-project.bat` file

### Login Credentials

You can use the following pre-populated users to log in:

**Judges:**
- Email: judge.smith@judiciary.gov
- ID: JID001
- Email: judge.patel@judiciary.gov
- ID: JID002

**Lawyers:**
- Email: john.doe@lawfirm.com
- ID: BAR001
- Email: jane.smith@lawfirm.com
- ID: BAR002
- Email: robert.johnson@lawfirm.com
- ID: BAR003

**Clients:**
- Email: client1@example.com (Alice Brown)
- Email: client2@example.com (Bob Wilson)
- (No ID required for clients)

## Features

- User registration and authentication for different roles (judges, lawyers, clients)
- MetaMask integration for secure blockchain transactions
- Case management with document storage
- Secure document handling with IPFS integration
- Dashboard views for different user roles
- Ability to add new cases, clients, lawyers, and judges
- Ethereum blockchain integration for immutable record-keeping
- Extensive pre-populated data for demonstration purposes (50 lawyers, 25 judges, 100 cases)

## System Architecture

The E-Vault system consists of:

1. **Smart Contracts** (Ethereum/Hardhat):
   - UserRegistry: Manages user registration and authentication
   - CaseManager: Handles case creation, updates, and assignments
   - IPFSManager: Manages document storage and retrieval

2. **Frontend**:
   - Simple web interface for interacting with the blockchain
   - Role-specific dashboards for judges, lawyers, and clients
   - Document upload and viewing capabilities

3. **Backend Server**:
   - Express.js server for serving the frontend
   - API endpoints for data retrieval

## Detailed Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm
- Hardhat for Ethereum development

### Manual Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

### Manual Startup

If you prefer to start the components manually:

1. Start a local Ethereum node:

```bash
npx hardhat node
```

2. In a new terminal, deploy the contracts with initial data:

```bash
npx hardhat run backend/scripts/deploy-with-data.js --network localhost
```

3. Start the frontend server:

```bash
node server.js
```

4. Open your browser and navigate to http://localhost:3000

## Pre-populated Data

The system comes pre-populated with an extensive dataset:

### Users
- 25 Judges (including Judge Smith and Judge Patel)
- 50 Lawyers (including John Doe, Jane Smith, and Robert Johnson)
- 30 Clients (including Alice Brown and Bob Wilson)

### Cases
- 100 Cases with various types, statuses, and documents
- Each case includes detailed information such as filing date, next hearing, court room, etc.
- Cases are assigned to different judges, lawyers, and clients

### Documents
- Each case includes multiple documents
- Documents are categorized by type (contracts, evidence, etc.)
- Document metadata includes upload date and uploader information

## Troubleshooting

If you encounter any issues:

1. **Server won't start**:
   - Make sure no other application is using port 3000
   - Check that Node.js is installed correctly
   - Try running `npm install` to ensure all dependencies are installed

2. **Blockchain issues**:
   - Ensure Hardhat node is running before deploying contracts
   - If deployment fails, try increasing the timeout in the batch file
   - Check the Hardhat console for any error messages

3. **Frontend not loading**:
   - Check that the server is running (look for "Server running at http://localhost:3000")
   - Verify that the frontend directory and its subdirectories exist
   - Check browser console for any JavaScript errors

4. **Login problems**:
   - Use the pre-populated user credentials listed above
   - Make sure the blockchain deployment was successful

5. **MetaMask issues**:
   - Ensure MetaMask is installed in your browser
   - Connect MetaMask to the Hardhat local network (http://localhost:8545)
   - Import one of the test accounts using the private keys from the Hardhat console
   - Make sure the account has enough ETH for transactions

6. **Adding new cases**:
   - You must be logged in as a lawyer to add new cases
   - All form fields must be filled out
   - The client and judge must exist in the system
   - Your MetaMask wallet must be connected and have sufficient ETH

## License

[MIT License](LICENSE)