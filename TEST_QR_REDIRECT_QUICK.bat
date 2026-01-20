@echo off
echo ========================================
echo QUICK TEST - QR REDIRECT KE FORM
echo ========================================
echo.
echo Membuka test page untuk verifikasi cepat
echo bahwa QR redirect langsung ke form tanpa sidebar
echo.
echo ========================================
echo.

echo [1/2] Membuka test page...
start test-qr-redirect-direct-form.html

timeout /t 2 /nobreak >nul

echo.
echo [2/2] Membuka contoh form langsung...
echo.

echo Opening: Internal Ticket Form
start http://localhost:3002/form/internal?unit_id=test&unit_name=Unit%%20IT&auto_fill=true

timeout /t 1 /nobreak >nul

echo Opening: External Ticket Form
start http://localhost:3002/form/eksternal?unit_id=test&unit_name=Direktur%%20Utama&auto_fill=true

timeout /t 1 /nobreak >nul

echo Opening: Survey Form
start http://localhost:3002/form/survey?unit_id=test&unit_name=Unit%%20Rawat%%20Jalan&auto_fill=true

echo.
echo ========================================
echo VERIFIKASI:
echo ========================================
echo.
echo 1. Form harus tampil TANPA SIDEBAR
echo 2. Form harus FULLSCREEN
echo 3. Unit name harus otomatis terisi
echo 4. Tidak perlu login
echo 5. Bisa langsung input data
echo.
echo ========================================
echo.

pause
