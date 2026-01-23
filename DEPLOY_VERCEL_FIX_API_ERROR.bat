@echo off
echo ========================================
echo DEPLOY VERCEL - FIX API JSON ERROR
echo ========================================
echo.

echo [1/5] Verifikasi konfigurasi API...
node fix-vercel-api-endpoints.js
if errorlevel 1 (
    echo.
    echo ❌ Verifikasi gagal! Perbaiki error di atas dulu.
    pause
    exit /b 1
)

echo.
echo [2/5] Build frontend untuk test...
cd frontend
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ Build gagal! Perbaiki error TypeScript/build dulu.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/5] Commit perubahan...
git add .
git commit -m "fix: Perbaiki API endpoint Vercel - JSON parse error"
if errorlevel 1 (
    echo ⚠️  Tidak ada perubahan untuk di-commit atau sudah di-commit
)

echo.
echo [4/5] Push ke GitHub...
git push origin main
if errorlevel 1 (
    echo ⚠️  Push gagal atau tidak ada remote repository
    echo    Deploy tetap akan dilanjutkan ke Vercel
)

echo.
echo [5/5] Deploy ke Vercel...
echo.
echo 📝 PENTING: Pastikan environment variables sudah di-set di Vercel:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo    - VITE_SUPABASE_SERVICE_ROLE_KEY
echo.
pause

vercel --prod
if errorlevel 1 (
    echo.
    echo ❌ Deploy gagal!
    echo.
    echo Troubleshooting:
    echo 1. Pastikan Vercel CLI sudah terinstall: npm i -g vercel
    echo 2. Login ke Vercel: vercel login
    echo 3. Link project: vercel link
    echo 4. Coba deploy lagi: vercel --prod
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ DEPLOY BERHASIL!
echo ========================================
echo.
echo 📋 Langkah selanjutnya:
echo 1. Buka aplikasi di browser
echo 2. Test form yang menggunakan dropdown units
echo 3. Cek browser console - tidak boleh ada error JSON parse
echo 4. Test endpoint langsung: https://your-app.vercel.app/api/public/units
echo.
echo 🔍 Jika masih error:
echo 1. Buka Vercel Dashboard
echo 2. Klik Deployments - pilih deployment terakhir
echo 3. Klik Function Logs
echo 4. Cari error di /api/public/units
echo.
pause
