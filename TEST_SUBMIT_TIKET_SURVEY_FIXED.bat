@echo off
echo ========================================
echo TEST SUBMIT TIKET INTERNAL DAN SURVEY
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. API handler menutup dengan benar
echo 2. Response selalu JSON yang valid
echo 3. Frontend validasi content-type
echo 4. Error handling lebih baik
echo.
echo ========================================
echo.

echo Membuka browser untuk test...
echo.

echo [1/3] Test Form Tiket Internal
start http://localhost:5173/form/internal?unit_id=test&unit_name=Jlamprang
timeout /t 3 /nobreak >nul

echo.
echo [2/3] Test Form Survey
start http://localhost:5173/form/survey?unit_id=test&unit_name=Jlamprang
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Test Mobile Survey
start http://localhost:5173/mobile/survey?unit_id=test&unit_name=Jlamprang
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo INSTRUKSI TESTING:
echo ========================================
echo.
echo 1. Isi form tiket internal dan klik submit
echo    - Pastikan tidak ada error "Unexpected end of JSON input"
echo    - Pastikan muncul nomor tiket jika berhasil
echo.
echo 2. Isi form survey dan klik submit
echo    - Pastikan tidak ada error JSON parsing
echo    - Pastikan muncul pesan sukses
echo.
echo 3. Cek console browser (F12) untuk log:
echo    - Harus ada log "Response status: 201"
echo    - Harus ada log "Response data: {success: true, ...}"
echo    - Tidak boleh ada error "Non-JSON response"
echo.
echo 4. Jika masih error, cek:
echo    - Backend berjalan di port 3000
echo    - Frontend berjalan di port 5173
echo    - Database Supabase terhubung
echo.
echo ========================================
echo.

pause
