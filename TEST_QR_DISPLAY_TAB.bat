@echo off
echo ========================================
echo TEST QR DISPLAY TAB - QR MANAGEMENT
echo ========================================
echo.
echo Membuka halaman test...
echo.

start "" "test-qr-display-tab.html"

echo.
echo ✓ Halaman test dibuka!
echo.
echo Fitur yang ditambahkan:
echo - Tab "Tampilan QR Code" di QR Management
echo - Dropdown untuk memilih QR code
echo - Tampilan QR code besar (512x512px)
echo - Informasi lengkap (unit, redirect type, auto-fill)
echo - Tombol aksi: Salin Link, Unduh QR, Cetak, Buka Link
echo - QR code langsung ke /form/internal (tanpa login, tanpa sidebar)
echo.
echo Cara test:
echo 1. Buka QR Management di http://localhost:3003/tickets/qr-management
echo 2. Klik tab "Tampilan QR Code"
echo 3. Pilih QR code dari dropdown
echo 4. Lihat QR code ditampilkan dalam ukuran besar
echo 5. Test tombol Salin Link, Unduh QR, Cetak
echo 6. Scan QR code dengan HP untuk test redirect
echo.
pause
