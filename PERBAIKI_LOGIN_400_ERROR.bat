@echo off
echo ========================================
echo PERBAIKAN LOGIN ERROR 400
echo ========================================
echo.

echo Step 1: Membuka halaman clear session...
start http://localhost:3002 clear-session-and-login.html

echo.
echo ========================================
echo INSTRUKSI:
echo ========================================
echo 1. Klik "Clear All Sessions" untuk membersihkan semua session
echo 2. Tunggu hingga muncul pesan sukses
echo 3. Klik "Login" untuk mencoba login
echo 4. Jika berhasil, klik "Verify Session"
echo 5. Setelah berhasil, coba login di aplikasi utama
echo.
echo Tekan tombol apapun untuk membuka aplikasi utama...
pause > nul

start http://localhost:3002/login

echo.
echo ========================================
echo SELESAI
echo ========================================
echo.
echo Jika masih error:
echo 1. Tutup semua tab browser
echo 2. Buka browser baru
echo 3. Jalankan script ini lagi
echo.
pause
