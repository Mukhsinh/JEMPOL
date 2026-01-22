@echo off
echo ========================================
echo TEST PATIENT TYPES DELETE FIX
echo ========================================
echo.
echo Membuka halaman Patient Types untuk testing...
echo.
echo TESTING CHECKLIST:
echo [1] Edit Patient Type - Harus berhasil
echo [2] Hapus Patient Type - Harus berhasil tanpa error
echo [3] Cek SLA Settings - Data masih ada
echo.
echo Tekan Ctrl+C untuk keluar dari browser
echo.
start http://localhost:3002/master-data/patient-types
echo.
echo Browser dibuka!
echo Silakan test fitur edit dan hapus patient types
echo.
pause
