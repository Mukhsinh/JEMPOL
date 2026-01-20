@echo off
echo ========================================
echo PERBAIKAN IMPORT ERROR - RESTART APLIKASI
echo ========================================
echo.

echo [INFO] Error yang diperbaiki:
echo - DirectInternalTicketForm is not defined
echo - DirectExternalTicketForm is not defined  
echo - DirectSurveyForm is not defined
echo.
echo [SOLUSI] Menghapus import yang tidak terpakai
echo.

echo [1/5] Hentikan semua proses Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Hapus cache Vite...
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite"

echo [3/5] Mulai Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo [4/5] Mulai Frontend...
cd frontend  
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo [5/5] Tunggu server siap...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo APLIKASI SIAP DITEST!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3006
echo.
echo Test halaman berikut:
echo 1. Dashboard: http://localhost:3006/dashboard
echo 2. QR Management: http://localhost:3006/tickets/qr-management
echo 3. Form Internal: http://localhost:3006/tickets/create/internal
echo.
echo Cek console browser - seharusnya tidak ada error lagi!
echo.
pause
