@echo off
echo ========================================
echo FIX QR REDIRECT KE FORM LANGSUNG
echo ========================================
echo.
echo Memperbaiki redirect QR code agar langsung
echo menampilkan form tanpa sidebar navigasi
echo.
echo ========================================
echo.

echo [1/3] Memperbaiki redirect_type di database...
node fix-qr-redirect-type.js
if errorlevel 1 (
    echo.
    echo [ERROR] Gagal memperbaiki database
    pause
    exit /b 1
)

echo.
echo ========================================
echo [2/3] Membuka test page...
echo ========================================
start test-qr-redirect-direct-form.html

echo.
echo ========================================
echo [3/3] INSTRUKSI TESTING
echo ========================================
echo.
echo 1. Browser akan membuka halaman test
echo 2. Klik tombol untuk test redirect
echo 3. PASTIKAN form muncul TANPA SIDEBAR
echo 4. PASTIKAN unit info otomatis terisi
echo 5. PASTIKAN bisa submit tanpa login
echo.
echo ========================================
echo EXPECTED BEHAVIOR:
echo ========================================
echo.
echo SEBELUM FIX:
echo - Klik redirect ^> Muncul halaman dengan sidebar
echo - Perlu login untuk akses
echo - Form tidak langsung tampil
echo.
echo SETELAH FIX:
echo - Klik redirect ^> Langsung ke form fullscreen
echo - TANPA sidebar navigasi
echo - TANPA perlu login
echo - Unit otomatis terisi dari QR
echo.
echo ========================================
echo.

pause
