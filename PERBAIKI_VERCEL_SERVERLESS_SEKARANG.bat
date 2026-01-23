@echo off
echo ========================================
echo PERBAIKAN VERCEL SERVERLESS FUNCTIONS
echo ========================================
echo.
echo Masalah yang akan diperbaiki:
echo - Error 405 (Method Not Allowed)
echo - Non-JSON Response (HTML)
echo - Gagal memuat data unit
echo.
echo ========================================
echo.

REM Jalankan script perbaikan
node fix-vercel-serverless-functions.js

echo.
echo ========================================
echo COMMIT DAN DEPLOY
echo ========================================
echo.

REM Commit perubahan
git add .
git commit -m "fix: perbaiki vercel serverless functions - error 405 dan non-json response"

echo.
echo Apakah Anda ingin push ke GitHub dan deploy ke Vercel? (Y/N)
set /p DEPLOY_CONFIRM=

if /i "%DEPLOY_CONFIRM%"=="Y" (
    echo.
    echo Pushing ke GitHub...
    git push
    
    echo.
    echo ========================================
    echo DEPLOY BERHASIL!
    echo ========================================
    echo.
    echo Vercel akan otomatis deploy dalam beberapa menit.
    echo Cek status deploy di: https://vercel.com/dashboard
    echo.
    echo Setelah deploy selesai, test aplikasi di:
    echo https://kiss2.vercel.app
    echo.
) else (
    echo.
    echo Deploy dibatalkan. Anda bisa push manual dengan:
    echo git push
    echo.
)

pause
