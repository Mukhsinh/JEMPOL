@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🔧 RESTART CLEAN - FIX FORM SURVEY SIDEBAR           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📋 Masalah: Form survey menampilkan sidebar
echo ✅ Solusi: Clean restart dengan clear cache
echo.
echo ════════════════════════════════════════════════════════════
echo.

echo [1/6] Membersihkan Vite cache...
cd frontend
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite 2>nul
    echo ✓ Vite cache dihapus
) else (
    echo ✓ Vite cache sudah bersih
)

echo [2/6] Membersihkan dist folder...
if exist dist (
    rmdir /s /q dist 2>nul
    echo ✓ Dist folder dihapus
) else (
    echo ✓ Dist folder sudah bersih
)

echo [3/6] Membersihkan browser cache folder...
if exist .cache (
    rmdir /s /q .cache 2>nul
    echo ✓ Cache folder dihapus
)

echo [4/6] Verifikasi file komponen...
if exist src\pages\public\DirectSurveyForm.tsx (
    echo ✓ DirectSurveyForm.tsx ada
) else (
    echo ✗ DirectSurveyForm.tsx TIDAK DITEMUKAN!
    pause
    exit /b 1
)

echo [5/6] Verifikasi route di App.tsx...
findstr /C:"DirectSurveyForm" src\App.tsx >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Import DirectSurveyForm ada di App.tsx
) else (
    echo ✗ Import DirectSurveyForm TIDAK DITEMUKAN!
)

findstr /C:"path=\"/form/survey\"" src\App.tsx >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Route /form/survey ada di App.tsx
) else (
    echo ✗ Route /form/survey TIDAK DITEMUKAN!
)

echo [6/6] Memulai dev server...
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 🚀 Starting Vite dev server...
echo.
echo Tunggu hingga muncul:
echo   "Local: http://localhost:3003/"
echo.
echo Kemudian:
echo   1. Buka browser
echo   2. Tekan Ctrl+Shift+Del untuk clear cache
echo   3. Buka: http://localhost:3003/form/survey?qr=TEST
echo.
echo Yang HARUS terlihat:
echo   ✓ Form fullscreen TANPA sidebar
echo   ✓ Background gradient hijau/teal
echo   ✓ Progress indicator di atas
echo.
echo ════════════════════════════════════════════════════════════
echo.

npm run dev
