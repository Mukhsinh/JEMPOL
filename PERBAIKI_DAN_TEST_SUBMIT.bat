@echo off
echo ========================================
echo PERBAIKI DAN TEST SUBMIT FORMS
echo ========================================
echo.
echo Langkah 1: Test database connection
echo ----------------------------------------
node fix-submit-all-forms.js
echo.
echo.
echo Langkah 2: Start backend server
echo ----------------------------------------
echo Membuka backend server di terminal baru...
start cmd /k "cd backend && npm run dev"
echo.
echo Tunggu 5 detik untuk backend startup...
timeout /t 5 /nobreak
echo.
echo.
echo Langkah 3: Start frontend server
echo ----------------------------------------
echo Membuka frontend server di terminal baru...
start cmd /k "cd frontend && npm run dev"
echo.
echo Tunggu 5 detik untuk frontend startup...
timeout /t 5 /nobreak
echo.
echo.
echo Langkah 4: Buka test page di browser
echo ----------------------------------------
echo Membuka test page...
start http://localhost:3002/test-submit-all-forms-browser.html
echo.
echo.
echo ========================================
echo APLIKASI SUDAH BERJALAN!
echo ========================================
echo.
echo Backend: http://localhost:3004
echo Frontend: http://localhost:3002
echo Test Page: http://localhost:3002/test-submit-all-forms-browser.html
echo.
echo CARA TEST:
echo 1. Buka test page yang sudah terbuka di browser
echo 2. Pilih unit untuk setiap form
echo 3. Klik tombol test
echo 4. Lihat hasil di halaman
echo.
echo Untuk test form langsung:
echo - Tiket Internal: http://localhost:3002/form/internal?unit_id=xxx
echo - Tiket Eksternal: http://localhost:3002/form/external?unit_id=xxx
echo - Survey: http://localhost:3002/form/survey?unit_id=xxx
echo.
pause
