@echo off
echo ========================================
echo  VetCloud - Docker Setup Script
echo ========================================
echo.

echo Checking Windows version...
ver

echo.
echo Checking if WSL features are available...
dism /online /get-features | findstr /i "WSL"

echo.
echo Checking if Hyper-V features are available...
dism /online /get-features | findstr /i "Hyper"

echo.
echo Checking virtualization status...
systeminfo | findstr /i "virtualization"

echo.
echo ========================================
echo  If WSL/Hyper-V features are not listed,
echo  your Windows version may not support them.
echo ========================================
pause
