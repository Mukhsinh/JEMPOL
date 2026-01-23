@echo off
chcp 65001 >nul
echo ========================================
echo 🔬 DIAGNOSA SUBMIT FORMS
echo ========================================
echo.
echo Menjalankan diagnostic script...
echo.

node diagnose-submit-forms.js

echo.
echo ========================================
echo Diagnostic selesai!
echo ========================================
echo.
pause
