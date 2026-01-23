@echo off
echo ========================================
echo DEPLOY VERCEL - PERBAIKAN FINAL
echo ========================================
echo.

echo [1/5] Membersihkan cache dan build lama...
if exist "frontend\dist" rmdir /s /q "frontend\dist"
if exist ".vercel" rmdir /s /q ".vercel"
echo ✓ Cache dibersihkan
echo.

echo [2/5] Install dependencies...
call npm install
if errorlevel 1 (
    echo ✗ Gagal install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies terinstall
echo.

echo [3/5] Build frontend...
call npm run vercel-build
if errorlevel 1 (
    echo ✗ Gagal build frontend
    pause
    exit /b 1
)
echo ✓ Frontend berhasil di-build
echo.

echo [4/5] Verifikasi file API...
if not exist "api\public\units.ts" (
    echo ✗ File api\public\units.ts tidak ditemukan
    pause
    exit /b 1
)
if not exist "api\public\internal-tickets.ts" (
    echo ✗ File api\public\internal-tickets.ts tidak ditemukan
    pause
    exit /b 1
)
if not exist "api\public\app-settings.ts" (
    echo ✗ File api\public\app-settings.ts tidak ditemukan
    pause
    exit /b 1
)
echo ✓ Semua file API tersedia
echo.

echo [5/5] Deploy ke Vercel...
echo.
echo PENTING: Pastikan environment variables sudah di-set di Vercel Dashboard:
echo   - VITE_SUPABASE_URL
echo   - VITE_SUPABASE_ANON_KEY
echo   - VITE_SUPABASE_SERVICE_ROLE_KEY
echo.
echo Tekan ENTER untuk melanjutkan deploy atau CTRL+C untuk batal...
pause > nul

call vercel --prod
if errorlevel 1 (
    echo ✗ Gagal deploy ke Vercel
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ DEPLOY BERHASIL!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Buka Vercel Dashboard
echo 2. Pastikan environment variables sudah di-set
echo 3. Test aplikasi di URL production
echo.
pause
