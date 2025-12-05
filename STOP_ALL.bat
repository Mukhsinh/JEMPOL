@echo off
echo ========================================
echo   JEMPOL Landing Page - Shutdown
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul

echo.
echo ========================================
echo   All servers stopped
echo ========================================
echo.
pause
