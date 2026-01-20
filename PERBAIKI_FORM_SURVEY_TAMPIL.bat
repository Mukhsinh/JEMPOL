@echo off
echo ========================================
echo PERBAIKAN FORM SURVEY TIDAK TAMPIL
echo ========================================
echo.

echo [1/4] Membersihkan cache browser dan build...
cd frontend
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist
echo Cache dibersihkan!
echo.

echo [2/4] Memastikan route sudah benar...
echo Route /form/survey sudah mengarah ke DirectSurveyForm
echo.

echo [3/4] Restart frontend server...
echo Tekan Ctrl+C untuk stop server yang sedang berjalan
echo Kemudian jalankan: npm run dev
echo.

echo [4/4] Testing URL:
echo - http://localhost:3003/form/survey?qr=test
echo - http://localhost:3003/form/internal?unit_id=1^&unit_name=Test
echo.

echo ========================================
echo LANGKAH MANUAL:
echo ========================================
echo 1. Stop server frontend (Ctrl+C)
echo 2. Jalankan: cd frontend ^&^& npm run dev
echo 3. Clear cache browser (Ctrl+Shift+Del)
echo 4. Buka URL: http://localhost:3003/form/survey?qr=test
echo ========================================
pause
