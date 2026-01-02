@echo off
echo ========================================
echo    TEST APP SETTINGS API ENDPOINTS
echo ========================================
echo.

echo [INFO] Memulai test API App Settings...
echo.

echo [STEP 1] Cek status backend...
curl -s http://localhost:5000/api/app-settings/public >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 5000
) else (
    echo ❌ Backend is not running!
    echo [ACTION] Starting backend...
    start /min cmd /c "cd backend && npm start"
    echo [INFO] Waiting for backend to start...
    timeout /t 10 /nobreak >nul
)

echo.
echo [STEP 2] Opening API test page...
start "" "test-app-settings-api.html"

echo.
echo [INFO] Test page opened in browser
echo [INFO] Available tests:
echo   ✓ Connection Test
echo   ✓ Get Public Settings
echo   ✓ Get All Settings (Protected)
echo   ✓ Update Settings
echo   ✓ Single Setting Update
echo   ✓ Run All Tests
echo.

echo [INFO] Manual API tests:
echo.
echo GET Public Settings:
echo curl http://localhost:5000/api/app-settings/public
echo.
echo GET All Settings (with auth):
echo curl -H "Authorization: Bearer mock-token" http://localhost:5000/api/app-settings
echo.
echo PUT Update Settings:
echo curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer mock-token" -d "{\"app_name\":\"Test App\"}" http://localhost:5000/api/app-settings
echo.

pause