@echo off
echo ========================================
echo    TEST SLA SETTINGS PAGE - FINAL
echo ========================================
echo.
echo Membuka halaman test SLA Settings...
echo.
echo Mode yang tersedia:
echo 1. Normal Mode
echo 2. Simple Mode (tanpa Tailwind)
echo 3. Debug Mode (dengan info debug)
echo.

start "" "test-sla-page-modes.html"

echo.
echo File test dibuka di browser.
echo.
echo Instruksi:
echo 1. Login dengan username: admin, password: admin123
echo 2. Test API backend terlebih dahulu
echo 3. Coba berbagai mode halaman SLA Settings
echo 4. Periksa console browser untuk log debugging
echo.
echo URL Frontend: http://localhost:3002/master-data/sla-settings
echo URL Backend API: http://localhost:5002/api/master-data/sla-settings
echo.
pause