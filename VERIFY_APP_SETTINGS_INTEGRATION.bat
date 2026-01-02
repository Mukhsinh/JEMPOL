@echo off
echo ========================================
echo   VERIFIKASI INTEGRASI APP SETTINGS
echo ========================================
echo.

echo [1/5] Memeriksa file backend...
if exist "backend\src\controllers\appSettingsController.ts" (
    echo ✅ Controller ditemukan
) else (
    echo ❌ Controller tidak ditemukan
    goto :error
)

if exist "backend\src\routes\appSettingsRoutes.ts" (
    echo ✅ Routes ditemukan
) else (
    echo ❌ Routes tidak ditemukan
    goto :error
)

echo.
echo [2/5] Memeriksa file frontend...
if exist "frontend\src\pages\settings\AppSettings.tsx" (
    echo ✅ Frontend component ditemukan
) else (
    echo ❌ Frontend component tidak ditemukan
    goto :error
)

echo.
echo [3/5] Memeriksa server backend...
curl -s http://localhost:5000/api/app-settings/public > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server berjalan
) else (
    echo ❌ Backend server tidak berjalan
    echo 💡 Jalankan: cd backend && npm run dev
    goto :error
)

echo.
echo [4/5] Memeriksa server frontend...
curl -s http://localhost:3001 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend server berjalan
) else (
    echo ❌ Frontend server tidak berjalan
    echo 💡 Jalankan: cd frontend && npm start
    goto :error
)

echo.
echo [5/5] Membuka halaman test...
start http://localhost:3001/settings/app
echo ✅ Halaman App Settings dibuka

echo.
echo ========================================
echo   INTEGRASI SIAP DIGUNAKAN! ✅
echo ========================================
echo.
echo 📋 Checklist:
echo   ✅ Backend controller tersedia
echo   ✅ Routes terkonfigurasi
echo   ✅ Frontend component tersedia  
echo   ✅ Server backend berjalan
echo   ✅ Server frontend berjalan
echo   ✅ Halaman dibuka
echo.
echo 🔧 Untuk test manual:
echo   1. Buka: http://localhost:3001/settings/app
echo   2. Login dengan akun admin
echo   3. Isi form dan simpan
echo   4. Refresh halaman untuk verifikasi
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo   INTEGRASI BELUM SIAP! ❌
echo ========================================
echo.
echo 🔧 Langkah perbaikan:
echo   1. Pastikan semua file ada
echo   2. Jalankan backend: cd backend && npm run dev
echo   3. Jalankan frontend: cd frontend && npm start
echo   4. Jalankan script ini lagi
echo.
pause
exit /b 1