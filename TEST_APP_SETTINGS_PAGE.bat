@echo off
echo ========================================
echo    TEST HALAMAN PENGATURAN APLIKASI
echo ========================================
echo.

echo [INFO] Membuka halaman test pengaturan aplikasi...
start "" "test-app-settings-page.html"

echo.
echo [INFO] Halaman test telah dibuka di browser
echo [INFO] Fitur yang dapat ditest:
echo   - Form pengaturan aplikasi
echo   - Upload logo instansi  
echo   - Validasi input
echo   - Simulasi penyimpanan data
echo.

echo [INFO] Untuk test integrasi database, jalankan:
echo   - START_BACKEND.bat (untuk backend API)
echo   - Akses http://localhost:3000/settings/app-settings
echo.

pause