# E-Vault Law System - Static Deployment PowerShell Script
# This script creates a static deployment of the E-Vault Law System

param (
    [switch]$SkipDependencies = $false,
    [string]$DeploymentType = "sepolia" # Options: "sepolia" or "ganache"
)

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "E-Vault Law System - Static Deployment Generator" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Set the root directory
$rootDir = $PSScriptRoot
Set-Location -Path $rootDir

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    }
    catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (-not (Test-CommandExists node)) {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ (v14 or higher)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js version
$nodeVersion = (node --version).Substring(1)
$nodeVersionMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeVersionMajor -lt 14) {
    Write-Host "WARNING: Node.js version $nodeVersion detected. Version 14 or higher is recommended." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Install dependencies if needed and not skipped
if (-not $SkipDependencies) {
    # Check if node_modules exists and only install if needed
    if (-not (Test-Path (Join-Path -Path $rootDir -ChildPath "node_modules"))) {
        Write-Host "Installing main project dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to install main project dependencies." -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host "Main project dependencies already installed. Skipping..." -ForegroundColor Green
    }
} else {
    Write-Host "Skipping dependency installation as requested..." -ForegroundColor Yellow
}

# Create static deployment directory
$staticDir = Join-Path -Path $rootDir -ChildPath "static-deployment"
if (Test-Path $staticDir) {
    Write-Host "Cleaning previous static deployment..." -ForegroundColor Yellow
    Remove-Item -Path $staticDir -Recurse -Force
}

Write-Host "Creating static deployment directory..." -ForegroundColor Yellow
New-Item -Path $staticDir -ItemType Directory | Out-Null

# Copy frontend files
Write-Host "Copying frontend files..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path -Path $rootDir -ChildPath "frontend") -Destination $staticDir -Recurse

# Update frontend configuration based on deployment type
Write-Host "Updating frontend configuration for $DeploymentType..." -ForegroundColor Yellow

if ($DeploymentType -eq "sepolia") {
    # Use Sepolia configuration
    $networkId = 11155111
    $networkName = "Sepolia Testnet"
    
    # Check if deployed-addresses.json exists
    $deployedAddressesPath = Join-Path -Path $rootDir -ChildPath "deployed-addresses.json"
    if (-not (Test-Path $deployedAddressesPath)) {
        Write-Host "WARNING: deployed-addresses.json not found. Using placeholder addresses." -ForegroundColor Yellow
        $deployedAddresses = @{
            UserRegistry = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
            CaseManager = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
            IPFSManager = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
        }
    } else {
        $deployedAddresses = Get-Content -Path $deployedAddressesPath -Raw | ConvertFrom-Json
        $deployedAddresses = @{
            UserRegistry = $deployedAddresses.UserRegistry
            CaseManager = $deployedAddresses.CaseManager
            IPFSManager = $deployedAddresses.IPFSManager
        }
    }
} else {
    # Use Ganache configuration
    $networkId = 1337
    $networkName = "Ganache Local Network"
    
    # Use placeholder addresses for Ganache
    $deployedAddresses = @{
        UserRegistry = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        CaseManager = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        IPFSManager = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    }
}

# Create config.js file
$configContent = @"
// Auto-generated configuration file with contract addresses
// Last updated: $(Get-Date -Format o)

// Frontend configuration for E-Vault Law Management System
// This file will be automatically updated by the deployment script

// Contract addresses - will be replaced during deployment
export const userRegistryAddress = "$($deployedAddresses.UserRegistry)";
export const caseManagerAddress = "$($deployedAddresses.CaseManager)";
export const ipfsManagerAddress = "$($deployedAddresses.IPFSManager)";

// Network configuration
export const networkConfig = {
  // For Ganache local development
  1337: {
    name: 'Ganache',
    explorer: 'https://etherscan.io',
    rpcUrl: 'http://localhost:8545'
  },
  // For Sepolia testnet
  11155111: {
    name: 'Sepolia',
    explorer: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://sepolia.infura.io/v3/'
  }
};

// Default network
export const defaultNetwork = $networkId;

// Helper functions
export function getNetworkName(chainId) {
  return networkConfig[chainId]?.name || 'Unknown Network';
}

export function getExplorerUrl(chainId, txHash) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}

export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
}
"@

$configPath = Join-Path -Path $staticDir -ChildPath "frontend\config.js"
Set-Content -Path $configPath -Value $configContent

# Create contract-config.js file
$contractConfigPath = Join-Path -Path $staticDir -ChildPath "frontend\js\contract-config.js"
$contractConfigContent = @"
// Auto-generated contract configuration file
// Last updated: $(Get-Date -Format o)

