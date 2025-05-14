@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo E-Vault Law - Sepolia Deployment Script
echo ===================================================
echo This script will deploy your contracts to the Sepolia testnet
echo and configure the Filebase storage for document management.
echo.

:: Check for required software
echo Checking for required software...

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%

:: Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install Node.js from https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)

:: Check npm version
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo npm version: %NPM_VERSION%

:: Check if .env files exist, if not create them
if not exist "backend\.env" (
    echo Creating backend/.env file with provided credentials...
    
    echo # E-Vault Law Management System Environment Variables > backend\.env
    echo. >> backend\.env
    echo # Blockchain Network >> backend\.env
    echo NETWORK=sepolia >> backend\.env
    echo. >> backend\.env
    echo # Alchemy API Key >> backend\.env
    echo ALCHEMY_API_KEY=RuOilkGBfCJflqOLZND0WrLWvLFtooRA >> backend\.env
    echo. >> backend\.env
    echo # Private Key >> backend\.env
    echo PRIVATE_KEY=0x06fe5cf665ced25f071ef6d237c21b1f36222605c2822135839aec503006b4f0 >> backend\.env
    echo. >> backend\.env
    echo # Admin Address >> backend\.env
    echo ADMIN_ADDRESS=0x13591389EE06948758541b38547a37FB9483F2f4 >> backend\.env
    
    echo.
    echo Backend .env file created with all required credentials.
    echo.
)

if not exist "filebase-proxy\.env" (
    echo Creating filebase-proxy/.env file with provided credentials...
    
    echo # Filebase Configuration > filebase-proxy\.env
    echo PORT=3001 >> filebase-proxy\.env
    echo FILEBASE_API_KEY=8C7456690C30D12D749F >> filebase-proxy\.env
    echo FILEBASE_SECRET_KEY=TX2i0euuxWAA6hlyjIyOQUAbk72LL8G2L7pOwE3I >> filebase-proxy\.env
    echo FILEBASE_BUCKET=evault-law >> filebase-proxy\.env
    
    echo.
    echo Filebase proxy .env file created with your credentials.
    echo.
)

:: Install dependencies if needed
echo Checking and installing dependencies...

:: Check if node_modules exists in backend
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

:: Check if node_modules exists in filebase-proxy
if not exist "filebase-proxy\node_modules" (
    echo Installing filebase-proxy dependencies...
    cd filebase-proxy
    npm install
    cd ..
)

:: Create uploads directory in filebase-proxy if it doesn't exist
if not exist "filebase-proxy\uploads" (
    echo Creating uploads directory...
    mkdir filebase-proxy\uploads
)

echo.
echo ===================================================
echo Deploying contracts to Sepolia testnet...
echo ===================================================
echo This may take a few minutes. Please be patient.
echo.

:: Deploy contracts to Sepolia
cd backend
npx hardhat run scripts/deploy-to-sepolia.js --network sepolia
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Deployment failed. Please check the error messages above.
    echo Make sure you have enough Sepolia ETH in your account.
    echo You can get Sepolia ETH from these faucets:
    echo - https://sepoliafaucet.com/
    echo - https://www.infura.io/faucet/sepolia
    echo - https://sepolia-faucet.pk910.de/ (Mining faucet)
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ===================================================
echo Starting Filebase proxy server...
echo ===================================================
echo.

:: Start the Filebase proxy server
start "Filebase Proxy Server" cmd /c "cd filebase-proxy && node server.js"

echo.
echo ===================================================
echo Deployment completed successfully!
echo ===================================================
echo.
echo Your contracts are now deployed to the Sepolia testnet.
echo The Filebase proxy server is running in the background.
echo.
echo You can now access your application at:
echo http://localhost:8000
echo.
echo To start the main application server, run:
echo node server.js
echo.

:: Start the main application server
set /p START_SERVER="Do you want to start the main application server now? (Y/N): "
if /i "%START_SERVER%"=="Y" (
    echo Starting main application server...
    start "E-Vault Law Server" cmd /c "node server.js"
    echo Server started at http://localhost:8000
)

echo.
echo Thank you for using E-Vault Law!
echo.
pause