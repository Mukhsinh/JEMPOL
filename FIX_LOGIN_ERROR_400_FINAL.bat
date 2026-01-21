@echo off
chcp 65001 >nul
color 0A
cls

echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🔧 PERBAIKAN ERROR 400 - LOGIN JEMPOL 🔧             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Script ini akan memperbaiki:
echo    ✓ Invalid session di localStorage
echo    ✓ Password hash yang tidak cocok
echo    ✓ User authentication di Supabase
echo.
echo ⚠️  PASTIKAN:
echo    1. Backend sudah running di port 3004
echo    2. Koneksi internet stabil
echo    3. Supabase credentials benar
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo 📦 Step 1: Install dependencies...
echo ═══════════════════════════════════════════════════════════════
call npm install @supabase/supabase-js bcryptjs

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔧 Step 2: Menjalankan script perbaikan...
echo ═══════════════════════════════════════════════════════════════
node fix-login-error-400-final.js

if errorlevel 1 (
    echo.
    echo ❌ Script gagal dijalankan!
    echo 💡 Coba jalankan manual: node fix-login-error-400-final.js
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🌐 Step 3: Membuka halaman clear session...
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📝 Halaman akan terbuka di browser
echo    Klik "Clear Session" untuk membersihkan session invalid
echo    Kemudian klik "Test Login" untuk test login
echo.
timeout /t 3 /nobreak >nul

start "" "clear-invalid-session-and-login.html"

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ PERBAIKAN SELESAI!
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📝 Kredensial Login:
echo    Email: admin@jempol.com
echo    Password: Admin123!@#
echo.
echo 💡 Langkah selanjutnya:
echo    1. Di halaman yang terbuka, klik "Clear Session"
echo    2. Klik "Test Login" untuk test
echo    3. Jika berhasil, klik "Buka Halaman Login"
echo    4. Login dengan kredensial di atas
echo.
echo 🔍 Jika masih error:
echo    1. Clear browser cache (Ctrl+Shift+Delete)
echo    2. Restart browser
echo    3. Coba login lagi
echo.
pause
