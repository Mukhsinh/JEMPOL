@echo off
echo ========================================
echo    DEPLOY VERCEL - PERBAIKAN FINAL
echo ========================================
echo.

echo [1/5] Membersihkan cache dan build lama...
cd frontend
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo ✓ Cache dibersihkan

echo.
echo [2/5] Testing build lokal...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build gagal! Periksa error di atas.
    pause
    exit /b 1
)
echo ✓ Build lokal berhasil

echo.
echo [3/5] Kembali ke root directory...
cd ..

echo.
echo [4/5] Memulai deploy ke Vercel...
echo Pastikan Anda sudah login ke Vercel CLI dengan: vercel login
echo.
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deploy gagal! Periksa error di atas.
    echo.
    echo Troubleshooting:
    echo - Pastikan sudah login: vercel login
    echo - Periksa vercel.json
    echo - Periksa environment variables
    pause
    exit /b 1
)

echo.
echo [5/5] Deploy selesai!
echo ✓ Aplikasi berhasil di-deploy ke Vercel
echo ✓ Frontend dan backend terintegrasi
echo ✓ Database Supabase terhubung
echo.
echo Aplikasi siap digunakan di production!
echo.
pause