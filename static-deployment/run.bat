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
echo The application is configured for Sepolia Testnet
echo.
echo Press any key to exit this launcher (the server will continue running)...
pause >nul

exit /b 0
