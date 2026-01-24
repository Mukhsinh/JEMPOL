@echo off
echo ========================================
echo TEST TOMBOL LANJUTKAN - SURVEY FORM
echo ========================================
echo.
echo Membuka test page untuk tombol lanjutkan...
echo.
start http://localhost:3002/form/survey
echo.
echo ========================================
echo CHECKLIST TESTING:
echo ========================================
echo.
echo [STEP 1 - Identitas Diri]
echo 1. Pastikan Unit Tujuan bisa dipilih
echo 2. Isi Nomor HP (minimal 10 digit)
echo 3. Tombol "Lanjutkan" akan aktif jika:
echo    - Unit Tujuan sudah dipilih
echo    - Nomor HP sudah diisi minimal 10 digit
echo 4. Jika belum lengkap, akan muncul pesan error
echo.
echo [STEP 2 - Form Survey]
echo 5. Setelah klik "Lanjutkan", akan masuk ke Step 2
echo 6. Isi 8 pertanyaan penilaian
echo 7. Tombol "Kirim Survei" akan aktif setelah semua pertanyaan dijawab
echo.
echo ========================================
echo STATUS: Perbaikan tombol lanjutkan selesai
echo ========================================
pause
