@echo off
chcp 65001 >nul
echo ========================================
echo JALANKAN DAN TEST FORM SURVEI BARU
echo ========================================
echo.
echo Fitur Baru yang Ditambahkan:
echo ✅ Field Pendidikan (dropdown)
echo ✅ Field Pekerjaan (dropdown)  
echo ✅ Field Jenis Pasien (BPJS/Umum/Asuransi)
echo ✅ 9 Unsur Penilaian dengan 3 Indikator
echo ✅ Scroll yang lebih baik
echo.
echo Memulai aplikasi...
echo.

cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Membuka form survei di browser...
timeout /t 3 /nobreak >nul
start http://localhost:3002/form/survey

echo.
echo ========================================
echo APLIKASI BERJALAN!
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo Form Survei: http://localhost:3002/form/survey
echo.
echo Tekan tombol apapun untuk menutup...
pause >nul
