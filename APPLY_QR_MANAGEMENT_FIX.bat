@echo off
echo 🔧 Menerapkan perbaikan QR Management Authentication...
echo.

echo 📋 Langkah 1: Backup file asli...
if exist "frontend\src\pages\tickets\QRManagement.tsx" (
    copy "frontend\src\pages\tickets\QRManagement.tsx" "frontend\src\pages\tickets\QRManagement.tsx.backup"
    echo ✅ Backup QRManagement.tsx berhasil
) else (
    echo ❌ File QRManagement.tsx tidak ditemukan
    pause
    exit /b 1
)

echo.
echo 📋 Langkah 2: Menerapkan file yang sudah diperbaiki...
if exist "QRManagementFixed.tsx" (
    copy "QRManagementFixed.tsx" "frontend\src\pages\tickets\QRManagement.tsx"
    echo ✅ File QRManagement.tsx berhasil diperbarui
) else (
    echo ❌ File QRManagementFixed.tsx tidak ditemukan
    pause
    exit /b 1
)

echo.
echo 📋 Langkah 3: Membersihkan file temporary...
if exist "QRManagementFixed.tsx" (
    del "QRManagementFixed.tsx"
    echo ✅ File temporary dibersihkan
)

echo.
echo ✅ Perbaikan QR Management berhasil diterapkan!
echo.
echo 📋 Perubahan yang diterapkan:
echo - Tambahan authentication check di awal component
echo - Improved error handling untuk API calls
echo - Better session validation
echo - Redirect ke login jika authentication gagal
echo - Loading state yang lebih informatif
echo.
echo 🚀 Silakan test halaman QR Management sekarang
echo.
pause