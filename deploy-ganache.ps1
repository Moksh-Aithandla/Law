# E-Vault Law System - Ganache Deployment PowerShell Script
# This script automates the deployment process for the E-Vault Law System to Ganache

param (
    [switch]$SkipClean = $false,
    [switch]$SkipDependencies = $false
)

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "E-Vault Law System - Ganache Deployment" -ForegroundColor Cyan
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

# Check if Ganache is installed
Write-Host "Checking Ganache installation..." -ForegroundColor Yellow
$ganacheInstalled = $false
try {
    $ganacheVersion = npx ganache --version
    $ganacheInstalled = $true
    Write-Host "Ganache found: $ganacheVersion" -ForegroundColor Green
} catch {
    Write-Host "Ganache not found. Installing Ganache..." -ForegroundColor Yellow
    npm install -g ganache
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Ganache. Please install it manually with 'npm install -g ganache'" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Ganache installed successfully!" -ForegroundColor Green
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

    # Check if backend node_modules exists and only install if needed
    $backendPath = Join-Path -Path $rootDir -ChildPath "backend"
    if (-not (Test-Path (Join-Path -Path $backendPath -ChildPath "node_modules"))) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
        Set-Location -Path $backendPath
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to install backend dependencies." -ForegroundColor Red
            Set-Location -Path $rootDir
            Read-Host "Press Enter to exit"
            exit 1
        }
        Set-Location -Path $rootDir
    } else {
        Write-Host "Backend dependencies already installed. Skipping..." -ForegroundColor Green
    }
} else {
    Write-Host "Skipping dependency installation as requested..." -ForegroundColor Yellow
}

# Clean any existing deployment if not skipped
if (-not $SkipClean) {
    Write-Host "Cleaning previous deployment..." -ForegroundColor Yellow
    npm run clean
} else {
    Write-Host "Skipping cleaning step as requested..." -ForegroundColor Yellow
}

# Start Ganache
Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting Ganache" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$ganacheProcess = Start-Process -FilePath "npx" -ArgumentList "ganache --port 8545 --chain.chainId 1337 --wallet.deterministic --wallet.totalAccounts 10 --wallet.defaultBalance 1000" -PassThru -WindowStyle Normal

# Wait for Ganache to start
Write-Host "Waiting for Ganache to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Deploy contracts to Ganache
Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Deploying to Ganache" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deploying contracts to Ganache..." -ForegroundColor Yellow
npx hardhat run backend/scripts/deploy-admin.js --network localhost
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy to Ganache." -ForegroundColor Red
    Stop-Process -Id $ganacheProcess.Id -Force -ErrorAction SilentlyContinue
    Read-Host "Press Enter to exit"
    exit 1
}

# Update frontend configuration for Ganache
Write-Host "Updating frontend configuration for Ganache..." -ForegroundColor Yellow
node new-update-frontend-config.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to update frontend configuration." -ForegroundColor Red
    Stop-Process -Id $ganacheProcess.Id -Force -ErrorAction SilentlyContinue
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the web server
Write-Host "Starting web server..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -WindowStyle Normal

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Open browser to access the application
Write-Host "Opening application in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "E-Vault Law System Ganache Deployment Complete!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "The system is now running:" -ForegroundColor White
Write-Host "- Ganache: http://localhost:8545 (Chain ID: 1337)" -ForegroundColor White
Write-Host "- Web Server: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To connect with MetaMask:" -ForegroundColor White
Write-Host "1. Install MetaMask browser extension" -ForegroundColor White
Write-Host "2. Create or import a wallet" -ForegroundColor White
Write-Host "3. Connect to the Ganache network:" -ForegroundColor White
Write-Host "   - Network Name: Ganache" -ForegroundColor White
Write-Host "   - RPC URL: http://localhost:8545" -ForegroundColor White
Write-Host "   - Chain ID: 1337" -ForegroundColor White
Write-Host "   - Currency Symbol: ETH" -ForegroundColor White
Write-Host ""
Write-Host "Available test accounts in Ganache:" -ForegroundColor White
Write-Host "- These accounts have 1000 ETH each" -ForegroundColor White
Write-Host "- The first account is used as the admin by default" -ForegroundColor White
Write-Host ""
Write-Host "To stop the system:" -ForegroundColor White
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. The Ganache and web server will be automatically terminated" -ForegroundColor White
Write-Host ""

# Keep the window open and handle cleanup on exit
try {
    Write-Host "Press Ctrl+C to stop the deployment and exit..." -ForegroundColor Yellow
    while ($true) {
        Start-Sleep -Seconds 10
    }
}
finally {
    # Cleanup on exit
    Write-Host "Stopping services..." -ForegroundColor Yellow
    if ($ganacheProcess -ne $null) { Stop-Process -Id $ganacheProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($serverProcess -ne $null) { Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "Deployment stopped." -ForegroundColor Yellow
}