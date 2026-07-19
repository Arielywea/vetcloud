@echo off
echo ========================================
echo   VetCloud - Iniciando servicios...
echo ========================================
echo.

:: Check PostgreSQL
echo [1/3] Verificando PostgreSQL...
netstat -an | findstr ":1245" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] PostgreSQL no esta corriendo en puerto 1245
    echo     Inicia el servicio de PostgreSQL desde Windows Services
    pause
    exit /b 1
)
echo [OK] PostgreSQL activo en puerto 1245

:: Start API Server
echo [2/3] Iniciando API Server...
tasklist /fi "windowtitle eq VetCloud-API" 2>nul | findstr "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] API Server ya esta corriendo
) else (
    start "VetCloud-API" cmd /c "cd /d %~dp0 && node server.js"
    timeout /t 2 /nobreak >nul
    echo [OK] API Server iniciado en http://localhost:8055
)

:: Start Expo
echo [3/3] Iniciando Expo Metro Bundler...
start "VetCloud-Expo" cmd /c "cd /d %~dp0 && npx expo start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   VetCloud esta listo!
echo ========================================
echo.
echo   App:        http://localhost:8081
echo   Admin:      http://localhost:8055/admin
echo   API:        http://localhost:8055
echo.
echo   Para acceder desde otro dispositivo en la red:
echo     1. Abre cmd y escribe: ipconfig
echo     2. Busca "IPv4 Address" (ej: 192.168.1.100)
echo     3. Abre http://TU_IP:8081 en el otro dispositivo
echo.
echo   Para usar en celular con Expo Go:
echo     Escanea el QR que aparece en la terminal
echo.
pause
