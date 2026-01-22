@echo off
echo ========================================
echo DEPLOY PERBAIKAN FORM SUBMIT KE VERCEL
echo ========================================
echo.
echo Perbaikan yang akan di-deploy:
echo 1. API units - Perbaiki JSON response
echo 2. API internal-tickets - Tambah validasi
echo 3. API surveys - Tambah validasi
echo 4. Integrasi data master units
echo.
echo ========================================

REM Commit changes
echo.
echo [1/3] Commit perubahan...
git add api/public/units.ts
git add api/public/internal-tickets.ts
git add api/public/surveys.ts
git add TEST_FORM_SUBMIT_VERCEL.bat
git add DEPLOY_PERBAIKAN_FORM_SUBMIT.bat
git commit -m "fix: Perbaiki form submit dan integrasi data master units di Vercel

- Tambah Content-Type header di semua API endpoint
- Validasi Supabase credentials sebelum query
- Return JSON valid meskipun terjadi error
- Selalu sertakan data array kosong jika gagal load units
- Perbaiki integrasi dropdown units dari data master
- Fix error 'Unexpected end of JSON input' di form
- Pastikan form tiket internal dan survey bisa submit"

echo.
echo [2/3] Push ke repository...
git push origin main

echo.
echo [3/3] Vercel akan auto-deploy...
echo.
echo ========================================
echo DEPLOYMENT SELESAI!
echo ========================================
echo.
echo Tunggu 2-3 menit untuk deployment selesai
echo Kemudian test dengan: TEST_FORM_SUBMIT_VERCEL.bat
echo.
echo URL untuk testing:
echo - Form Internal: https://jempol-frontend.vercel.app/form/internal
echo - Form Survey: https://jempol-frontend.vercel.app/form/survey
echo.
pause
