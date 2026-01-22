@echo off
echo ========================================
echo TEST JLAMPRANG UNITS API FIX
echo ========================================
echo.
echo Membuka test untuk verifikasi perbaikan...
echo.
echo Test akan membuka di browser:
echo 1. Test Units API - http://localhost:3004/test-jlamprang-units-fix.html
echo 2. Form Jlamprang - http://localhost:3003/form/internal?unit_id=7bac7321-86e2-4dce-936d-2adde223c314^&unit_name=Jlamprang
echo.
echo Pastikan backend berjalan di port 3004
echo Pastikan frontend berjalan di port 3003
echo.
pause

REM Buka test units API
start http://localhost:3004/test-jlamprang-units-fix.html

timeout /t 2 /nobreak >nul

REM Buka form Jlamprang
start "Form Jlamprang" "http://localhost:3003/form/internal?unit_id=7bac7321-86e2-4dce-936d-2adde223c314&unit_name=Jlamprang"

echo.
echo ========================================
echo Test dibuka di browser!
echo ========================================
echo.
echo Periksa:
echo [✓] Test Units API menampilkan daftar units
echo [✓] Form Jlamprang tidak ada error "Gagal memuat data unit"
echo [✓] Dropdown Unit/Departemen terisi dengan benar
echo.
pause
