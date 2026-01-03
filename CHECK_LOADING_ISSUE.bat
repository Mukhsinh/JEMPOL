@echo off
echo ========================================
echo    DIAGNOSA MASALAH LOADING APLIKASI
echo ========================================
echo.

echo 🔍 Mengecek status aplikasi...
echo.

echo 📁 Checking project structure...
if exist "frontend" (
    echo ✅ Frontend folder exists
) else (
    echo ❌ Frontend folder missing
)

if exist "backend" (
    echo ✅ Backend folder exists
) else (
    echo ❌ Backend folder missing
)

if exist "frontend/package.json" (
    echo ✅ Frontend package.json exists
) else (
    echo ❌ Frontend package.json missing
)

if exist "backend/package.json" (
    echo ✅ Backend package.json exists
) else (
    echo ❌ Backend package.json missing
)

echo.
echo 🔧 Checking environment files...
if exist "frontend/.env" (
    echo ✅ Frontend .env exists
    echo 📋 Frontend .env content:
    type "frontend\.env"
) else (
    echo ❌ Frontend .env missing
)

echo.
if exist "backend/.env" (
    echo ✅ Backend .env exists
    echo 📋 Backend .env content:
    type "backend\.env"
) else (
    echo ❌ Backend .env missing
)

echo.
echo 📦 Checking node_modules...
if exist "frontend/node_modules" (
    echo ✅ Frontend node_modules exists
) else (
    echo ❌ Frontend node_modules missing - run npm install
)

if exist "backend/node_modules" (
    echo ✅ Backend node_modules exists
) else (
    echo ❌ Backend node_modules missing - run npm install
)

echo.
echo 🌐 Checking if ports are in use...
netstat -an | findstr ":3001" > nul
if %errorlevel% == 0 (
    echo ⚠️ Port 3001 is in use
) else (
    echo ✅ Port 3001 is available
)

netstat -an | findstr ":3003" > nul
if %errorlevel% == 0 (
    echo ⚠️ Port 3003 is in use
) else (
    echo ✅ Port 3003 is available
)

echo.
echo 🔧 Checking key files...
if exist "frontend/src/App.tsx" (
    echo ✅ App.tsx exists
) else (
    echo ❌ App.tsx missing
)

if exist "frontend/src/contexts/AuthContext.tsx" (
    echo ✅ AuthContext.tsx exists
) else (
    echo ❌ AuthContext.tsx missing
)

if exist "frontend/src/utils/supabaseClient.ts" (
    echo ✅ supabaseClient.ts exists
) else (
    echo ❌ supabaseClient.ts missing
)

echo.
echo 📋 DIAGNOSA SELESAI
echo.
echo 💡 Langkah selanjutnya:
echo 1. Jika ada file missing, jalankan: RESTART_APP_LOADING_FIX.bat
echo 2. Test koneksi Supabase: buka test-supabase-connection-fix.html
echo 3. Jika masih bermasalah, periksa console log di browser (F12)
echo.
pause