// Contract addresses
export const CONTRACT_ADDRESSES = {
  UserRegistry: "$($deployedAddresses.UserRegistry)",
  CaseManager: "$($deployedAddresses.CaseManager)",
  IPFSManager: "$($deployedAddresses.IPFSManager)"
};

// Network configuration
export const NETWORKS = {
  // For Ganache local development
  1337: {
    name: 'Ganache',
    explorer: 'https://etherscan.io',
    rpcUrl: 'http://localhost:8545'
  },
  // For Sepolia testnet
  11155111: {
    name: 'Sepolia',
    explorer: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://sepolia.infura.io/v3/'
  }
};

// Default network
export const DEFAULT_NETWORK = $networkId;

// Function to get network name
export function getNetworkName(chainId) {
  return NETWORKS[chainId]?.name || 'Unknown Network';
}

// Function to get explorer URL for a transaction
export function getExplorerUrl(chainId, txHash) {
  const baseUrl = NETWORKS[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}

// Function to get explorer URL for an address
export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = NETWORKS[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
}
"@

Set-Content -Path $contractConfigPath -Value $contractConfigContent

# Create a simple static server
$staticServerPath = Join-Path -Path $staticDir -ChildPath "server.js"
$staticServerContent = @"
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the main HTML file for all routes (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`E-Vault Law Management System server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
"@

Set-Content -Path $staticServerPath -Value $staticServerContent

# Create package.json for static deployment
$staticPackagePath = Join-Path -Path $staticDir -ChildPath "package.json"
$staticPackageContent = @"
{
  "name": "evault-static",
  "version": "1.0.0",
  "description": "Static deployment of E-Vault Law Management System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.2"
  }
}
"@

Set-Content -Path $staticPackagePath -Value $staticPackageContent

# Create README for static deployment
$staticReadmePath = Join-Path -Path $staticDir -ChildPath "README.md"
$staticReadmeContent = @"
# E-Vault Law Management System - Static Deployment

This is a static deployment of the E-Vault Law Management System configured for $networkName.

## How to Run

1. Install Node.js if you haven't already (https://nodejs.org/)
2. Open a terminal in this directory
3. Run \`npm install\` to install dependencies
4. Run \`npm start\` to start the server
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

- UserRegistry: $($deployedAddresses.UserRegistry)
- CaseManager: $($deployedAddresses.CaseManager)
- IPFSManager: $($deployedAddresses.IPFSManager)
"@

Set-Content -Path $staticReadmePath -Value $staticReadmeContent

# Create a run script
$runScriptPath = Join-Path -Path $staticDir -ChildPath "run.bat"
$runScriptContent = @"
@echo off
echo ===================================================
echo E-Vault Law Management System - Static Deployment
echo ===================================================
echo.

echo Checking for Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Installing dependencies...
call npm install

echo Starting server...
start "E-Vault Law Server" cmd /c "npm start"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Opening application in browser...
start http://localhost:3000

echo.
echo ===================================================
echo E-Vault Law Management System is now running!
echo ===================================================
echo.
echo The application is configured for $networkName
echo.
echo Press any key to exit this launcher (the server will continue running)...
pause >nul

exit /b 0
"@

Set-Content -Path $runScriptPath -Value $runScriptContent

# Create a zip file of the static deployment
$zipPath = Join-Path -Path $rootDir -ChildPath "evault-law-static-$DeploymentType.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Write-Host "Creating zip archive of static deployment..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($staticDir, $zipPath)

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Static Deployment Created Successfully!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Static deployment files are available at:" -ForegroundColor White
Write-Host "- Directory: $staticDir" -ForegroundColor White
Write-Host "- Zip Archive: $zipPath" -ForegroundColor White
Write-Host ""
Write-Host "To deploy the static version:" -ForegroundColor White
Write-Host "1. Copy the static-deployment directory or extract the zip file to your server" -ForegroundColor White
Write-Host "2. Run 'npm install' to install dependencies" -ForegroundColor White
Write-Host "3. Run 'npm start' to start the server" -ForegroundColor White
Write-Host "4. Access the application at http://your-server:3000" -ForegroundColor White
Write-Host ""
Write-Host "For local testing:" -ForegroundColor White
Write-Host "1. Navigate to the static-deployment directory" -ForegroundColor White
Write-Host "2. Run the run.bat script" -ForegroundColor White
Write-Host ""

# Ask if user wants to test the static deployment
$testDeployment = Read-Host "Would you like to test the static deployment now? (y/n)"
if ($testDeployment -eq "y") {
    Write-Host "Starting static deployment for testing..." -ForegroundColor Yellow
    Set-Location -Path $staticDir
    & "$staticDir\run.bat"
}

Write-Host "Static deployment process completed." -ForegroundColor Green