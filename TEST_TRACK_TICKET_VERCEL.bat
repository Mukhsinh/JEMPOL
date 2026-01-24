@echo off
echo ========================================
echo TEST TRACK TICKET - VERCEL FIX
echo ========================================
echo.

echo [1/3] Testing app-settings endpoint...
curl -X GET "http://localhost:3002/api/public/app-settings" -H "Accept: application/json"
echo.
echo.

echo [2/3] Testing track-ticket endpoint...
curl -X GET "http://localhost:3002/api/public/track-ticket?ticket=TKT-2025-0001" -H "Accept: application/json"
echo.
echo.

echo [3/3] Opening browser test...
start http://localhost:3002/track-ticket?ticket=TKT-2025-0001
echo.

echo ========================================
echo TEST SELESAI
echo ========================================
echo.
echo Periksa:
echo 1. Response JSON valid (tidak ada error parsing)
echo 2. Data app settings muncul dengan benar
echo 3. Data tracking ticket muncul dengan benar
echo 4. Tidak ada error di console browser
echo.
pause
