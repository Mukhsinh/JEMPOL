@echo off
echo ========================================
echo 🔍 VERIFIKASI KONFIGURASI FINAL
echo ========================================

echo.
echo 1️⃣ Memeriksa file .env...
echo.
echo Frontend .env:
if exist "frontend\.env" (
    echo ✅ File ditemukan
    findstr "VITE_SUPABASE_URL" frontend\.env
    findstr "VITE_SUPABASE_ANON_KEY" frontend\.env
) else (
    echo ❌ File tidak ditemukan
)

echo.
echo Backend .env:
if exist "backend\.env" (
    echo ✅ File ditemukan
    findstr "SUPABASE_URL" backend\.env
    findstr "SUPABASE_ANON_KEY" backend\.env
) else (
    echo ❌ File tidak ditemukan
)

echo.
echo 2️⃣ Memeriksa file supabaseClient...
if exist "frontend\src\utils\supabaseClient.ts" (
    echo ✅ supabaseClient.ts ditemukan
    findstr "jxxzbdivafzzwqhagwrf" frontend\src\utils\supabaseClient.ts >nul
    if %errorlevel%==0 (
        echo ✅ URL sudah benar
    ) else (
        echo ❌ URL masih salah
    )
) else (
    echo ❌ supabaseClient.ts tidak ditemukan
)

echo.
echo 3️⃣ Memeriksa port yang digunakan...
netstat -an | findstr ":3001" >nul
if %errorlevel%==0 (
    echo ✅ Frontend port 3001 aktif
) else (
    echo ❌ Frontend port 3001 tidak aktif
)

netstat -an | findstr ":3003" >nul
if %errorlevel%==0 (
    echo ✅ Backend port 3003 aktif
) else (
    echo ❌ Backend port 3003 tidak aktif
)

echo.
echo 4️⃣ Membuka test files...
if exist "test-login-simple-final-complete.html" (
    echo ✅ Test login file tersedia
    start "" "test-login-simple-final-complete.html"
) else (
    echo ❌ Test login file tidak ditemukan
)

if exist "clear-cache-and-test-login.html" (
    echo ✅ Clear cache test file tersedia
) else (
    echo ❌ Clear cache test file tidak ditemukan
)

echo.
echo ========================================
echo 📋 RINGKASAN KONFIGURASI:
echo ========================================
echo URL Supabase: https://jxxzbdivafzzwqhagwrf.supabase.co
echo Email Admin: admin@jempol.com
echo Password: admin123
echo Frontend: http://localhost:3001
echo Backend: http://localhost:3003
echo ========================================
echo.
pause