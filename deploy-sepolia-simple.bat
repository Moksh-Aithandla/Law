@echo off
echo ===================================================
echo E-Vault Law Management System - Sepolia Deployment
echo ===================================================
echo.

echo Checking Node.js installation...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking npm installation...
npm --version
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies.
    pause
    exit /b 1
)

echo.
echo Setting up configuration...

echo.
set /p INFURA_KEY=Enter your Infura API key: 
if "%INFURA_KEY%"=="" (
    echo No Infura API key provided. Using default configuration.
) else (
    echo Updating config.js with your Infura API key...
    powershell -Command "(Get-Content frontend\config.js) -replace 'YOUR_INFURA_API_KEY', '%INFURA_KEY%' | Set-Content frontend\config.js"
)

echo.
set /p FILEBASE_KEY=Enter your Filebase API key (press Enter to skip): 
if not "%FILEBASE_KEY%"=="" (
    echo Updating config.js with your Filebase API key...
    powershell -Command "(Get-Content frontend\config.js) -replace 'YOUR_FILEBASE_API_KEY', '%FILEBASE_KEY%' | Set-Content frontend\config.js"
    
    echo Updating server.js with your Filebase API key...
    powershell -Command "(Get-Content server.js) -replace 'YOUR_FILEBASE_API_KEY', '%FILEBASE_KEY%' | Set-Content server.js"
)

echo.
set /p ADMIN_WALLET=Enter your admin wallet address (press Enter to keep default): 
if not "%ADMIN_WALLET%"=="" (
    echo Updating config.js with your admin wallet address...
    powershell -Command "(Get-Content frontend\config.js) -replace '0x340b42850B5186c72CDf7eaC3250CCf8EFDecd75', '%ADMIN_WALLET%' | Set-Content frontend\config.js"
)

echo.
echo Creating .env file...
echo FILEBASE_API_KEY=%FILEBASE_KEY% > .env
echo PORT=3000 >> .env
echo NODE_ENV=production >> .env

echo.
echo ===================================================
echo Configuration complete!
echo ===================================================
echo.
echo Your E-Vault Law Management System is now configured to run on Sepolia testnet.
echo.
echo To start the server, run: npm start
echo Then access the application at: http://localhost:3000
echo.
echo Do you want to start the server now? (Y/N)
set /p START_SERVER=

if /i "%START_SERVER%"=="Y" (
    echo Starting server...
    start cmd /k "npm start"
    echo Server started! Access the application at http://localhost:3000
) else (
    echo You can start the server later by running: npm start
)

echo.
echo Press any key to exit...
pause > nul