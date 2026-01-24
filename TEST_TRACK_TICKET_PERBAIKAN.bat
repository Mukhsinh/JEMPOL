@echo off
echo ========================================
echo TEST HALAMAN PELACAKAN TIKET - PERBAIKAN
echo ========================================
echo.
echo Perbaikan:
echo 1. Header dari pengaturan aplikasi
echo 2. Footer terintegrasi dengan pengaturan
echo 3. Rincian tiket lengkap, tidak overflow
echo 4. 'AI Status Insight' jadi 'Admin'
echo 5. Call Center dan WhatsApp dari pengaturan
echo.

start http://localhost:3005/track-ticket
start http://localhost:3005/settings/app-settings

echo.
echo Halaman dibuka!
pause

