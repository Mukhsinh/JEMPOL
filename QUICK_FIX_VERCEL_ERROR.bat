@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🚀 QUICK FIX VERCEL ERROR - PANDUAN CEPAT         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.

echo ┌─────────────────────────────────────────────────────────────┐
echo │  LANGKAH 1: DEPLOY PERBAIKAN                                │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo Menambahkan file yang diubah...
git add vercel.json
git add PERBAIKAN_ERROR_VERCEL_DEPLOY.md
git add CEK_VERCEL_ENV_VARS.md
git add test-vercel-api-fixed.html
git add RINGKASAN_PERBAIKAN_ERROR_VERCEL.md
git add DEPLOY_VERCEL_FIX_ERROR.bat
git add QUICK_FIX_VERCEL_ERROR.bat

echo.
echo Commit perubahan...
git commit -m "fix: perbaiki routing dan CORS Vercel API untuk mengatasi error 405 dan non-JSON response"

echo.
echo Push ke GitHub...
git push origin main

echo.
echo ✅ Kode sudah di-push ke GitHub!
echo ⏳ Vercel akan otomatis deploy dalam 1-2 menit...
echo.
timeout /t 3 >nul

echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │  LANGKAH 2: SET ENVIRONMENT VARIABLES (MANUAL)              │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo 🌐 Buka browser dan kunjungi:
echo    https://vercel.com/dashboard
echo.
echo 📝 Langkah-langkah:
echo.
echo    1. Pilih project Anda
echo    2. Klik "Settings" → "Environment Variables"
echo    3. Tambahkan 4 environment variables:
echo.
echo       ┌─────────────────────────────────────────────────────┐
echo       │ Name: VITE_SUPABASE_URL                             │
echo       │ Value: https://xxxxxxxxxx.supabase.co               │
echo       │ Environment: Production, Preview, Development       │
echo       └─────────────────────────────────────────────────────┘
echo.
echo       ┌─────────────────────────────────────────────────────┐
echo       │ Name: VITE_SUPABASE_ANON_KEY                        │
echo       │ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...      │
echo       │ Environment: Production, Preview, Development       │
echo       └─────────────────────────────────────────────────────┘
echo.
echo       ┌─────────────────────────────────────────────────────┐
echo       │ Name: VITE_SUPABASE_SERVICE_ROLE_KEY                │
echo       │ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...      │
echo       │ Environment: Production, Preview, Development       │
echo       └─────────────────────────────────────────────────────┘
echo.
echo       ┌─────────────────────────────────────────────────────┐
echo       │ Name: NODE_ENV                                      │
echo       │ Value: production                                   │
echo       │ Environment: Production (only)                      │
echo       └─────────────────────────────────────────────────────┘
echo.
echo    4. Klik "Save" untuk setiap variable
echo    5. Setelah semua tersimpan, klik "Deployments"
echo    6. Klik titik tiga (...) di deployment terakhir
echo    7. Klik "Redeploy"
echo    8. Tunggu 2-5 menit hingga selesai
echo.
echo 💡 TIP: Copy value dari file .env atau frontend/.env lokal Anda
echo.
timeout /t 5 >nul

echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │  LANGKAH 3: VERIFIKASI                                      │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo Setelah redeploy selesai:
echo.
echo 1. Buka file: test-vercel-api-fixed.html di browser
echo 2. Masukkan Vercel App URL Anda
echo 3. Klik "Test Semua Endpoint"
echo 4. Pastikan semua test ✅ Success
echo.
echo ATAU test manual:
echo.
echo 1. Buka aplikasi di browser
echo 2. Tekan F12 (Developer Tools)
echo 3. Buka tab Console
echo 4. Refresh halaman (F5)
echo 5. Pastikan tidak ada error merah
echo.
timeout /t 3 >nul

echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │  📚 DOKUMENTASI LENGKAP                                     │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo Baca file-file berikut untuk detail lengkap:
echo.
echo 📄 RINGKASAN_PERBAIKAN_ERROR_VERCEL.md
echo    → Ringkasan lengkap masalah dan solusi
echo.
echo 📄 PERBAIKAN_ERROR_VERCEL_DEPLOY.md
echo    → Panduan detail perbaikan
echo.
echo 📄 CEK_VERCEL_ENV_VARS.md
echo    → Cara set environment variables
echo.
echo 🧪 test-vercel-api-fixed.html
echo    → Tool test API setelah deploy
echo.
timeout /t 3 >nul

echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │  ⚠️  TROUBLESHOOTING                                        │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo Jika masih ada error:
echo.
echo ❌ Error 405 Method Not Allowed
echo    → Clear cache Vercel: Settings → Clear Cache → Redeploy
echo.
echo ❌ Non-JSON Response (HTML)
echo    → Cek environment variables sudah diset
echo    → Pastikan sudah redeploy setelah set env vars
echo.
echo ❌ Missing Supabase credentials
echo    → Cek nama env vars PERSIS: VITE_SUPABASE_URL
echo    → Pastikan tidak ada spasi di value
echo    → Redeploy setelah fix
echo.
echo ❌ Timeout
echo    → Sudah dinaikkan ke 30 detik
echo    → Cek query Supabase tidak terlalu lambat
echo.
timeout /t 5 >nul

echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │  ✅ CHECKLIST                                               │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo [ ] Kode sudah di-push ke GitHub
echo [ ] Vercel sudah deploy otomatis
echo [ ] Environment variables sudah diset (4 variables)
echo [ ] Sudah redeploy setelah set env vars
echo [ ] Test dengan test-vercel-api-fixed.html
echo [ ] Semua endpoint return JSON (bukan HTML)
echo [ ] Form bisa submit tiket
echo [ ] Data masuk ke Supabase
echo [ ] Tidak ada error di Console browser
echo.
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║  🎉 SELESAI! Ikuti langkah 2 dan 3 secara manual          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.

pause
