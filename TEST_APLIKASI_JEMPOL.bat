@echo off
echo ========================================
echo    TEST APLIKASI JEMPOL
echo ========================================
echo.
echo Testing koneksi backend...
curl -s http://localhost:3004/api/health
echo.
echo.
echo Testing koneksi database...
curl -s http://localhost:3004/api/test/units
echo.
echo.
echo Testing login endpoint...
curl -s -X POST http://localhost:3004/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@jempol.com\",\"password\":\"admin123\"}"
echo.
echo.
echo ========================================
echo Test selesai!
echo ========================================
pause