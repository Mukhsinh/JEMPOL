@echo off
echo ========================================
echo TEST FORM ROUTES - /form/internal, /form/eksternal, /form/survey
echo ========================================
echo.
echo Membuka browser untuk test form routes...
echo.

timeout /t 2 /nobreak >nul

echo [1/3] Testing /form/internal...
start http://localhost:5173/form/internal?unit_id=1&unit_name=Unit%%20Test
timeout /t 2 /nobreak >nul

echo [2/3] Testing /form/eksternal...
start http://localhost:5173/form/eksternal?unit_id=1&unit_name=Unit%%20Test
timeout /t 2 /nobreak >nul

echo [3/3] Testing /form/survey...
start http://localhost:5173/form/survey?unit_id=1&unit_name=Unit%%20Test
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Periksa browser Anda:
echo - /form/internal harus menampilkan form tiket internal
echo - /form/eksternal harus menampilkan form pengaduan eksternal
echo - /form/survey harus menampilkan form survei kepuasan
echo.
echo Semua form harus tampil TANPA SIDEBAR (fullscreen)
echo.
pause
