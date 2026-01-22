@echo off
echo ========================================
echo DEPLOY PERBAIKAN SUBMIT TIKET & SURVEY
echo ========================================
echo.

echo [1/3] Menambahkan perubahan ke Git...
git add api/public/internal-tickets.ts
git add api/public/surveys.ts
git add vercel.json

echo.
echo [2/3] Commit perubahan...
git commit -m "fix: Perbaiki API internal tickets dan surveys di Vercel - adopsi pola external tickets yang berhasil"

echo.
echo [3/3] Push ke GitHub untuk trigger Vercel deployment...
git push origin main

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo 1. Hapus config bodyParser yang tidak perlu
echo 2. Simplifikasi CORS headers seperti external-tickets
echo 3. Perbaiki vercel.json routing agar API tidak tertangkap oleh SPA rewrites
echo 4. Pastikan semua response mengembalikan JSON yang valid
echo.
echo Tunggu beberapa menit untuk Vercel selesai deploy.
echo Kemudian test kembali submit tiket internal dan survey.
echo.
pause
