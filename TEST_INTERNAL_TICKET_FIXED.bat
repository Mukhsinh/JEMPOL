@echo off
echo ========================================
echo TEST INTERNAL TICKET - FIXED
echo ========================================
echo.

cd backend
echo [1/2] Restarting backend...
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

cd ..
echo.
echo [2/2] Opening test page...
start http://localhost:3002/test-internal-ticket-fix.html
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo TESTING DIMULAI
echo ========================================
echo.
echo Silakan test di browser:
echo 1. Load Units - harus berhasil
echo 2. Create Ticket - pilih unit dan isi form
echo 3. Test Without Unit - harus error (validasi bekerja)
echo 4. Verify Ticket - cek tiket tersimpan
echo.
pause
