@echo off
setlocal enabledelayedexpansion

:: Set console colors and title
color 0A
title E-Vault Law Management System

:: Simple ASCII Art Logo
echo.
echo  E-VAULT LAW SYSTEM
echo  =================
echo  BLOCKCHAIN-BASED LEGAL MANAGEMENT SYSTEM
echo.

:: Check if Node.js is installed
echo [*] Checking system requirements...

node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

echo [✓] Node.js is installed

:: Install dependencies if needed
if not exist node_modules (
    echo [*] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        echo Press any key to exit...
        pause > nul
        exit /b 1
    )
    echo [✓] Dependencies installed
) else (
    echo [✓] Dependencies ready
)

:: Create project structure
echo [*] Setting up project structure...

:: Create directories silently
mkdir frontend 2>nul
mkdir frontend\js 2>nul
mkdir frontend\css 2>nul
mkdir frontend\abi 2>nul
mkdir frontend\data 2>nul
mkdir backend 2>nul
mkdir backend\scripts 2>nul
mkdir backend\contracts 2>nul

echo [✓] Project structure ready

:: Kill any existing node processes that might interfere
echo [*] Cleaning up previous processes...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Hardhat Node" >nul 2>&1

:: Free up port 3000 if it's in use
echo [*] Checking if port 3000 is in use...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo [*] Killing process with PID %%a that is using port 3000
    taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak > nul
)

:: Start blockchain node
echo [*] Starting blockchain node...
start "Hardhat Node" cmd /c "npx hardhat node"
echo [✓] Blockchain node started
timeout /t 3 /nobreak > nul

:: Deploy contracts
echo [*] Deploying smart contracts...

:: Check if deploy script exists
if exist backend\scripts\deploy-with-data.js (
    call npx hardhat run backend\scripts\deploy-with-data.js --network localhost
    if %errorlevel% neq 0 (
        echo [!] Contract deployment had issues, but continuing...
    ) else (
        echo [✓] Smart contracts deployed
    )
) else (
    echo [!] Deploy script not found, skipping contract deployment
    echo [!] The application may not function correctly without deployed contracts
)

:: Start the server
echo [*] Starting web server...
echo [✓] Server starting at http://localhost:3000
echo.
echo  =====================================================================
echo    E-VAULT LAW SYSTEM READY                                         
echo.
echo    * Web interface: http://localhost:3000                           
echo    * Blockchain: Running on localhost:8545                          
echo    * MetaMask: Connect to localhost:8545                            
echo.
echo    Press Ctrl+C to stop the server                                  
echo.
echo  =====================================================================
echo.

:: Start the server
echo [*] Starting server with the following command:
echo     node server.js
echo.
node server.js

:: If server stops
echo.
echo [*] Server stopped
echo Press any key to exit...
pause > nul
exit /b 0