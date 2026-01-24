@echo off
echo ========================================
echo RESTART DAN TEST SURVEY IDENTITAS BARU
echo ========================================
echo.
echo Menghentikan aplikasi yang sedang berjalan...
echo.

REM Hentikan proses yang berjalan
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo ========================================
echo Memulai Backend...
echo ========================================
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo Menunggu backend siap...
timeout /t 5 >nul

echo.
echo ========================================
echo Memulai Frontend...
echo ========================================
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Menunggu frontend siap...
timeout /t 8 >nul

echo.
echo ========================================
echo PERUBAHAN FORM SURVEY:
echo ========================================
echo.
echo Field Identitas Baru (WAJIB):
echo   1. Nomor HP (WhatsApp) - Input text
echo   2. Usia - Radio button (4 pilihan)
echo   3. Jenis Kelamin - Radio button (2 pilihan)
echo   4. Pendidikan Terakhir - Dropdown (7 pilihan)
echo   5. Pekerjaan - Input text
echo   6. Alamat Domisili:
echo      - Provinsi (dropdown)
echo      - Kota/Kabupaten (dropdown)
echo      - Kecamatan (dropdown)
echo      - Kelurahan/Desa (dropdown)
echo.
echo Field Opsional:
echo   - Nama Lengkap (bisa anonim)
echo   - Email
echo.
echo ========================================
echo DATABASE UPDATE:
echo ========================================
echo - Kolom 'provinsi' sudah ditambahkan
echo - Backend sudah update untuk terima field baru
echo - Frontend sudah update dengan validasi lengkap
echo.
echo ========================================

timeout /t 3 >nul

echo.
echo Membuka test file...
start test-survey-identitas-lengkap-baru.html

timeout /t 2 >nul

echo.
echo Membuka form survey di browser...
start http://localhost:3002/survey?unit_id=test-unit&unit_name=Unit%%20Test

echo.
echo ========================================
echo APLIKASI SIAP!
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
echo PETUNJUK TESTING:
echo ========================================
echo 1. Buka form survey yang sudah terbuka
echo 2. Coba klik "Lanjutkan" tanpa isi - tombol disabled
echo 3. Isi semua field wajib:
echo    - Nomor HP
echo    - Usia (pilih salah satu)
echo    - Jenis Kelamin (pilih salah satu)
echo    - Pendidikan (pilih dari dropdown)
echo    - Pekerjaan (ketik)
echo    - Alamat lengkap (4 dropdown)
echo 4. Klik "Lanjutkan" ke Step 2
echo 5. Isi penilaian layanan (9 unsur)
echo 6. Submit dan cek data tersimpan
echo ========================================
echo.
pause
