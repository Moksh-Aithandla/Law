# E-Vault Law Management System

A blockchain-based law management system for managing legal cases, documents, and user roles (judges, lawyers, clients).

## Quick Start Guide

### For Windows Users

Simply double-click the `run-app.bat` file or run it from the command line:

```
run-app.bat
```

This will:
1. Start the server
2. Open your browser to http://localhost:3000

Alternatively, you can run the server manually:

```
node simple-server.js
```

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

1. **Frontend**:
   - Professional law-themed interface
   - Role-specific dashboards for judges, lawyers, and clients
   - Document viewing capabilities
   - MetaMask integration for blockchain authentication

2. **Backend Server**:
   - Express.js server for serving the frontend
   - API endpoints for data retrieval
   - JSON-based data storage for demonstration purposes

## Detailed Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm
- MetaMask browser extension

### Manual Installation

1. Clone the repository
2. Navigate to the project directory
3. Start the server:

```bash
node simple-server.js
```

4. Open your browser and navigate to http://localhost:3000

### MetaMask Integration

To use the MetaMask integration:

1. Install the MetaMask extension in your browser
2. Create or import a wallet
3. Connect to the application by clicking the "Connect with MetaMask" button
4. Approve the connection request in the MetaMask popup

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

2. **Frontend not loading**:
   - Check that the server is running (look for "Server running at http://localhost:3000")
   - Verify that the frontend directory and its subdirectories exist
   - Check browser console for any JavaScript errors

3. **Login problems**:
   - Use the pre-populated user credentials listed above
   - Make sure you're using the correct email and ID

4. **MetaMask issues**:
   - Ensure MetaMask is installed in your browser
   - Make sure you're connected to the correct network
   - Check that your MetaMask wallet is unlocked
   - If the connection button doesn't work, try refreshing the page

5. **Dashboard not showing data**:
   - Check that you're logged in with the correct credentials
   - Verify that the API endpoints are working correctly
   - Try logging out and logging back in

## License

[MIT License](LICENSE)