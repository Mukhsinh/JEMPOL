@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     🚀 DEPLOY VERCEL DENGAN ENVIRONMENT VARIABLES             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Panduan Deploy:
echo    1. Pastikan Vercel CLI sudah terinstall (npm i -g vercel)
echo    2. Login ke Vercel (vercel login)
echo    3. Set environment variables di Vercel Dashboard
echo    4. Deploy aplikasi
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI belum terinstall!
    echo.
    echo 📦 Install Vercel CLI dengan perintah:
    echo    npm install -g vercel
    echo.
    pause
    exit /b 1
)

echo ✅ Vercel CLI terdeteksi
echo.

REM Check login status
echo 🔐 Checking Vercel login status...
vercel whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Belum login ke Vercel!
    echo.
    echo 🔑 Silakan login terlebih dahulu:
    vercel login
    echo.
    pause
    exit /b 1
)

echo ✅ Sudah login ke Vercel
echo.

echo ═══════════════════════════════════════════════════════════════
echo.
echo 📝 LANGKAH 1: Set Environment Variables
echo.
echo ⚠️  PENTING: Environment variables HARUS diset di Vercel Dashboard!
echo.
echo 🌐 Buka: https://vercel.com/dashboard
echo    → Pilih project Anda
echo    → Settings → Environment Variables
echo.
echo 📋 Variables yang HARUS diset:
echo.
echo    1. VITE_SUPABASE_URL
echo       Value: https://jxxzbdivafzzwqhagwrf.supabase.co
echo.
echo    2. VITE_SUPABASE_ANON_KEY
echo       Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
echo.
echo    3. VITE_SUPABASE_SERVICE_ROLE_KEY
echo       Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo ❓ Apakah environment variables sudah diset di Vercel Dashboard?
echo.
set /p ENV_SET="Ketik 'y' jika sudah, atau 'n' untuk membuka dashboard: "

if /i "%ENV_SET%"=="n" (
    echo.
    echo 🌐 Membuka Vercel Dashboard...
    start https://vercel.com/dashboard
    echo.
    echo ⏸️  Setelah set environment variables, jalankan script ini lagi.
    echo.
    pause
    exit /b 0
)

if /i "%ENV_SET%" NEQ "y" (
    echo.
    echo ❌ Input tidak valid. Keluar...
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📝 LANGKAH 2: Deploy ke Vercel
echo.
echo 🚀 Memulai deployment...
echo.

REM Deploy to production
vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo ✅ DEPLOYMENT BERHASIL!
    echo.
    echo 📝 LANGKAH 3: Verifikasi Deployment
    echo.
    echo 🧪 Test endpoint units:
    echo    https://your-app.vercel.app/api/public/units
    echo.
    echo 🧪 Test form internal ticket:
    echo    https://your-app.vercel.app/form/internal
    echo.
    echo 📋 Checklist Verifikasi:
    echo    □ Buka /api/public/units - harus return data units
    echo    □ Buka form internal ticket
    echo    □ Dropdown unit harus terisi dari master data
    echo    □ Submit form harus berhasil
    echo.
    echo 🔍 Jika ada masalah:
    echo    1. Buka browser console (F12)
    echo    2. Lihat error di Network tab
    echo    3. Cek response dari /api/public/units
    echo    4. Buka test-vercel-units-integration.html untuk debugging
    echo.
    echo ═══════════════════════════════════════════════════════════════
) else (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo ❌ DEPLOYMENT GAGAL!
    echo.
    echo 🔍 Troubleshooting:
    echo    1. Cek error message di atas
    echo    2. Pastikan sudah login: vercel login
    echo    3. Pastikan di folder project yang benar
    echo    4. Cek vercel.json configuration
    echo.
    echo 📚 Dokumentasi:
    echo    - VERCEL_ENV_SETUP_LENGKAP.md
    echo    - PANDUAN_DEPLOY_VERCEL_FINAL.md
    echo.
    echo ═══════════════════════════════════════════════════════════════
)

echo.
pause
