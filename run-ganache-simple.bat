@echo off
echo ===================================================
echo E-Vault Law Management System - Ganache Deployment
echo ===================================================
echo.

echo Step 1: Starting Ganache...
start "Ganache" cmd /c "npx ganache --port 8545 --chain.chainId 1337 --wallet.deterministic"
echo Waiting for Ganache to start...
timeout /t 5 /nobreak >nul

echo Step 2: Deploying contracts to Ganache...
call npx hardhat run backend/scripts/deploy-admin.js --network ganache
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy contracts to Ganache.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Step 3: Updating frontend configuration...
call node new-update-frontend-config.js --ganache
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to update frontend configuration.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Step 4: Starting web server...
start "Web Server" cmd /c "node server.js"
echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Step 5: Opening application in browser...
start http://localhost:3000

echo.
echo ===================================================
echo E-Vault Law Management System is now running!
echo ===================================================
echo.
echo The system is running with:
echo - Ganache: http://localhost:8545 (Chain ID: 1337)
echo - Web Server: http://localhost:3000
echo.
echo To stop the system, close all command windows.
echo.
echo Press any key to exit this launcher (the application will continue running)...
pause >nul
exit /b 0