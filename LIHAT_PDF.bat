@echo off
echo ========================================
echo   LIHAT PDF DI HALAMAN - JEMPOL
echo ========================================
echo.
echo PDF sudah diperbaiki dan sekarang tampil!
echo.
echo Langkah-langkah:
echo.
echo 1. Pastikan frontend dan backend running
echo    (Jika belum, jalankan MULAI_APLIKASI.bat)
echo.
echo 2. Buka browser: http://localhost:3001
echo.
echo 3. Scroll ke bawah ke section "Materi PDF"
echo.
echo 4. Akan tampil 3 card PDF dengan icon hijau
echo.
echo 5. Klik salah satu card untuk membuka PDF
echo.
echo ========================================
echo.
echo Membuka browser...
echo.

start http://localhost:3001

echo.
echo Browser sudah dibuka!
echo.
echo Tips:
echo - Tekan Ctrl+Shift+R untuk hard reload
echo - Scroll ke section "Materi PDF"
echo - Klik card PDF untuk membuka
echo.
echo Dokumentasi:
echo - SOLUSI_PDF_TAMPIL.md
echo - FIX_PDF_TAMPIL.md
echo.
pause
