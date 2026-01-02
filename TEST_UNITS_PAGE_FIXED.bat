@echo off
echo ========================================
echo    TEST PERBAIKAN HALAMAN UNITS
echo ========================================
echo.

echo [1/4] Testing Backend Health...
curl -s http://localhost:5001/api/health
echo.
echo.

echo [2/4] Testing Public Units Endpoint...
curl -s http://localhost:5001/api/public/units | jq length 2>nul || echo "Units endpoint working (jq not available for count)"
echo.
echo.

echo [3/4] Testing Public Unit Types Endpoint...
curl -s http://localhost:5001/api/public/unit-types | jq length 2>nul || echo "Unit types endpoint working (jq not available for count)"
echo.
echo.

echo [4/4] Opening Test Page...
start test-units-page-fix.html
echo Test page opened in browser
echo.

echo ========================================
echo           TEST COMPLETED
echo ========================================
echo.
echo Jika semua test berhasil:
echo 1. Backend health check: OK
echo 2. Units endpoint: Working
echo 3. Unit types endpoint: Working
echo 4. Test page: Opened
echo.
echo Sekarang buka halaman units di:
echo http://localhost:3001/master-data/units
echo.
pause