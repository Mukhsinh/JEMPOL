@echo off
echo ========================================
echo   PERBAIKI QR LINK SETTINGS
echo ========================================
echo.
echo Script ini akan memeriksa dan memperbaiki
echo masalah pada halaman QR Link Settings
echo.
echo ========================================
echo   LANGKAH PERBAIKAN
echo ========================================
echo.

echo [1/5] Memeriksa backend...
netstat -ano | findstr ":3001" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend berjalan di port 3001
) else (
    echo ❌ Backend tidak berjalan
    echo    Jalankan: cd backend ^&^& npm start
)
echo.

echo [2/5] Memeriksa frontend...
netstat -ano | findstr ":3003" >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend berjalan di port 3003
) else (
    echo ❌ Frontend tidak berjalan
    echo    Jalankan: cd frontend ^&^& npm run dev
)
echo.

echo [3/5] Membuka halaman test...
start http://localhost:3003/test-qr-link-direct.html
echo ✅ Halaman test dibuka
echo.

echo [4/5] Membuka halaman utama...
start http://localhost:3003/settings/qr-link
echo ✅ Halaman QR Link Settings dibuka
echo.

echo [5/5] Instruksi debugging...
echo.
echo ========================================
echo   CARA DEBUGGING
echo ========================================
echo.
echo 1. Buka Developer Tools (F12) di browser
echo 2. Lihat tab Console:
echo    - Cari pesan error berwarna merah
echo    - Cari log "QRLinkSettings component mounted"
echo    - Cari log "Loading QR Link Settings data"
echo.
echo 3. Lihat tab Network:
echo    - Cari request ke /api/units
echo    - Cari request ke /api/qr-codes
echo    - Periksa status code (harus 200)
echo    - Periksa response data
echo.
echo 4. Periksa localStorage:
echo    - Buka tab Application
echo    - Pilih Local Storage
echo    - Cari key "auth"
echo    - Pastikan ada token
echo.
echo ========================================
echo   SOLUSI UMUM
echo ========================================
echo.
echo Masalah: Halaman kosong
echo Solusi: 
echo   - Pastikan sudah login
echo   - Refresh halaman (Ctrl+R)
echo   - Clear cache (Ctrl+Shift+Delete)
echo.
echo Masalah: Error 401 Unauthorized
echo Solusi:
echo   - Login ulang di aplikasi
echo   - Periksa token di localStorage
echo.
echo Masalah: Error 500 Internal Server
echo Solusi:
echo   - Restart backend
echo   - Periksa log backend di terminal
echo   - Periksa koneksi Supabase
echo.
echo Masalah: Data tidak muncul
echo Solusi:
echo   - Buat QR code baru dulu
echo   - Periksa database Supabase
echo   - Cek RLS policies
echo.
echo ========================================
pause
