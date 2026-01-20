@echo off
chcp 65001 >nul
echo ========================================
echo 🔧 PERBAIKAN FORM SURVEY TAMPIL SIDEBAR
echo ========================================
echo.

echo 📋 Masalah: Form survey menampilkan sidebar, seharusnya fullscreen
echo ✅ Solusi: Clear cache dan restart server
echo.

echo [1/5] Membersihkan Vite cache...
cd frontend
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✓ Vite cache dihapus
) else (
    echo ✓ Vite cache sudah bersih
)
echo.

echo [2/5] Membersihkan dist folder...
if exist dist (
    rmdir /s /q dist
    echo ✓ Dist folder dihapus
) else (
    echo ✓ Dist folder sudah bersih
)
echo.

echo [3/5] Verifikasi route di App.tsx...
findstr /C:"path=\"/form/survey\" element={<DirectSurveyForm" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Route /form/survey sudah benar
) else (
    echo ✗ Route /form/survey tidak ditemukan!
)
echo.

echo [4/5] Verifikasi komponen DirectSurveyForm...
if exist src\pages\public\DirectSurveyForm.tsx (
    echo ✓ DirectSurveyForm.tsx ada
) else (
    echo ✗ DirectSurveyForm.tsx tidak ditemukan!
)
echo.

echo [5/5] Instruksi restart server...
echo.
echo ========================================
echo 📝 LANGKAH SELANJUTNYA:
echo ========================================
echo.
echo 1. STOP server frontend yang sedang berjalan (Ctrl+C)
echo.
echo 2. Jalankan perintah ini:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Clear browser cache:
echo    - Chrome: Ctrl+Shift+Del → Pilih "Cached images and files"
echo    - Atau: Hard refresh dengan Ctrl+F5
echo.
echo 4. Test URL ini:
echo    http://localhost:3003/form/survey?qr=TEST123
echo.
echo 5. Yang HARUS terlihat:
echo    ✓ Form fullscreen TANPA sidebar
echo    ✓ Header dengan nama unit (jika ada)
echo    ✓ Progress indicator
echo    ✓ Form input fields
echo.
echo ========================================
echo.

cd ..
echo Tekan tombol apapun untuk membuka test file...
pause >nul
start test-form-survey-direct.html

echo.
echo ✅ Test file dibuka di browser
echo Gunakan link di test file untuk testing
echo.
pause
