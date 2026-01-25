@echo off
chcp 65001 >nul
echo ========================================
echo DIAGNOSA TRACK TICKET
echo ========================================
echo.

echo 🔍 Memeriksa endpoint track ticket...
echo.

echo 📍 Test 1: Cek backend endpoint
echo GET http://localhost:3005/api/public/track/TKT-2026-0003
curl -X GET "http://localhost:3005/api/public/track/TKT-2026-0003" -H "Accept: application/json" -H "Content-Type: application/json"
echo.
echo.

echo 📍 Test 2: Cek Vercel serverless endpoint
echo GET http://localhost:3005/api/public/track-ticket?ticket=TKT-2026-0003
curl -X GET "http://localhost:3005/api/public/track-ticket?ticket=TKT-2026-0003" -H "Accept: application/json" -H "Content-Type: application/json"
echo.
echo.

echo 📍 Test 3: Cek dengan tiket yang tidak ada
echo GET http://localhost:3005/api/public/track-ticket?ticket=TKT-9999-9999
curl -X GET "http://localhost:3005/api/public/track-ticket?ticket=TKT-9999-9999" -H "Accept: application/json" -H "Content-Type: application/json"
echo.
echo.

echo ========================================
echo HASIL DIAGNOSA
echo ========================================
echo.
echo Jika response berupa JSON: ✅ Endpoint berfungsi
echo Jika response berupa HTML: ❌ Endpoint error atau tidak ditemukan
echo Jika "Connection refused": ❌ Backend tidak berjalan
echo.
echo 📋 Langkah selanjutnya:
echo 1. Jika endpoint berfungsi tapi frontend error:
echo    - Periksa CORS headers
echo    - Periksa Content-Type response
echo    - Periksa console browser
echo.
echo 2. Jika endpoint tidak ditemukan:
echo    - Pastikan backend berjalan
echo    - Periksa route di server.ts
echo    - Periksa publicTrackingRoutes.ts
echo.
echo 3. Jika response HTML:
echo    - Ada error di backend
echo    - Periksa backend console
echo    - Periksa Supabase connection
echo.
pause
