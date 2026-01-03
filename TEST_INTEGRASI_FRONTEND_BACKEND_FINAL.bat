@echo off
echo ========================================
echo TESTING INTEGRASI FRONTEND-BACKEND FINAL
echo ========================================
echo.

echo [1/5] Menjalankan perbaikan autentikasi...
node fix-auth-integration-final.js
echo.

echo [2/5] Testing koneksi database...
curl -s http://localhost:3003/api/test/units > test_units_result.json
if %errorlevel% equ 0 (
    echo ✅ Units endpoint: OK
) else (
    echo ❌ Units endpoint: FAILED
)

curl -s http://localhost:3003/api/test/sla-settings > test_sla_result.json
if %errorlevel% equ 0 (
    echo ✅ SLA Settings endpoint: OK
) else (
    echo ❌ SLA Settings endpoint: FAILED
)
echo.

echo [3/5] Testing public endpoints...
curl -s http://localhost:3003/api/public/units > test_public_units.json
if %errorlevel% equ 0 (
    echo ✅ Public Units endpoint: OK
) else (
    echo ❌ Public Units endpoint: FAILED
)

curl -s http://localhost:3003/api/public/unit-types > test_public_unit_types.json
if %errorlevel% equ 0 (
    echo ✅ Public Unit Types endpoint: OK
) else (
    echo ❌ Public Unit Types endpoint: FAILED
)
echo.

echo [4/5] Testing master data endpoints...
curl -s http://localhost:3003/api/master-data/public/service-categories > test_service_categories.json
if %errorlevel% equ 0 (
    echo ✅ Service Categories endpoint: OK
) else (
    echo ❌ Service Categories endpoint: FAILED
)

curl -s http://localhost:3003/api/master-data/public/roles > test_roles.json
if %errorlevel% equ 0 (
    echo ✅ Roles endpoint: OK
) else (
    echo ❌ Roles endpoint: FAILED
)
echo.

echo [5/5] Membuka aplikasi untuk testing manual...
timeout /t 2 /nobreak > nul
start http://localhost:3000/dashboard
echo.

echo ========================================
echo TESTING SELESAI
echo ========================================
echo.
echo Periksa hasil testing di file JSON yang dibuat.
echo Buka browser untuk testing manual halaman dashboard.
echo.
pause