@echo off
echo ========================================
echo PERBAIKAN STYLING VERCEL
echo ========================================
echo.

echo [1/5] Membersihkan cache build...
cd frontend
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo ✓ Cache dibersihkan
echo.

echo [2/5] Reinstall dependencies...
call npm install
echo ✓ Dependencies terinstall
echo.

echo [3/5] Build ulang aplikasi...
call npm run build
echo ✓ Build selesai
echo.

echo [4/5] Verifikasi hasil build...
if exist dist\index.html (
    echo ✓ index.html ditemukan
) else (
    echo ✗ index.html TIDAK ditemukan!
    pause
    exit /b 1
)

if exist dist\assets\index-*.css (
    echo ✓ CSS file ditemukan
) else (
    echo ✗ CSS file TIDAK ditemukan!
    pause
    exit /b 1
)
echo.

cd ..

echo [5/5] Commit dan push ke Git...
git add .
git commit -m "fix: perbaikan styling untuk Vercel deployment"
git push
echo ✓ Perubahan di-push ke Git
echo.

echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Buka Vercel Dashboard
echo 2. Verifikasi Environment Variables:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo 3. Trigger redeploy jika perlu
echo 4. Tunggu deployment selesai
echo 5. Test aplikasi di URL Vercel
echo.
pause
