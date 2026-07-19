# VetCloud - Enable WSL2 and Docker Features
# MUST BE RUN AS ADMINISTRATOR

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " VetCloud - Enabling Docker Features" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Running as Administrator - OK" -ForegroundColor Green
Write-Host ""

# Enable WSL
Write-Host "Enabling Windows Subsystem for Linux..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
Write-Host "Enabling Virtual Machine Platform..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Enable Hyper-V (if available)
Write-Host "Enabling Hyper-V..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:Microsoft-Hyper-V /all /norestart

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Features enabled successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: You MUST restart your computer now." -ForegroundColor Yellow
Write-Host "After restart, run Docker Desktop and try again." -ForegroundColor Yellow
Write-Host ""

$restart = Read-Host "Do you want to restart now? (Y/N)"
if ($restart -eq "Y" -or $restart -eq "y") {
    Restart-Computer -Force
} else {
    Write-Host "Please restart your computer manually before continuing." -ForegroundColor Yellow
}

pause
