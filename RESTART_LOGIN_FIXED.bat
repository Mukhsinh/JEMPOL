@echo off
echo ========================================
echo 🔧 RESTART LOGIN FIXED
echo ========================================

echo.
echo 1️⃣ Menghentikan aplikasi yang berjalan...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 >nul

echo.
echo 2️⃣ Membersihkan cache dan build...
if exist "frontend\dist" rmdir /s /q "frontend\dist"
if exist "frontend\.vite" rmdir /s /q "frontend\.vite"
if exist "backend\dist" rmdir /s /q "backend\dist"
echo ✅ Cache dibersihkan

echo.
echo 3️⃣ Memverifikasi konfigurasi Supabase...
echo Frontend .env:
findstr "VITE_SUPABASE_URL" frontend\.env
findstr "VITE_SUPABASE_ANON_KEY" frontend\.env | findstr /C:"jxxzbdivafzzwqhagwrf"
echo.
echo Backend .env:
findstr "SUPABASE_URL" backend\.env
findstr "SUPABASE_ANON_KEY" backend\.env | findstr /C:"jxxzbdivafzzwqhagwrf"

echo.
echo 4️⃣ Memulai backend...
start "Backend Server" cmd /c "cd backend && npm run dev"
timeout /t 5 >nul

echo.
echo 5️⃣ Memulai frontend...
start "Frontend Server" cmd /c "cd frontend && npm run dev"
timeout /t 3 >nul

echo.
echo 6️⃣ Membuka test login...
timeout /t 5 >nul
start "" "test-login-fix-final.html"

echo.
echo ========================================
echo ✅ APLIKASI BERHASIL DIRESTART
echo ========================================
echo.
echo 📋 Informasi Login:
echo - URL Frontend: http://localhost:3001
echo - URL Backend: http://localhost:3003
echo - Test Page: test-login-fix-final.html
echo.
echo 🔐 Kredensial untuk testing:
echo - admin@kiss.com / admin123
echo - test@admin.com / test123
echo.
echo 💡 Langkah selanjutnya:
echo 1. Buka test-login-fix-final.html
echo 2. Klik "Bersihkan Cache & Session"
echo 3. Test login dengan kredensial di atas
echo 4. Jika berhasil, buka http://localhost:3001
echo.
pause