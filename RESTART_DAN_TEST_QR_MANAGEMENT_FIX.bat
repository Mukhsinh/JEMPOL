@echo off
echo ========================================
echo RESTART DAN TEST QR MANAGEMENT FIX
echo ========================================
echo.
echo Perbaikan Loading QR Management:
echo - Request API paralel (lebih cepat)
echo - Timeout 8 detik (tidak hang)
echo - Loading state informatif
echo - Error handling lebih baik
echo.
echo ========================================
echo.

echo [1/3] Menghentikan aplikasi yang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Memulai aplikasi...
echo.
echo Starting Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 8 /nobreak >nul

echo.
echo [3/3] Membuka halaman QR Management untuk testing...
timeout /t 3 /nobreak >nul
start http://localhost:5173/tickets/qr-management

echo.
echo ========================================
echo APLIKASI SIAP!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo QR Management: http://localhost:5173/tickets/qr-management
echo.
echo ========================================
echo PETUNJUK TESTING:
echo ========================================
echo.
echo 1. Halaman QR Management akan terbuka otomatis
echo 2. Perhatikan waktu loading (maksimal 8 detik)
echo 3. Tidak akan ada "Memverifikasi akses..." yang lama
echo 4. Jika koneksi lambat, akan muncul pesan timeout
echo 5. Halaman tetap responsif meskipun loading
echo.
echo HASIL YANG DIHARAPKAN:
echo - Loading cepat (2-8 detik)
echo - Tidak hang/freeze
echo - Pesan error jelas jika timeout
echo - Data QR Code tampil dengan baik
echo.
echo Tekan Ctrl+C untuk menghentikan aplikasi
echo.
pause
