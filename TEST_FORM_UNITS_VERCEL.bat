@echo off
echo ========================================
echo TEST FORM UNITS - VERCEL
echo ========================================
echo.

echo Membuka test page...
start test-vercel-form-units.html

echo.
echo ========================================
echo INSTRUKSI TESTING:
echo ========================================
echo.
echo 1. Masukkan Vercel App URL Anda
echo    Contoh: https://your-app.vercel.app
echo.
echo 2. Klik "Test API Units"
echo    - Harus menampilkan list units
echo    - Dropdown harus terisi otomatis
echo.
echo 3. Isi form dan klik "Test Submit Form"
echo    - Harus berhasil submit
echo    - Dapat nomor tiket
echo.
echo 4. Klik "Check Environment"
echo    - Semua check harus PASS
echo.
echo ========================================
echo TROUBLESHOOTING:
echo ========================================
echo.
echo Jika API Units gagal:
echo   - Cek environment variables di Vercel
echo   - Cek logs di Vercel Dashboard
echo   - Pastikan tabel units ada data aktif
echo.
echo Jika Submit gagal:
echo   - Cek unit_id valid
echo   - Cek RLS policies
echo   - Cek SERVICE_ROLE_KEY
echo.
echo Baca: PERBAIKAN_FORM_UNITS_VERCEL_FINAL.md
echo untuk detail lengkap
echo.
pause
