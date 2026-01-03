@echo off
echo ========================================
echo VERIFIKASI PERBAIKAN TIMEOUT
echo ========================================

echo.
echo 1. Membuka test login di browser...
start "" "test-login-timeout-fixed.html"

echo.
echo 2. Menunggu browser terbuka...
timeout /t 3 >nul

echo.
echo ========================================
echo INSTRUKSI TESTING:
echo ========================================
echo.
echo 1. Halaman test akan terbuka di browser
echo 2. Klik "Test Koneksi" untuk cek database
echo 3. Coba login dengan kredensial:
echo    - Email: test@admin.com
echo    - Password: admin123
echo.
echo 4. Jika berhasil, buka aplikasi utama:
echo    http://localhost:3002
echo.
echo 5. Jika masih error, jalankan:
echo    RESTART_APP_TIMEOUT_FIXED.bat
echo.
echo ========================================

pause