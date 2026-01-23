@echo off
echo ========================================
echo TEST APP SETTINGS FIX
echo ========================================
echo.

echo [1/3] Membuka file test endpoint...
start test-app-settings-endpoint.html
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Menjalankan aplikasi...
echo Tekan Ctrl+C untuk stop
echo.
start cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Membuka form internal di browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173/form/internal?unit_id=test&unit_name=Test%%20Unit

echo.
echo ========================================
echo TESTING INSTRUCTIONS:
echo ========================================
echo.
echo 1. Lihat tab "Test App Settings Endpoint"
echo    - Harus menampilkan JSON response
echo    - Jika error, lihat retry logic
echo.
echo 2. Lihat tab "Form Internal"
echo    - Buka Developer Console (F12)
echo    - Lihat log app settings loading
echo    - Harus ada: "App settings loaded" atau "Using default"
echo.
echo 3. Test Submit Tiket
echo    - Isi form lengkap
echo    - Submit tiket
echo    - Harus berhasil tanpa error
echo.
echo ========================================
echo.
pause
