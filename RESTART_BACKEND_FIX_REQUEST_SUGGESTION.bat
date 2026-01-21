@echo off
echo ========================================
echo RESTART BACKEND - FIX REQUEST & SUGGESTION
echo ========================================
echo.
echo Mematikan backend yang sedang berjalan...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Memulai backend dengan perbaikan...
cd backend
start "Backend Server - Fixed" cmd /k "npm run dev"

echo.
echo ========================================
echo Backend berhasil di-restart!
echo ========================================
echo.
echo Perbaikan yang diterapkan:
echo - Mapping service_type: request -^> information
echo - Mapping service_type: survey -^> satisfaction
echo - Pengaduan (complaint) tetap berfungsi normal
echo - Saran (suggestion) tetap berfungsi normal
echo.
echo Silakan test form dengan:
echo 1. Pengaduan (complaint) - harus berhasil
echo 2. Permintaan (request) - harus berhasil
echo 3. Saran (suggestion) - harus berhasil
echo 4. Survei (survey) - harus berhasil
echo.
pause
