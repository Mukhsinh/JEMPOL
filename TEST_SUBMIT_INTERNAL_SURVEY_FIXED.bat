@echo off
echo ========================================
echo TEST SUBMIT TIKET INTERNAL DAN SURVEY
echo ========================================
echo.
echo Perbaikan telah diterapkan!
echo.
echo PERUBAHAN YANG DILAKUKAN:
echo.
echo 1. Tiket Internal:
echo    - Type: 'information' ^=^> 'complaint'
echo    - Tambah field: submitter_address, ip_address, user_agent
echo    - Tambah info department/position ke description
echo.
echo 2. Survey:
echo    - Tambah field: ip_address, user_agent
echo    - Perbaiki qr_code field
echo.
echo ========================================
echo CARA TESTING:
echo ========================================
echo.
echo 1. RESTART BACKEND:
echo    cd backend
echo    npm run dev
echo.
echo 2. TEST TIKET INTERNAL:
echo    - Buka: http://localhost:5173/form/internal?qr=...
echo    - Atau: http://localhost:5173/tickets/internal
echo    - Isi semua field
echo    - Klik Submit
echo    - Expected: Berhasil tanpa error
echo.
echo 3. TEST SURVEY:
echo    - Buka: http://localhost:5173/form/survey?qr=...
echo    - Atau: http://localhost:5173/survey
echo    - Isi semua field
echo    - Klik Submit
echo    - Expected: Berhasil tanpa error
echo.
echo ========================================
echo VERIFIKASI DATABASE:
echo ========================================
echo.
echo Setelah submit berhasil, cek di Supabase:
echo.
echo 1. Tabel 'tickets':
echo    - Cari tiket dengan type = 'complaint'
echo    - Pastikan semua field terisi
echo    - Cek description ada info department/position
echo.
echo 2. Tabel 'public_surveys':
echo    - Cari survey terbaru
echo    - Pastikan semua field terisi
echo.
echo ========================================
echo.
pause
