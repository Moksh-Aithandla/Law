@echo off
echo Starting E-Vault Law Management System...
cd /d "%~dp0"
start cmd /k "node simple-server.js"
timeout /t 2 /nobreak > nul
start http://localhost:3000
echo Application started. Please check your browser.
pause