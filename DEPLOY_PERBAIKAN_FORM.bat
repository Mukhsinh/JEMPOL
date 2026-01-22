@echo off
echo ========================================
echo DEPLOY PERBAIKAN FORM SUBMIT KE VERCEL
echo ========================================
echo.
echo Perbaikan yang akan di-deploy:
echo - api/public/internal-tickets.ts (BARU)
echo - api/public/units.ts (BARU)
echo - api/public/app-settings.ts (BARU)
echo.
echo ========================================
echo LANGKAH 1: Git Add
echo ========================================
git add api/public/internal-tickets.ts
git add api/public/units.ts
git add api/public/app-settings.ts
git add test-vercel-endpoints.html
git add PERBAIKAN_VERCEL_FORM_SUBMIT.md
echo.
echo File berhasil ditambahkan ke staging!
echo.
echo ========================================
echo LANGKAH 2: Git Commit
echo ========================================
git commit -m "fix: tambah endpoint API yang hilang untuk form submit

- Tambah /api/public/internal-tickets untuk submit tiket internal
- Tambah /api/public/units untuk daftar unit
- Tambah /api/public/app-settings untuk pengaturan aplikasi
- Perbaiki error 405 Method Not Allowed
- Perbaiki error Unexpected end of JSON input
- Tambah file test untuk validasi endpoint"
echo.
echo Commit berhasil!
echo.
echo ========================================
echo LANGKAH 3: Git Push
echo ========================================
echo Pushing ke repository...
git push
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo DEPLOY BERHASIL!
    echo ========================================
    echo.
    echo Vercel akan otomatis deploy perubahan ini.
    echo.
    echo LANGKAH SELANJUTNYA:
    echo 1. Tunggu 2-3 menit untuk deployment selesai
    echo 2. Buka Vercel Dashboard untuk cek status
    echo 3. Test endpoint dengan file test-vercel-endpoints.html
    echo 4. Test form tiket internal di aplikasi
    echo 5. Test form survey di aplikasi
    echo.
    echo URL Test: https://your-app.vercel.app/test-vercel-endpoints.html
    echo.
) else (
    echo ========================================
    echo DEPLOY GAGAL!
    echo ========================================
    echo.
    echo Silakan cek error di atas dan coba lagi.
    echo.
)
pause
