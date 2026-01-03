@echo off
echo ========================================
echo       MONITOR STATUS APLIKASI
echo ========================================
echo.

:LOOP
cls
echo ========================================
echo       MONITOR STATUS APLIKASI
echo ========================================
echo Waktu: %date% %time%
echo.

echo 🌐 Checking port status...
netstat -an | findstr ":3001" > nul
if %errorlevel% == 0 (
    echo ✅ Frontend (Port 3001): RUNNING
) else (
    echo ❌ Frontend (Port 3001): NOT RUNNING
)

netstat -an | findstr ":3003" > nul
if %errorlevel% == 0 (
    echo ✅ Backend (Port 3003): RUNNING
) else (
    echo ❌ Backend (Port 3003): NOT RUNNING
)

echo.
echo 📊 Process information...
echo Frontend processes:
tasklist | findstr "node.exe" | findstr "3001" 2>nul
if %errorlevel% neq 0 echo   No frontend processes found

echo.
echo Backend processes:
tasklist | findstr "node.exe" | findstr "3003" 2>nul
if %errorlevel% neq 0 echo   No backend processes found

echo.
echo 🔧 Quick actions:
echo [1] Test aplikasi di browser
echo [2] Restart aplikasi
echo [3] Check console logs
echo [4] Test Supabase connection
echo [5] Exit monitor
echo.

echo ⏰ Auto refresh dalam 10 detik... (tekan key untuk action)
choice /c 12345 /t 10 /d 0 /m "Pilih action atau tunggu auto refresh"

if %errorlevel% == 1 (
    echo 🌐 Opening browser...
    start http://localhost:3001
    timeout /t 2 /nobreak > nul
)
if %errorlevel% == 2 (
    echo 🔄 Restarting aplikasi...
    call STOP_AND_RESTART_FIXED.bat
    timeout /t 5 /nobreak > nul
)
if %errorlevel% == 3 (
    echo 📋 Check console logs di browser (F12)
    start http://localhost:3001
    timeout /t 2 /nobreak > nul
)
if %errorlevel% == 4 (
    echo 🧪 Testing Supabase connection...
    start test-supabase-connection-fix.html
    timeout /t 2 /nobreak > nul
)
if %errorlevel% == 5 (
    echo 👋 Exiting monitor...
    exit /b
)

goto LOOP