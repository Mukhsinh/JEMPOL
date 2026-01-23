@echo off
echo ========================================
echo DEPLOY PERBAIKAN LOCALHOST KE VERCEL
echo ========================================
echo.

echo [1/4] Menambahkan semua perubahan ke Git...
git add .

echo.
echo [2/4] Commit perubahan...
git commit -m "fix: Hapus referensi localhost untuk Vercel production - form submit sekarang menggunakan /api"

echo.
echo [3/4] Push ke GitHub...
git push origin main

echo.
echo [4/4] Vercel akan otomatis deploy dalam beberapa menit
echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Cek status deploy di: https://vercel.com/dashboard
echo.
echo Setelah deploy selesai, test form di:
echo - Form Internal: https://jempol-frontend.vercel.app/m/internal
echo - Form Survey: https://jempol-frontend.vercel.app/m/survey
echo - Form Eksternal: https://jempol-frontend.vercel.app/m/external
echo.
pause
