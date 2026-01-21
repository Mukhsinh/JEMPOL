@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          TEST PERBAIKAN FORM SURVEY & TIKET                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Memulai aplikasi untuk testing...
echo.

REM Start backend
echo [1/2] Starting Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

REM Start frontend
echo [2/2] Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 10 /nobreak >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    PANDUAN TESTING                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 FORM YANG HARUS DITEST:
echo.
echo 1. FORM SURVEY (http://localhost:5173/form/survey)
echo    ✓ Pilih unit tujuan
echo    ✓ Isi jenis layanan
echo    ✓ Isi data responden (minimal nomor HP)
echo    ✓ Beri rating dengan KLIK ICON (lihat label kata di bawah icon)
echo    ✓ Klik "Kirim Survei"
echo    ✓ Cek apakah muncul alert sukses
echo.
echo 2. FORM INTERNAL (http://localhost:5173/form/internal)
echo    ✓ Isi data pelapor (nama, email, departemen)
echo    ✓ Pilih kategori dan prioritas
echo    ✓ Isi judul dan deskripsi
echo    ✓ PASTIKAN TIDAK ADA FITUR UPLOAD FILE
echo    ✓ Klik "Kirim Tiket"
echo    ✓ Cek apakah muncul nomor tiket
echo.
echo 3. FORM EKSTERNAL (http://localhost:5173/form/eksternal)
echo    ✓ Pilih identitas (personal/anonim)
echo    ✓ Pilih jenis layanan
echo    ✓ Isi judul dan deskripsi
echo    ✓ PASTIKAN TIDAK ADA FITUR UPLOAD FILE
echo    ✓ Klik "Kirim Laporan"
echo    ✓ Cek apakah muncul nomor tiket
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo [✓] Aplikasi sedang berjalan...
echo [✓] Buka browser dan test ketiga form di atas
echo.
echo Tekan tombol apapun untuk menutup semua server...
pause >nul

REM Kill all node processes
taskkill /F /IM node.exe >nul 2>&1
echo.
echo [✓] Semua server ditutup
timeout /t 2 /nobreak >nul
