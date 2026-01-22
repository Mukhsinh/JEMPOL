@echo off
echo ========================================
echo TEST QR MANAGEMENT LOADING FIX
echo ========================================
echo.
echo Membuka halaman QR Management untuk test loading...
echo.
echo PERBAIKAN YANG DILAKUKAN:
echo 1. Timeout dikurangi dari 10 detik ke 5 detik di komponen
echo 2. Timeout API dikurangi dari 8 detik ke 3 detik
echo 3. Analytics dinonaktifkan untuk loading lebih cepat
echo 4. Fallback Supabase dengan timeout 2 detik
echo 5. Request paralel untuk units dan QR codes
echo.
echo Halaman seharusnya loading dalam 3-5 detik maksimal
echo Jika lebih dari 5 detik, akan muncul pesan timeout
echo.
pause
start http://localhost:5173/tickets/qr-management
echo.
echo Halaman QR Management dibuka di browser
echo Perhatikan waktu loading dan responsivitas
echo.
pause
