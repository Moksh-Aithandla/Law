@echo off
echo ===================================================
echo E-Vault Law Management System Startup
echo ===================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking for dependencies...
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Check if backend dependencies are installed
if not exist backend\node_modules (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to install backend dependencies.
        pause
        exit /b 1
    )
)

REM Make sure frontend directories exist
if not exist frontend (
    echo Creating frontend directory...
    mkdir frontend
)

if not exist frontend\data (
    echo Creating frontend data directory...
    mkdir frontend\data
)

if not exist frontend\js (
    echo Creating frontend js directory...
    mkdir frontend\js
)

if not exist frontend\css (
    echo Creating frontend css directory...
    mkdir frontend\css
)

echo.
echo ===================================================
echo Starting Hardhat node (local blockchain)...
echo ===================================================
start "Hardhat Node" cmd /c "npx hardhat node"

REM Wait for Hardhat node to start
echo Waiting for Hardhat node to start...
timeout /t 10 /nobreak > nul

echo.
echo ===================================================
echo Deploying contracts with initial data...
echo ===================================================
call npx hardhat run backend/scripts/deploy-with-data.js --network localhost
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to deploy contracts.
    echo Make sure Hardhat node is running.
    echo Retrying in 5 seconds...
    timeout /t 5 /nobreak > nul
    
    echo Retrying deployment...
    call npx hardhat run backend/scripts/deploy-with-data.js --network localhost
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to deploy contracts after retry.
        echo Please check the Hardhat node and try again.
        pause
        exit /b 1
    )
)

echo.
echo ===================================================
echo Generating large dataset (50 lawyers, 25 judges, 100 cases)...
echo ===================================================
node backend/scripts/generate-large-dataset.js
if %ERRORLEVEL% neq 0 (
    echo Warning: Failed to generate large dataset.
    echo Continuing with basic dataset...
)

echo.
echo ===================================================
echo Starting frontend server...
echo ===================================================

REM Kill any existing process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

REM Start the server
start "Frontend Server" cmd /c "node server.js"

echo.
echo ===================================================
echo E-Vault Law Management System is now running!
echo.
echo Hardhat Node: http://localhost:8545
echo Frontend: http://localhost:3000
echo.
echo To stop the application, close all command windows.
echo ===================================================

REM Open the browser
echo Opening browser...
timeout /t 2 /nobreak > nul
start http://localhost:3000

pause