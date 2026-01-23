@echo off
echo ========================================
echo COMMIT DAN DEPLOY VERCEL - PERBAIKAN
echo ========================================
echo.

echo [1/6] Cek status Git...
git status
echo.

echo [2/6] Add semua perubahan...
git add .
echo ✓ Files staged
echo.

echo [3/6] Commit perubahan...
git commit -m "fix: Perbaiki routing Vercel API endpoints - fix error 405 dan non-JSON response"
if errorlevel 1 (
    echo ⚠️ Tidak ada perubahan untuk di-commit atau commit gagal
    echo Melanjutkan ke deploy...
) else (
    echo ✓ Commit berhasil
)
echo.

echo [4/6] Push ke repository (optional)...
echo Apakah Anda ingin push ke Git repository? (Y/N)
set /p PUSH_CHOICE="> "
if /i "%PUSH_CHOICE%"=="Y" (
    git push
    if errorlevel 1 (
        echo ⚠️ Push gagal, tapi melanjutkan deploy...
    ) else (
        echo ✓ Push berhasil
    )
) else (
    echo ⏭️ Skip push
)
echo.

echo [5/6] Bersihkan cache dan build...
if exist "frontend\dist" rmdir /s /q "frontend\dist"
if exist ".vercel" rmdir /s /q ".vercel"
call npm install
call npm run vercel-build
if errorlevel 1 (
    echo ✗ Build gagal
    pause
    exit /b 1
)
echo ✓ Build berhasil
echo.

echo [6/6] Deploy ke Vercel...
echo.
echo ⚠️ PENTING: Pastikan environment variables sudah di-set di Vercel Dashboard!
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo    - VITE_SUPABASE_SERVICE_ROLE_KEY
echo.
echo Tekan ENTER untuk deploy atau CTRL+C untuk batal...
pause > nul

call vercel --prod
if errorlevel 1 (
    echo ✗ Deploy gagal
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ COMMIT DAN DEPLOY BERHASIL!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Buka: test-vercel-api-endpoints.html
echo 2. Test semua API endpoints
echo 3. Verifikasi aplikasi berjalan normal
echo.
echo Dokumentasi lengkap:
echo - PERBAIKAN_VERCEL_ERROR_FINAL.md
echo - VERCEL_ENV_CHECKLIST.md
echo.
pause
