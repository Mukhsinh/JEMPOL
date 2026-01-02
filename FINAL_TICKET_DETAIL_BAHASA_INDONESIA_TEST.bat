@echo off
echo ========================================
echo   TEST HALAMAN DETAIL TIKET BAHASA INDONESIA
echo ========================================
echo.
echo Memulai test untuk halaman detail tiket dengan ID: 990e8400-e29b-41d4-a716-446655440001
echo.

echo [1/5] Memulai backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo [2/5] Memulai frontend server...
cd ../frontend
start "Frontend Server" cmd /k "npm start"
timeout /t 5 /nobreak > nul

echo [3/5] Membuka halaman test...
cd ..
start test-ticket-detail-bahasa-indonesia.html
timeout /t 2 /nobreak > nul

echo [4/5] Membuka halaman detail tiket langsung...
start http://localhost:3000/tickets/990e8400-e29b-41d4-a716-446655440001
timeout /t 2 /nobreak > nul

echo [5/5] Test selesai!
echo.
echo ========================================
echo   INSTRUKSI TEST
echo ========================================
echo.
echo 1. Periksa halaman detail tiket di browser
echo 2. Pastikan semua teks dalam bahasa Indonesia
echo 3. Test tombol "Selesaikan" - harus mengubah status ke resolved
echo 4. Test tombol "Eskalasi" - harus mengubah status ke escalated  
echo 5. Test tombol "Tugaskan" - harus membuka modal dan assign ke user
echo 6. Test "Kirim Balasan" - harus menambah response baru
echo 7. Periksa integrasi database - semua perubahan tersimpan
echo.
echo Tombol yang harus berfungsi:
echo - ✅ Selesaikan (Resolve)
echo - ⚠️  Eskalasi (Escalate) 
echo - 👤 Tugaskan (Assign)
echo - 💬 Kirim Balasan (Send Response)
echo.
echo Semua teks harus dalam Bahasa Indonesia!
echo.
pause