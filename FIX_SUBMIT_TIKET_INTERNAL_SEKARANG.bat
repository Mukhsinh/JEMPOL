@echo off
echo ========================================
echo FIX SUBMIT TIKET INTERNAL
echo ========================================
echo.

echo [1/3] Menampilkan informasi perbaikan...
node fix-submit-error-comprehensive.js
echo.

echo [2/3] Mendiagnosa masalah...
echo Pastikan backend sudah berjalan di port 5000
echo.
pause

node diagnose-submit-error.js
echo.

echo [3/3] Instruksi selanjutnya:
echo.
echo 1. Jika diagnosis menunjukkan backend tidak berjalan:
echo    - Buka terminal baru
echo    - cd backend
echo    - npm run dev
echo.
echo 2. Jika diagnosis menunjukkan error lain:
echo    - Periksa console backend untuk error detail
echo    - Pastikan Supabase credentials valid
echo    - Pastikan tabel tickets ada
echo.
echo 3. Test dari browser:
echo    - Buka http://localhost:5173/form/internal?unit_id=xxx
echo    - Isi form dan submit
echo    - Periksa browser console (F12)
echo    - Periksa Network tab
echo.

pause
