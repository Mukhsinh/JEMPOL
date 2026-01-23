@echo off
echo ========================================
echo QUICK TEST - UNITS MANAGEMENT
echo ========================================
echo.

echo Membuka test page...
start http://localhost:5173/test-units-error-fix.html

timeout /t 2 /nobreak >nul

echo Membuka halaman Units...
start http://localhost:5173/settings/units

echo.
echo ========================================
echo TEST CHECKLIST
echo ========================================
echo.
echo [ ] Test page: Semua endpoint return JSON
echo [ ] Test page: Array validation berfungsi
echo [ ] Units page: Tidak ada error di console
echo [ ] Units page: Dropdown tipe unit terisi
echo [ ] Units page: Tabel units tampil
echo [ ] Units page: Bisa tambah/edit/hapus unit
echo.
echo Jika semua checklist OK, siap deploy!
echo.
pause
