# E-Vault Law Management System - Static Deployment

This is a static deployment of the E-Vault Law Management System configured for Sepolia Testnet.

## How to Run

1. Install Node.js if you haven't already (https://nodejs.org/)
2. Open a terminal in this directory
3. Run \
pm install\ to install dependencies
4. Run \
pm start\ to start the server
5. Open http://localhost:3000 in your browser

## MetaMask Configuration

To connect with MetaMask:

1. Install the MetaMask browser extension
2. Create or import a wallet
3. Connect to the appropriate network:

### For Sepolia:
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/
- Chain ID: 11155111
- Currency Symbol: ETH

### For Ganache:
- Network Name: Ganache
- RPC URL: http://localhost:8545
- Chain ID: 1337
- Currency Symbol: ETH

## Contract Addresses

- UserRegistry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- CaseManager: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
- IPFSManager: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
