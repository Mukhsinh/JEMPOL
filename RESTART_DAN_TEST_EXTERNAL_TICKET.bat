@echo off
echo ========================================
echo RESTART DAN TEST EXTERNAL TICKET
echo ========================================
echo.
echo Menghentikan aplikasi yang sedang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Memulai backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 >nul

echo.
echo Memulai frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 >nul

echo.
echo ========================================
echo APLIKASI BERHASIL DIMULAI!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
echo Membuka halaman test...
timeout /t 3 >nul

start http://localhost:3002/test-external-ticket-fixed.html

echo.
echo INSTRUKSI TEST:
echo 1. Pastikan unit_id sudah terisi otomatis
echo 2. Pilih identitas: Personal atau Anonim
echo 3. Isi form sesuai kebutuhan
echo 4. Klik "Kirim External Ticket"
echo 5. Periksa hasilnya
echo.
echo Jika berhasil, akan muncul nomor tiket format: EXT-YYYY-NNNN
echo.
pause
