@echo off
echo ========================================
echo TEST SUBMIT TIKET DAN SURVEY - FIXED
echo ========================================
echo.

echo Membuka halaman test submit tiket eksternal...
start http://localhost:5173/form/eksternal?unit_id=test&unit_name=Test%%20Unit

timeout /t 2 /nobreak >nul

echo.
echo Membuka halaman test submit survey...
start http://localhost:5173/form/survey?unit_id=test&unit_name=Test%%20Unit

echo.
echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo 1. Isi form tiket eksternal dan submit
echo 2. Isi form survey dan submit
echo 3. Periksa console browser untuk melihat response
echo 4. Pastikan tidak ada error "Unexpected end of JSON input"
echo 5. Pastikan muncul nomor tiket setelah submit berhasil
echo ========================================
echo.
pause
