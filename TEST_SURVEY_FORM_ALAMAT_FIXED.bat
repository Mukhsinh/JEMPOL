@echo off
echo ========================================
echo TEST FORM SURVEY - ALAMAT FIXED
echo ========================================
echo.
echo Membuka form survey dengan struktur alamat yang benar:
echo 1. Dropdown Kab/Kota (4 wilayah)
echo 2. Dropdown Kecamatan (dinamis)
echo 3. Textarea Alamat Detail (manual)
echo.
echo Tekan Ctrl+Shift+R untuk hard refresh (clear cache)
echo.
start http://localhost:3002/form/survey
echo.
echo Form survey dibuka di browser
echo Pastikan tidak ada dropdown Kelurahan/Desa
echo.
pause
