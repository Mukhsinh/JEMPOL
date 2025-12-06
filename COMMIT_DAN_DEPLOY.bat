@echo off
echo ========================================
echo COMMIT DAN DEPLOY PERBAIKAN VERCEL
echo ========================================
echo.

echo [1/4] Menambahkan semua perubahan...
git add .

echo.
echo [2/4] Membuat commit...
git commit -m "fix: perbaiki konfigurasi Vercel - hapus dist dari vercelignore"

echo.
echo [3/4] Push ke GitHub...
git push origin main

echo.
echo [4/4] SELESAI!
echo.
echo ========================================
echo DEPLOY OTOMATIS DIMULAI DI VERCEL
echo ========================================
echo.
echo Vercel akan otomatis build ulang setelah push.
echo Cek status deploy di: https://vercel.com/dashboard
echo.
pause
