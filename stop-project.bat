@echo off
echo ===================================================
echo Stopping E-Vault Law Management System
echo ===================================================
echo.

echo Stopping Hardhat node (port 8545)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8545') do (
    echo Killing process with PID: %%a
    taskkill /F /PID %%a 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Process killed successfully.
    ) else (
        echo Failed to kill process.
    )
)

echo.
echo Stopping frontend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process with PID: %%a
    taskkill /F /PID %%a 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Process killed successfully.
    ) else (
        echo Failed to kill process.
    )
)

echo.
echo Also trying to stop by window title...
taskkill /FI "WINDOWTITLE eq Hardhat Node" /F 2>nul
taskkill /FI "WINDOWTITLE eq Frontend Server" /F 2>nul

echo.
echo ===================================================
echo E-Vault Law Management System has been stopped.
echo ===================================================
pause