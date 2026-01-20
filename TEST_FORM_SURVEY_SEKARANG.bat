@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          🧪 TEST FORM SURVEY - TANPA SIDEBAR             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Server: http://localhost:3003
echo.
echo ════════════════════════════════════════════════════════════
echo   TEST URLS
echo ════════════════════════════════════════════════════════════
echo.
echo 1. Form Survey:
echo    http://localhost:3003/form/survey?qr=TEST123
echo.
echo 2. Form Internal:
echo    http://localhost:3003/form/internal?unit_id=1^&unit_name=Test
echo.
echo 3. Form Eksternal:
echo    http://localhost:3003/form/eksternal?qr=TEST456
echo.
echo ════════════════════════════════════════════════════════════
echo   YANG HARUS TERLIHAT
echo ════════════════════════════════════════════════════════════
echo.
echo ✓ Form fullscreen (TIDAK ADA SIDEBAR)
echo ✓ Background gradient warna
echo ✓ Progress indicator
echo ✓ Form input fields
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo Membuka browser...
timeout /t 2 >nul
start http://localhost:3003/form/survey?qr=TEST123
echo.
echo ✅ Browser dibuka!
echo.
echo PENTING: Clear browser cache dulu!
echo - Tekan Ctrl+Shift+Del
echo - Atau Ctrl+F5 untuk hard refresh
echo.
pause
