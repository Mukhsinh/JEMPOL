@echo off
echo ========================================
echo TEST LOGIN - FIX ERROR 400
echo ========================================
echo.

echo Membuka test login page...
start test-login-400-fix.html

echo.
echo ========================================
echo INSTRUKSI:
echo ========================================
echo 1. Halaman test akan terbuka di browser
echo 2. Klik "Test Connection" untuk cek koneksi
echo 3. Pilih admin dari list atau masukkan manual
echo 4. Klik "Test Login" untuk test login
echo 5. Lihat log untuk detail proses
echo.
echo Jika berhasil:
echo - Akan muncul pesan "Login berhasil"
echo - Session info akan ditampilkan di log
echo.
echo Jika gagal:
echo - Klik "Clear All" untuk hapus semua data
echo - Refresh halaman dan coba lagi
echo ========================================
echo.

pause
