@echo off
echo ========================================
echo CEK STATUS INTEGRASI FRONTEND-BACKEND
echo ========================================
echo.

echo [1/5] Checking Backend Server Status...
curl -s http://localhost:3003/api/health > nul
if %errorlevel% equ 0 (
    echo ✅ Backend Server: RUNNING
) else (
    echo ❌ Backend Server: NOT RUNNING
    echo    Please start backend server: cd backend && npm run dev
)
echo.

echo [2/5] Testing Database Connection...
curl -s http://localhost:3003/api/test/units > status_units.json
if %errorlevel% equ 0 (
    echo ✅ Database Connection: OK
    echo    Units table accessible
) else (
    echo ❌ Database Connection: FAILED
    echo    Check database configuration
)
echo.

echo [3/5] Testing Public Endpoints...
curl -s http://localhost:3003/api/public/units > status_public_units.json
if %errorlevel% equ 0 (
    echo ✅ Public Endpoints: OK
    echo    Fallback mechanism working
) else (
    echo ❌ Public Endpoints: FAILED
    echo    Check public routes configuration
)

curl -s http://localhost:3003/api/public/unit-types > status_public_unit_types.json
if %errorlevel% equ 0 (
    echo ✅ Public Unit Types: OK
) else (
    echo ❌ Public Unit Types: FAILED
)
echo.

echo [4/5] Testing Master Data Endpoints...
curl -s http://localhost:3003/api/master-data/public/service-categories > status_service_categories.json
if %errorlevel% equ 0 (
    echo ✅ Service Categories: OK
) else (
    echo ❌ Service Categories: FAILED
)

curl -s http://localhost:3003/api/master-data/public/roles > status_roles.json
if %errorlevel% equ 0 (
    echo ✅ Roles Endpoint: OK
) else (
    echo ❌ Roles Endpoint: FAILED
)

curl -s http://localhost:3003/api/master-data/public/sla-settings > status_sla_settings.json
if %errorlevel% equ 0 (
    echo ✅ SLA Settings: OK
) else (
    echo ❌ SLA Settings: FAILED
)
echo.

echo [5/5] Frontend Integration Check...
echo Checking if frontend server is running...
curl -s http://localhost:3000 > nul
if %errorlevel% equ 0 (
    echo ✅ Frontend Server: RUNNING
    echo    Opening key pages for manual testing...
    start http://localhost:3000/dashboard
    start http://localhost:3000/settings/units
    start http://localhost:3000/settings/master-data
    start http://localhost:3000/users
    start http://localhost:3000/reports
) else (
    echo ❌ Frontend Server: NOT RUNNING
    echo    Please start frontend server: cd frontend && npm run dev
)
echo.

echo ========================================
echo STATUS SUMMARY
echo ========================================
echo.

echo 📊 ENDPOINT STATUS:
if exist status_units.json (
    echo ✅ Units API: Working
) else (
    echo ❌ Units API: Failed
)

if exist status_public_units.json (
    echo ✅ Public Units API: Working
) else (
    echo ❌ Public Units API: Failed
)

if exist status_service_categories.json (
    echo ✅ Service Categories API: Working
) else (
    echo ❌ Service Categories API: Failed
)

if exist status_roles.json (
    echo ✅ Roles API: Working
) else (
    echo ❌ Roles API: Failed
)

if exist status_sla_settings.json (
    echo ✅ SLA Settings API: Working
) else (
    echo ❌ SLA Settings API: Failed
)
echo.

echo 🔧 NEXT STEPS:
echo 1. Login to the application with admin credentials
echo 2. Test each opened page for data loading
echo 3. Check browser console for any remaining errors
echo 4. If you see 403 errors, run PERBAIKI_INTEGRASI_SEKARANG.bat
echo.

echo 📋 MANUAL TESTING CHECKLIST:
echo □ Dashboard loads without errors
echo □ Units Management shows data
echo □ Master Data Settings accessible
echo □ User Management loads users
echo □ Reports page shows data
echo □ No 403 Forbidden errors in console
echo.

echo 🚨 IF ISSUES PERSIST:
echo 1. Run: PERBAIKI_INTEGRASI_SEKARANG.bat
echo 2. Check environment variables
echo 3. Restart both servers
echo 4. Clear browser cache and localStorage
echo.

pause