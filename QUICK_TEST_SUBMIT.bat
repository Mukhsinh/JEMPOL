@echo off
cls
echo.
echo ╔════════════════════════════════════════╗
echo ║   QUICK TEST SUBMIT FORMS              ║
echo ╚════════════════════════════════════════╝
echo.
echo Test database connection dan submit forms...
echo.

node fix-submit-all-forms.js

echo.
echo ========================================
echo.
echo Hasil test di atas menunjukkan:
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ SEMUA TEST BERHASIL!
    echo.
    echo Submit form sudah berfungsi dengan baik.
    echo Silakan lanjutkan dengan test di browser.
    echo.
    echo Untuk test di browser, jalankan:
    echo   PERBAIKI_DAN_TEST_SUBMIT.bat
) else (
    echo ❌ ADA TEST YANG GAGAL
    echo.
    echo Silakan periksa error di atas.
)
echo.
echo ========================================
pause
