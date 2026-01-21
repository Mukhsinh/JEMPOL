@echo off
echo ========================================
echo TEST FORM TIKET INTERNAL
echo ========================================
echo.
echo Membuka form tiket internal untuk testing...
echo.
echo Pastikan:
echo 1. Dropdown unit terisi otomatis dari data master
echo 2. Tidak ada fitur lampiran
echo 3. Tiket berhasil disimpan
echo.
start http://localhost:3002/form/internal
echo.
echo Form dibuka di browser!
echo Silakan test form dan lihat console untuk log.
echo.
pause
