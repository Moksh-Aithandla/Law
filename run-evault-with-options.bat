@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo E-Vault Law Management System - Deployment Options
echo ===================================================
echo.

:: Check if Node.js is installed
echo Checking for Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Found Node.js !NODE_VERSION!

:: Check if npm is installed
echo Checking for npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install npm.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Check npm version
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo Found npm !NPM_VERSION!

:: Create necessary directories if they don't exist
if not exist "filebase-proxy\uploads" mkdir "filebase-proxy\uploads"

:: Check if node_modules exists, install dependencies if not
echo Checking project dependencies...
if not exist "node_modules" (
    echo Installing main project dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies. Please check your internet connection and try again.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

:: Ask user which deployment option to use
echo.
echo Please select a deployment option:
echo 1. Ganache (Local Development)
echo 2. Sepolia (Testnet)
echo 3. Static Deployment (Ganache)
echo 4. Static Deployment (Sepolia)
echo 5. Clean Project (Remove unnecessary files)
echo.
set /p OPTION_CHOICE="Enter your choice (1-5): "

if "%OPTION_CHOICE%"=="1" (
    echo.
    echo You selected: Ganache (Local Development)
    echo.
    powershell -ExecutionPolicy Bypass -File deploy-ganache.ps1
) else if "%OPTION_CHOICE%"=="2" (
    echo.
    echo You selected: Sepolia (Testnet)
    echo.
    powershell -ExecutionPolicy Bypass -File deploy-sepolia.ps1
) else if "%OPTION_CHOICE%"=="3" (
    echo.
    echo You selected: Static Deployment (Ganache)
    echo.
    powershell -ExecutionPolicy Bypass -File deploy-static.ps1 -DeploymentType ganache
) else if "%OPTION_CHOICE%"=="4" (
    echo.
    echo You selected: Static Deployment (Sepolia)
    echo.
    powershell -ExecutionPolicy Bypass -File deploy-static.ps1 -DeploymentType sepolia
) else if "%OPTION_CHOICE%"=="5" (
    echo.
    echo You selected: Clean Project
    echo.
    powershell -ExecutionPolicy Bypass -File cleanup-project.ps1
) else (
    echo Invalid choice. Exiting.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

endlocal
exit /b 0