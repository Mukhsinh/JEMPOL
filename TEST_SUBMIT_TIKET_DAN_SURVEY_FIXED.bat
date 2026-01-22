@echo off
echo ========================================
echo TEST SUBMIT TIKET DAN SURVEY - FIXED
echo ========================================
echo.

echo Pastikan backend sudah berjalan di port 3004
echo.

echo Testing endpoints...
node test-submit-endpoints-fixed.js

echo.
echo ========================================
echo Test selesai!
echo ========================================
pause
