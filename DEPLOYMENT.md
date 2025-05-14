# Deployment Instructions for E-Vault Law Management System

This document provides step-by-step instructions for deploying the E-Vault Law Management System.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MetaMask browser extension
- Sepolia testnet ETH (for deployment and testing)

## Backend Deployment

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables (or use the existing one):
   ```
   ALCHEMY_API_KEY=RuOilkGBfCJflqOLZND0WrLWvLFtooRA
   PRIVATE_KEY=06fe5cf665ced25f071ef6d237c21b1f36222605c2822135839aec503006b4f0
   ADMIN_ADDRESS=0x13591389EE06948758541b38547a37FB9483F2f4
   ```

4. Deploy contracts to Sepolia testnet:
   ```
   npx hardhat run scripts/deploy-admin-only.js --network sepolia
   ```

5. After deployment, note the contract addresses in the console output and in the `deployed-addresses.json` file.

## Filebase Proxy Setup

1. Navigate to the filebase-proxy directory:
   ```
   cd filebase-proxy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables (or use the existing one):
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

## Frontend Setup

1. After deploying the contracts, the frontend configuration will be automatically updated with the contract addresses.

2. Serve the frontend files using a web server. For development, you can use a simple HTTP server:
   ```
   cd frontend
   npx http-server
   ```

3. Open the application in your browser and connect with MetaMask.

## Initial Admin Setup

1. The deployer address will automatically be set as the admin.

2. Log in with the admin account by connecting MetaMask with the deployer address.

3. Navigate to the "Register Users" page to add new users.

4. For each user, you'll need:
   - Their Ethereum wallet address
   - Full name
   - Email address
   - Role (client, lawyer, or judge)
   - ID (Bar ID for lawyers, Judicial ID for judges)

5. After registering users, they can log in with their MetaMask wallets.

## Security Considerations

- The private key in the `.env` file should be kept secure and not shared.
- For production, use a more secure method for managing private keys.
- The admin address has full control over the system, so keep it secure.

## Troubleshooting

- If you encounter issues with MetaMask, make sure you're connected to the Sepolia testnet.
- If transactions fail, make sure you have enough Sepolia ETH in your account.
- If the Filebase proxy server fails to start, check that the API key and secret key are correct.

## Maintenance

- Monitor the contracts on Sepolia Etherscan.
- Regularly back up the contract addresses and ABIs.
- Keep track of registered users and their roles.