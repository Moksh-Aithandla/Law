# E-Vault Law Management System - Deployment Options

This document outlines the various deployment options available for the E-Vault Law Management System.

## Deployment Options

The system can be deployed in several ways:

1. **Ganache (Local Development)** - For testing and development
2. **Sepolia (Testnet)** - For testing in a public testnet environment
3. **Static Deployment** - For production or hosting on a web server

## Quick Start

Run the deployment options script to choose your deployment method:

```
run-evault-with-options.bat
```

This script will guide you through the deployment process with the following options:

1. **Ganache (Local Development)**
2. **Sepolia (Testnet)**
3. **Static Deployment (Ganache)**
4. **Static Deployment (Sepolia)**
5. **Clean Project (Remove unnecessary files)**

## Detailed Deployment Instructions

### 1. Ganache Deployment

For local development and testing, you can deploy the system to Ganache:

```
powershell -ExecutionPolicy Bypass -File deploy-ganache.ps1
```

This will:
- Start a Ganache instance
- Deploy the contracts to Ganache
- Configure the frontend to connect to Ganache
- Start the web server

### 2. Sepolia Deployment

For testing on the Sepolia testnet:

```
powershell -ExecutionPolicy Bypass -File deploy-sepolia.ps1
```

This requires:
- An Alchemy API key
- A private key with Sepolia ETH
- Configuration in the backend/.env file

### 3. Static Deployment

For production or hosting on a web server:

```
powershell -ExecutionPolicy Bypass -File deploy-static.ps1 -DeploymentType [ganache|sepolia]
```

This will:
- Create a static deployment in the static-deployment directory
- Configure the frontend for the specified network
- Create a zip file of the deployment
- Provide instructions for deploying to a web server

### 4. Clean Project

To remove unnecessary files from the project:

```
powershell -ExecutionPolicy Bypass -File cleanup-project.ps1
```

## MetaMask Configuration

### For Ganache:
- Network Name: Ganache
- RPC URL: http://localhost:8545
- Chain ID: 1337
- Currency Symbol: ETH

### For Sepolia:
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/
- Chain ID: 11155111
- Currency Symbol: ETH

## Switching Between Networks

The application supports switching between networks. When you connect with MetaMask, it will prompt you to switch to the configured network if you're on a different one.

## Production Deployment

For production deployment:

1. Run the static deployment script:
   ```
   powershell -ExecutionPolicy Bypass -File deploy-static.ps1 -DeploymentType sepolia
   ```

2. Upload the contents of the static-deployment directory to your web server
3. Install dependencies with `npm install`
4. Start the server with `npm start` or configure it with your web server (Apache, Nginx, etc.)

## Troubleshooting

If you encounter issues:

1. Check that Node.js is installed (v14 or higher)
2. Ensure you have the required dependencies installed
3. For Sepolia deployment, verify you have Sepolia ETH in your wallet
4. For Ganache deployment, ensure port 8545 is available
5. Check the console for error messages