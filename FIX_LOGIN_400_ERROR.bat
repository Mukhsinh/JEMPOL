@echo off
chcp 65001 >nul
title Fix Login 400 Error - KISS

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         FIX LOGIN 400 ERROR - KISS                         ║
echo ║         Memperbaiki Error 400 pada Login                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📋 Langkah perbaikan:
echo    1. Membersihkan session invalid
echo    2. Memperbaiki konfigurasi Supabase
echo    3. Membuka halaman clear session
echo.

echo ⏳ Memulai perbaikan...
echo.

REM 1. Install dependencies jika belum
echo 1️⃣ Checking dependencies...
if not exist "node_modules\bcryptjs" (
    echo    Installing bcryptjs...
    call npm install bcryptjs --save 2>nul
)
if not exist "node_modules\@supabase\supabase-js" (
    echo    Installing @supabase/supabase-js...
    call npm install @supabase/supabase-js --save 2>nul
)
echo    ✅ Dependencies ready
echo.

REM 2. Run fix script
echo 2️⃣ Running fix script...
node fix-login-400-error-final.js
echo.

REM 3. Open clear session page
echo 3️⃣ Membuka halaman clear session...
timeout /t 2 /nobreak >nul
start "" "clear-invalid-session-final.html"
echo    ✅ Halaman dibuka
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                    PERBAIKAN SELESAI                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📝 Langkah selanjutnya:
echo    1. Di halaman yang terbuka, klik "Clear Session & Cache"
echo    2. Tunggu hingga proses selesai
echo    3. Klik "Ke Halaman Login"
echo    4. Login dengan kredensial yang benar
echo.
echo 💡 Kredensial default (jika baru dibuat):
echo    Email: admin@jempol.com
echo    Password: admin123
echo.

pause
