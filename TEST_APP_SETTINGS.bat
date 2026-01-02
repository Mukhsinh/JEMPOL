@echo off
echo ========================================
echo    TEST PENGATURAN APLIKASI
echo ========================================
echo.

echo 1. Membuka halaman test standalone...
start "" "test-app-settings-page.html"

echo.
echo 2. Membuka halaman test integrasi API...
start "" "test-app-settings-integration.html"

echo.
echo 3. Menampilkan data app_settings dari database...
echo.

echo Untuk test API, pastikan backend server berjalan di http://localhost:5000
echo.

echo ========================================
echo INSTRUKSI TEST:
echo ========================================
echo.
echo 1. HALAMAN STANDALONE (test-app-settings-page.html):
echo    - Test UI dan interaksi form
echo    - Upload logo (simulasi)
echo    - Simpan pengaturan (simulasi)
echo    - Tekan Shift+D untuk toggle dark mode
echo.
echo 2. HALAMAN INTEGRASI (test-app-settings-integration.html):
echo    - Test koneksi ke API backend
echo    - Test GET public settings
echo    - Test GET all settings (perlu auth)
echo    - Test UPDATE settings
echo    - Lihat hasil di panel Results
echo.
echo 3. AKSES MELALUI APLIKASI UTAMA:
echo    - Buka aplikasi frontend
echo    - Login sebagai admin
echo    - Klik menu Pengaturan > Pengaturan Aplikasi
echo.
echo ========================================

pause