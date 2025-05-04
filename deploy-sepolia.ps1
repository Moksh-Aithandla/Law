# E-Vault Law Management System - Sepolia Deployment Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "E-Vault Law Management System - Sepolia Deployment" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion - OK" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion - OK" -ForegroundColor Green
} catch {
    Write-Host "npm is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create directory for logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error installing dependencies." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
}

# Check if Infura API key is set
$configContent = Get-Content "frontend\config.js" -Raw
if ($configContent -match "YOUR_INFURA_API_KEY") {
    Write-Host "You need to set your Infura API key in frontend\config.js" -ForegroundColor Yellow
    $infuraKey = Read-Host "Enter your Infura API key"
    
    if ([string]::IsNullOrEmpty($infuraKey)) {
        Write-Host "No Infura API key provided. Exiting..." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Updating config.js with your Infura API key..." -ForegroundColor Yellow
    $configContent = $configContent -replace "YOUR_INFURA_API_KEY", $infuraKey
    Set-Content "frontend\config.js" $configContent
    Write-Host "Infura API key updated." -ForegroundColor Green
}

# Check if Filebase API key is set
$configContent = Get-Content "frontend\config.js" -Raw
if ($configContent -match "YOUR_FILEBASE_API_KEY") {
    Write-Host "You need to set your Filebase API key in frontend\config.js" -ForegroundColor Yellow
    $filebaseKey = Read-Host "Enter your Filebase API key (press Enter to skip)"
    
    if (-not [string]::IsNullOrEmpty($filebaseKey)) {
        Write-Host "Updating config.js with your Filebase API key..." -ForegroundColor Yellow
        $configContent = $configContent -replace "YOUR_FILEBASE_API_KEY", $filebaseKey
        Set-Content "frontend\config.js" $configContent
        Write-Host "Filebase API key updated." -ForegroundColor Green
        
        # Update server.js if it exists
        if (Test-Path "server.js") {
            $serverContent = Get-Content "server.js" -Raw
            if ($serverContent -match "YOUR_FILEBASE_API_KEY") {
                Write-Host "Updating server.js with your Filebase API key..." -ForegroundColor Yellow
                $serverContent = $serverContent -replace "YOUR_FILEBASE_API_KEY", $filebaseKey
                Set-Content "server.js" $serverContent
                Write-Host "Server.js updated with Filebase API key." -ForegroundColor Green
            }
        }
    } else {
        Write-Host "Skipping Filebase API key update." -ForegroundColor Yellow
    }
}

# Check if admin wallet address is set
$configContent = Get-Content "frontend\config.js" -Raw
if ($configContent -match "0x340b42850B5186c72CDf7eaC3250CCf8EFDecd75") {
    Write-Host "Current admin wallet address: 0x340b42850B5186c72CDf7eaC3250CCf8EFDecd75" -ForegroundColor Yellow
    $adminWallet = Read-Host "Enter your admin wallet address (press Enter to keep current)"
    
    if (-not [string]::IsNullOrEmpty($adminWallet)) {
        Write-Host "Updating config.js with your admin wallet address..." -ForegroundColor Yellow
        $configContent = $configContent -replace "0x340b42850B5186c72CDf7eaC3250CCf8EFDecd75", $adminWallet
        Set-Content "frontend\config.js" $configContent
        Write-Host "Admin wallet address updated." -ForegroundColor Green
    } else {
        Write-Host "Keeping current admin wallet address." -ForegroundColor Yellow
    }
}

# Create .env file for environment variables
Write-Host "Creating .env file..." -ForegroundColor Yellow
"FILEBASE_API_KEY=$filebaseKey" | Out-File -FilePath ".env" -Encoding utf8
"PORT=3000" | Out-File -FilePath ".env" -Encoding utf8 -Append
"NODE_ENV=production" | Out-File -FilePath ".env" -Encoding utf8 -Append

# Check if MetaMask is installed
Write-Host "Please ensure you have MetaMask installed in your browser." -ForegroundColor Yellow
Write-Host "If not, please install it from https://metamask.io/download.html" -ForegroundColor Yellow

# Check if user has Sepolia ETH
Write-Host "Please ensure you have Sepolia ETH in your MetaMask wallet." -ForegroundColor Yellow
Write-Host "If not, get some from a faucet like https://sepoliafaucet.com/" -ForegroundColor Yellow

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Configuration complete!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your E-Vault Law Management System is now configured to run on Sepolia testnet." -ForegroundColor Green
Write-Host ""
Write-Host "To start the server, run: npm start" -ForegroundColor Yellow
Write-Host "Then access the application at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

$startServer = Read-Host "Do you want to start the server now? (Y/N)"

if ($startServer -eq "Y" -or $startServer -eq "y") {
    Write-Host "Starting server..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm start"
    Write-Host "Server started! Access the application at http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Enter to exit this setup script..." -ForegroundColor Yellow
    Read-Host
} else {
    Write-Host "You can start the server later by running: npm start" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to exit..." -ForegroundColor Yellow
    Read-Host
}