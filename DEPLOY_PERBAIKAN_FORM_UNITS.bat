@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║      🚀 DEPLOY PERBAIKAN FORM UNITS KE VERCEL               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📋 Perbaikan yang akan di-deploy:
echo    ✅ Form tiket internal - load units dari master data
echo    ✅ Form survey - validasi unit_id
echo    ✅ API units - return format konsisten
echo    ✅ Validasi unit exists dan aktif
echo.

echo [1/5] 🔍 Verifikasi file yang sudah diperbaiki...
set "FILES_OK=1"

if not exist "frontend\src\pages\public\DirectInternalTicketForm.tsx" set "FILES_OK=0"
if not exist "api\public\units.ts" set "FILES_OK=0"
if not exist "api\public\internal-tickets.ts" set "FILES_OK=0"
if not exist "api\public\surveys.ts" set "FILES_OK=0"

if "%FILES_OK%"=="0" (
    echo     ❌ File tidak lengkap!
    goto :error
)
echo     ✅ Semua file perbaikan tersedia
echo.

echo [2/5] 📦 Git add dan commit...
git add .
git commit -m "fix: perbaikan integrasi units untuk form tiket internal dan survey - dropdown units terisi, validasi unit_id, error handling"
if errorlevel 1 (
    echo     ⚠️  Tidak ada perubahan untuk di-commit atau commit gagal
    echo     ℹ️  Melanjutkan ke deploy...
)
echo.

echo [3/5] 📤 Git push ke repository...
git push origin main
if errorlevel 1 (
    echo     ❌ Git push gagal!
    echo     💡 Pastikan:
    echo        - Repository sudah di-setup
    echo        - Anda punya akses push
    echo        - Tidak ada conflict
    goto :error
)
echo     ✅ Push berhasil
echo.

echo [4/5] 🚀 Deploy ke Vercel...
echo     ⏳ Deploying... (ini mungkin memakan waktu beberapa menit)
echo.
vercel --prod
if errorlevel 1 (
    echo     ❌ Deploy gagal!
    echo     💡 Pastikan:
    echo        - Vercel CLI sudah terinstall
    echo        - Sudah login ke Vercel
    echo        - Project sudah di-link
    goto :error
)
echo.
echo     ✅ Deploy berhasil!
echo.

echo [5/5] 📋 Checklist Verifikasi di Production:
echo.
echo     Setelah deploy selesai, lakukan verifikasi berikut:
echo.
echo     1. ✅ Test Form Tiket Internal:
echo        https://your-app.vercel.app/form/internal?unit_id=xxx
echo        - Pastikan dropdown units terisi
echo        - Pilih unit dan isi form
echo        - Submit dan verify ticket dibuat
echo.
echo     2. ✅ Test Form Survey:
echo        https://your-app.vercel.app/survey?unit_id=xxx
echo        - Pastikan unit_id dari URL valid
echo        - Isi survey lengkap
echo        - Submit dan verify survey tersimpan
echo.
echo     3. ✅ Test Form Tiket Eksternal:
echo        https://your-app.vercel.app/form/external?unit_id=xxx
echo        - Pastikan masih berfungsi normal
echo        - Submit dan verify ticket dibuat
echo.
echo     4. ✅ Cek Vercel Logs:
echo        - Buka Vercel Dashboard
echo        - Pilih project Anda
echo        - Cek tab "Logs" untuk error
echo.
echo     5. ✅ Cek Supabase:
echo        - Buka Supabase Dashboard
echo        - Cek tabel 'tickets' untuk tiket baru
echo        - Cek tabel 'public_surveys' untuk survey baru
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  ✅ DEPLOY SELESAI                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Perbaikan berhasil di-deploy ke production!
echo.
echo 📝 Dokumentasi lengkap:
echo    - PERBAIKAN_FORM_UNITS_VERCEL_SELESAI.md
echo    - test-form-units-integration.html
echo.
echo 💡 Jika ada masalah:
echo    1. Cek Vercel logs untuk error
echo    2. Cek console browser untuk error
echo    3. Pastikan environment variables Vercel benar
echo    4. Pastikan tabel 'units' di Supabase ada data
echo.
pause
goto :end

:error
echo.
echo ❌ ERROR: Deploy gagal!
echo.
echo 💡 Troubleshooting:
echo    1. Pastikan semua file sudah di-commit
echo    2. Pastikan git push berhasil
echo    3. Pastikan Vercel CLI terinstall: npm i -g vercel
echo    4. Pastikan sudah login: vercel login
echo    5. Pastikan project sudah di-link: vercel link
echo.
pause
exit /b 1

:end
