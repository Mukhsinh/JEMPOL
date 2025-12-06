@echo off
echo ========================================
echo COMMIT DAN PUSH - VERCEL FIX
echo ========================================
echo.

echo [1/4] Memeriksa status Git...
git status
echo.

echo [2/4] Menambahkan semua perubahan...
git add .
echo ✓ Selesai
echo.

echo [3/4] Membuat commit...
git commit -m "fix: vercel deployment configuration - fixed build command and monorepo structure"
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Tidak ada perubahan untuk di-commit atau commit gagal
    echo.
    pause
    exit /b 1
)
echo ✓ Selesai
echo.

echo [4/4] Push ke GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ❌ PUSH GAGAL!
    echo.
    echo Kemungkinan penyebab:
    echo - Belum login ke GitHub
    echo - Tidak ada koneksi internet
    echo - Branch name salah (coba: git push origin master)
    echo.
    pause
    exit /b 1
)
echo ✓ Selesai
echo.

echo ========================================
echo PUSH BERHASIL!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Buka Vercel Dashboard: https://vercel.com/dashboard
echo 2. Import project dari GitHub
echo 3. Vercel akan otomatis detect konfigurasi
echo 4. Klik Deploy
echo.
echo Atau gunakan Vercel CLI:
echo   vercel --prod
echo.
pause
