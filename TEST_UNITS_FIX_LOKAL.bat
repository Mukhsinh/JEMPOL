@echo off
echo ========================================
echo TEST PERBAIKAN ERROR UNITS - LOKAL
echo ========================================
echo.

echo [1/2] Membuka test page...
start http://localhost:5173/test-units-error-fix.html

echo.
echo [2/2] Membuka halaman Units Management...
timeout /t 2 /nobreak >nul
start http://localhost:5173/settings/units

echo.
echo ========================================
echo TEST DIMULAI
echo ========================================
echo.
echo Silakan cek:
echo 1. Test page untuk verifikasi endpoint
echo 2. Halaman Units Management untuk cek error
echo.
echo Yang harus berfungsi:
echo - Endpoint /api/public/units mengembalikan array
echo - Endpoint /api/public/unit-types mengembalikan array
echo - Tidak ada error "n.map is not a function"
echo - Dropdown tipe unit terisi dengan benar
echo - Tabel units tampil tanpa crash
echo.
pause
