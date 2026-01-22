@echo off
echo ========================================
echo TEST INTERNAL TICKET - VERCEL FIX
echo ========================================
echo.
echo Perbaikan yang diterapkan:
echo 1. Validasi response kosong di axios
echo 2. Transform response untuk handle empty response
echo 3. Multiple environment variable names untuk Supabase
echo 4. Error logging yang lebih detail
echo 5. Content-Type header yang eksplisit
echo.
echo Membuka aplikasi...
echo.

start http://localhost:5173/tickets/create-internal

echo.
echo Silakan test submit tiket internal.
echo Periksa console browser untuk log detail.
echo.
pause
