# Manual Setup Guide for E-Vault Law on Sepolia

If the deployment scripts are not working for you, follow these manual steps to set up the E-Vault Law Management System on Sepolia testnet.

## 1. Install Dependencies

Open a command prompt or PowerShell window and navigate to your project directory:

```
cd "c:\Users\Moksh Aithandla\evault\Law"
```

Install the required dependencies:

```
npm install
```

## 2. Configure Infura API Key

1. Sign up for a free account at [Infura](https://infura.io/) if you don't have one
2. Create a new project and get your API key
3. Open `frontend/config.js` in a text editor
4. Find the line with `YOUR_INFURA_API_KEY` and replace it with your Infura API key:

```javascript
// For Sepolia testnet
11155111: {
  name: 'Sepolia',
  explorer: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY'
}
```

## 3. Configure Filebase API Key (Optional)

If you want to use Filebase for IPFS storage:

1. Sign up for a [Filebase](https://filebase.com/) account
2. Get your API key from the dashboard
3. Open `frontend/config.js` in a text editor
4. Find the filebaseConfig section and replace `YOUR_FILEBASE_API_KEY` with your API key:

```javascript
// Filebase configuration
export const filebaseConfig = {
  apiUrl: 'https://api.filebase.io/v1/ipfs',
  ipfsGateway: 'https://ipfs.filebase.io/ipfs',
  apiKey: 'YOUR_FILEBASE_API_KEY'
};
```

5. Also update the server.js file with your Filebase API key:

```javascript
// Get Filebase API key from environment variable
const filebaseApiKey = process.env.FILEBASE_API_KEY || 'YOUR_FILEBASE_API_KEY';
```

## 4. Configure Admin Wallet Address (Optional)

If you want to use your own wallet as the admin:

1. Get your MetaMask wallet address
2. Open `frontend/config.js` in a text editor
3. Find the ADMIN_WALLET_ADDRESS line and replace it with your address:

```javascript
// Admin wallet address - update this with your MetaMask wallet address
export const ADMIN_WALLET_ADDRESS = "0x340b42850B5186c72CDf7eaC3250CCf8EFDecd75";
```

## 5. Create Environment File

Create a file named `.env` in the root directory with the following content:

```
FILEBASE_API_KEY=your_filebase_api_key_here
PORT=3000
NODE_ENV=production
```

## 6. Start the Server

Start the application server:

```
npm start
```

## 7. Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

## 8. MetaMask Setup

1. Install the [MetaMask extension](https://metamask.io/download.html) if you haven't already
2. Create a wallet or import an existing one
3. Add the Sepolia testnet to MetaMask:
   - Click on the network dropdown (usually shows "Ethereum Mainnet")
   - Click "Add Network"
   - Add Sepolia with the following details:
     - Network Name: Sepolia Test Network
     - New RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
     - Chain ID: 11155111
     - Currency Symbol: ETH
     - Block Explorer URL: https://sepolia.etherscan.io
4. Get Sepolia ETH from a faucet:
   - Visit https://sepoliafaucet.com/
   - Follow the instructions to receive test ETH

## 9. Verify Setup

You can verify your MetaMask configuration by visiting:

```
http://localhost:3000/metamask-check.html
```

This page will check if:
- MetaMask is installed
- Your wallet is connected
- You're on the Sepolia network
- You have sufficient ETH balance