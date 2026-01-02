@echo off
echo ========================================
echo    TEST SURVEI KEPUASAN PUBLIK
echo ========================================
echo.

echo [INFO] Membuka halaman test survei publik...
echo.

echo [1] Landing Page Survei: http://localhost:3000/survey
echo [2] Form Survei Publik: http://localhost:3000/survey/public
echo [3] Test Page: http://localhost:3000/test-public-survey.html
echo.

echo [INFO] Memulai browser untuk test...
start http://localhost:3000/survey
timeout /t 2 /nobreak >nul
start http://localhost:3000/test-public-survey.html

echo.
echo ========================================
echo    INSTRUKSI TEST
echo ========================================
echo.
echo 1. Pastikan backend berjalan di port 5000
echo 2. Pastikan frontend berjalan di port 3000
echo 3. Test halaman landing survei
echo 4. Test form survei publik
echo 5. Test API endpoints di halaman test
echo 6. Coba submit survei test
echo.
echo [SUCCESS] Halaman test telah dibuka!
echo [INFO] Periksa browser untuk melanjutkan test.
echo.
pause