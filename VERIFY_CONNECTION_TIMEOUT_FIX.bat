@echo off
echo ========================================
echo   VERIFIKASI PERBAIKAN CONNECTION TIMEOUT
echo ========================================
echo.

echo 🔍 Memeriksa file yang diperbaiki...
echo.

echo 📁 1. Checking supabaseClient-fixed.ts...
if exist "frontend\src\utils\supabaseClient-fixed.ts" (
    echo ✅ File ditemukan
    findstr /C:"timeout(20000)" "frontend\src\utils\supabaseClient-fixed.ts" >nul
    if !errorlevel! equ 0 (
        echo ✅ Fetch timeout 20 detik: OK
    ) else (
        echo ❌ Fetch timeout tidak ditemukan
    )
    
    findstr /C:"timeout(10000)" "frontend\src\utils\supabaseClient-fixed.ts" >nul
    if !errorlevel! equ 0 (
        echo ✅ Connection check timeout 10 detik: OK
    ) else (
        echo ❌ Connection check timeout tidak ditemukan
    )
) else (
    echo ❌ File tidak ditemukan
)

echo.
echo 📁 2. Checking AuthContext.tsx...
if exist "frontend\src\contexts\AuthContext.tsx" (
    echo ✅ File ditemukan
    findstr /C:"timeout(15000)" "frontend\src\contexts\AuthContext.tsx" >nul
    if !errorlevel! equ 0 (
        echo ✅ Auth initialization timeout 15 detik: OK
    ) else (
        echo ❌ Auth initialization timeout tidak ditemukan
    )
    
    findstr /C:"timeout(20000)" "frontend\src\contexts\AuthContext.tsx" >nul
    if !errorlevel! equ 0 (
        echo ✅ Login timeout 20 detik: OK
    ) else (
        echo ❌ Login timeout tidak ditemukan
    )
    
    findstr /C:"timeout(8000)" "frontend\src\contexts\AuthContext.tsx" >nul
    if !errorlevel! equ 0 (
        echo ✅ Profile fetch timeout 8 detik: OK
    ) else (
        echo ❌ Profile fetch timeout tidak ditemukan
    )
) else (
    echo ❌ File tidak ditemukan
)

echo.
echo 📁 3. Checking supabaseClient.ts...
if exist "frontend\src\utils\supabaseClient.ts" (
    echo ✅ File ditemukan
    findstr /C:"timeout(20000)" "frontend\src\utils\supabaseClient.ts" >nul
    if !errorlevel! equ 0 (
        echo ✅ Fetch timeout 20 detik: OK
    ) else (
        echo ❌ Fetch timeout tidak ditemukan
    )
) else (
    echo ❌ File tidak ditemukan
)

echo.
echo 🧪 4. Membuka test page...
if exist "test-login-timeout-fixed-final.html" (
    echo ✅ Test page ditemukan
    start test-login-timeout-fixed-final.html
    echo 🌐 Test page dibuka di browser
) else (
    echo ❌ Test page tidak ditemukan
)

echo.
echo 📋 RINGKASAN PERBAIKAN:
echo ================================
echo ✅ Fetch timeout: 3s → 20s
echo ✅ Connection check: 3s → 10s  
echo ✅ Auth initialization: 30s → 15s
echo ✅ Login timeout: 30s → 20s
echo ✅ Profile fetch: ∞ → 8s
echo ✅ Quick test: ∞ → 5s
echo ✅ Delay initial check: +1s
echo.

echo 🚀 Langkah selanjutnya:
echo 1. Jalankan: RESTART_APP_CONNECTION_TIMEOUT_FIXED.bat
echo 2. Tunggu aplikasi loading (10-15 detik)
echo 3. Test login dengan: admin@jempol.com / admin123
echo 4. Monitor console log untuk memastikan tidak ada timeout error
echo.

pause