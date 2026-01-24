@echo off
chcp 65001 >nul
echo ========================================
echo JALANKAN DAN TEST FORM SURVEY
echo Perbaikan Usia, Pekerjaan, dan Alamat
echo ========================================
echo.
echo ✅ Perubahan yang sudah dilakukan:
echo.
echo 1. USIA - Dropdown
echo    - Kurang dari 20 Tahun
echo    - 20 - 40 Tahun
echo    - 41 - 60 Tahun
echo    - Lebih dari 60 Tahun
echo.
echo 2. PEKERJAAN - Dropdown
echo    - PNS, TNI/Polri, Swasta, Wiraswasta
echo    - Petani, Nelayan, Pelajar/Mahasiswa
echo    - Ibu Rumah Tangga, Pensiunan, Lainnya
echo.
echo 3. ALAMAT KAB/KOTA - Dropdown 4 Wilayah
echo    - Kota Pekalongan
echo    - Kabupaten Pekalongan
echo    - Kabupaten Batang
echo    - Kabupaten Pemalang
echo.
echo 4. KECAMATAN - Dinamis
echo    - Otomatis muncul sesuai kab/kota
echo    - Data lengkap untuk semua wilayah
echo.
echo 5. ALAMAT DETAIL - Input Manual
echo    - Textarea untuk alamat lengkap
echo    - Jalan, RT/RW, Kelurahan/Desa
echo.
echo ========================================
echo.

echo [1/3] Membuka halaman test...
start test-survey-form-alamat-perbaikan.html
timeout /t 2 /nobreak >nul

echo [2/3] Menjalankan backend...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Menjalankan frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo ✅ APLIKASI BERHASIL DIJALANKAN!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo Form Survey: http://localhost:3002/form/survey
echo.
echo Silakan test form survey dengan:
echo - Pilih kab/kota
echo - Kecamatan akan muncul otomatis
echo - Isi alamat detail secara manual
echo.
pause
