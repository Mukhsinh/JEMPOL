@echo off
echo ========================================
echo CLEAR CACHE DAN TEST QR CODE FORM
echo ========================================
echo.

echo Step 1: Membersihkan cache Vite...
cd frontend
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Cache Vite berhasil dihapus
) else (
    echo Cache Vite tidak ditemukan
)

echo.
echo Step 2: Membersihkan dist folder...
if exist dist (
    rmdir /s /q dist
    echo Dist folder berhasil dihapus
) else (
    echo Dist folder tidak ditemukan
)

cd ..

echo.
echo Step 3: Restart aplikasi frontend...
echo Silakan tutup terminal frontend yang sedang berjalan (Ctrl+C)
echo Kemudian jalankan: cd frontend ^&^& npm run dev
echo.

echo ========================================
echo INSTRUKSI SELANJUTNYA:
echo ========================================
echo.
echo 1. Tutup semua tab browser yang terbuka
echo 2. Buka browser dalam mode Incognito/Private
echo 3. Akses: http://localhost:5173/login
echo 4. Login sebagai admin
echo 5. Buka: http://localhost:5173/tickets/qr-management
echo 6. Klik tab "QR Code Form"
echo 7. Klik tombol "Buka Form" pada salah satu card
echo.
echo EXPECTED: Halaman form fullscreen TANPA SIDEBAR
echo.
pause
