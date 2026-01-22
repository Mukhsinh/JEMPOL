@echo off
echo ========================================
echo PERBAIKAN PATIENT TYPES CRUD
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. ✅ Menambahkan logging detail untuk update dan delete
echo 2. ✅ Menambahkan error handling yang lebih baik
echo 3. ✅ Menampilkan semua data (aktif dan tidak aktif)
echo 4. ✅ Fallback ke Supabase jika API gagal
echo.
echo ========================================
echo MEMULAI APLIKASI
echo ========================================
echo.

cd backend
echo [Backend] Starting server...
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

cd ..
cd frontend
echo [Frontend] Starting development server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ⏳ Menunggu server siap (15 detik)...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo MEMBUKA APLIKASI
echo ========================================
echo.
start "" "http://localhost:3002/master-data/patient-types"

echo.
echo ✅ Aplikasi dibuka!
echo.
echo 📝 Cara test:
echo 1. Login ke aplikasi
echo 2. Buka halaman Master Data ^> Jenis Pasien
echo 3. Coba EDIT salah satu data
echo 4. Coba HAPUS salah satu data
echo 5. Buka Console Browser (F12) untuk melihat log detail
echo.
echo Jika masih error, jalankan: TEST_PATIENT_TYPES_CRUD.bat
echo untuk test langsung ke Supabase
echo.
pause
