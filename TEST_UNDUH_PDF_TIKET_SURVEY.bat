@echo off
echo ========================================
echo TEST FITUR UNDUH PDF TIKET DAN SURVEI
echo ========================================
echo.
echo Fitur yang akan ditest:
echo 1. Tombol Unduh Tiket (PDF) - Tiket Internal
echo 2. Tombol Unduh Tiket (PDF) - Tiket Eksternal  
echo 3. Tombol Unduh Survei (PDF) - Survei Kepuasan
echo.
echo Cara test:
echo 1. Buka form tiket internal/eksternal/survei
echo 2. Isi dan submit form
echo 3. Setelah berhasil, klik tombol "Unduh Tiket/Survei (PDF)"
echo 4. PDF akan otomatis terdownload dengan tampilan profesional
echo.
echo ========================================
echo Memulai aplikasi...
echo ========================================
echo.

cd backend
start cmd /k "echo BACKEND SERVER && npm run dev"
timeout /t 3 /nobreak >nul

cd ../frontend
start cmd /k "echo FRONTEND SERVER && npm run dev"

echo.
echo ========================================
echo Aplikasi sedang berjalan!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Test URL:
echo - Tiket Internal: http://localhost:5173/form/internal?unit_id=xxx
echo - Tiket Eksternal: http://localhost:5173/form/eksternal?unit_id=xxx
echo - Survei: http://localhost:5173/survey?unit_id=xxx
echo.
echo Tekan tombol apapun untuk menutup jendela ini...
pause >nul
