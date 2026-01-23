@echo off
echo ========================================
echo TEST SUBMIT FORMS DI BROWSER
echo ========================================
echo.
echo Membuka test page di browser...
echo.
echo INSTRUKSI:
echo 1. Pastikan backend sudah running (npm run dev di folder backend)
echo 2. Pilih unit untuk setiap test
echo 3. Klik tombol test untuk masing-masing form
echo 4. Lihat hasil di console browser (F12)
echo.

start http://localhost:3004/test-submit-all-forms-browser.html

echo.
echo Test page dibuka di browser!
echo Jika tidak terbuka otomatis, buka:
echo http://localhost:3004/test-submit-all-forms-browser.html
echo.
pause
