@echo off
echo ========================================
echo TEST VERCEL INTERNAL TICKETS API
echo ========================================
echo.
echo Membuka test page untuk verifikasi endpoint...
echo.
echo INSTRUKSI:
echo 1. Jalankan test secara berurutan (Test 1, 2, 3)
echo 2. Test 2 akan memberikan unit ID untuk Test 3
echo 3. Copy unit ID dan paste ke form Test 3
echo 4. Perhatikan response - harus JSON, bukan HTML
echo.
echo Jika response adalah HTML:
echo - Endpoint tidak ditemukan (404)
echo - Routing Vercel bermasalah
echo - File API tidak ter-deploy
echo.
pause

start chrome "test-vercel-internal-tickets.html"
if errorlevel 1 start msedge "test-vercel-internal-tickets.html"
if errorlevel 1 start firefox "test-vercel-internal-tickets.html"
if errorlevel 1 start "" "test-vercel-internal-tickets.html"
