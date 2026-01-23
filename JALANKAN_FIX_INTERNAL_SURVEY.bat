@echo off
echo ========================================
echo PERBAIKAN SUBMIT TIKET INTERNAL DAN SURVEY
echo ========================================
echo.
echo Mengadopsi solusi dari tiket eksternal yang berhasil...
echo.

node fix-internal-survey-submit.js

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Silakan restart backend dan test submit:
echo 1. Tiket Internal
echo 2. Survey
echo.
pause
