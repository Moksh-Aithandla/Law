# E-Vault Law System - Project Cleanup Script
# This script removes unnecessary files from the project

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "E-Vault Law System - Project Cleanup" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Set the root directory
$rootDir = $PSScriptRoot
Set-Location -Path $rootDir

# List of unnecessary files to remove
$filesToRemove = @(
    # Duplicate HTML files
    "frontend/new-index.html",
    "frontend/simplified-index.html",
    "frontend/metamask-test.html",
    "frontend/signup.html", # Duplicate of register.html
    
    # Docker files
    "docker-compose.yml",
    "Dockerfile",
    "filebase-proxy/Dockerfile",
    
    # Temporary or test files
    "check-deployment.js",
    "check-wallet.js",
    "cleanup-project.js",
    
    # Duplicate JS files
    "frontend/js/metamask-test.js",
    "frontend/js/metamask.js", # Replaced by improved-metamask.js
    "frontend/js/new-main.js",
    "frontend/js/simplified-app.js",
    
    # Duplicate CSS files
    "frontend/css/enhanced-styles.css",
    "frontend/css/enhanced-ui.css",
    "frontend/css/law-theme.css" # Replaced by modern-law-theme.css
)

# Function to safely remove a file
function Remove-FileIfExists {
    param (
        [string]$FilePath
    )
    
    $fullPath = Join-Path -Path $rootDir -ChildPath $FilePath
    if (Test-Path $fullPath) {
        Write-Host "Removing: $FilePath" -ForegroundColor Yellow
        Remove-Item -Path $fullPath -Force
        return $true
    }
    return $false
}

# Count of removed files
$removedCount = 0

# Remove unnecessary files
Write-Host "Removing unnecessary files..." -ForegroundColor Yellow
foreach ($file in $filesToRemove) {
    if (Remove-FileIfExists -FilePath $file) {
        $removedCount++
    }
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Project Cleanup Complete!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Removed $removedCount unnecessary files." -ForegroundColor White
Write-Host ""

# Ask if user wants to create a static deployment
$createStatic = Read-Host "Would you like to create a static deployment now? (y/n)"
if ($createStatic -eq "y") {
    $deploymentType = Read-Host "Which network would you like to configure? (sepolia/ganache)"
    if ($deploymentType -ne "sepolia" -and $deploymentType -ne "ganache") {
        $deploymentType = "sepolia"
        Write-Host "Invalid option. Defaulting to sepolia." -ForegroundColor Yellow
    }
    
    Write-Host "Creating static deployment for $deploymentType..." -ForegroundColor Yellow
    & "$rootDir\deploy-static.ps1" -DeploymentType $deploymentType
}

Write-Host "Project cleanup process completed." -ForegroundColor Green