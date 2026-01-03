@echo off
echo ========================================
echo    STOP DAN RESTART APLIKASI FIXED
echo ========================================
echo.

echo 🛑 Menghentikan aplikasi yang sedang berjalan...

echo 📱 Killing processes on port 3001 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Killing PID %%a
    taskkill /PID %%a /F 2>nul
)

echo 🖥️ Killing processes on port 3003 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3003') do (
    echo Killing PID %%a
    taskkill /PID %%a /F 2>nul
)

echo 🧹 Killing any remaining Node processes...
taskkill /IM node.exe /F 2>nul
taskkill /IM npm.exe /F 2>nul

echo.
echo ⏳ Waiting for processes to terminate...
timeout /t 3 /nobreak > nul

echo.
echo 🚀 Starting aplikasi dengan perbaikan...
echo Backend akan berjalan di port 3003
echo Frontend akan berjalan di port 3001
echo.

start "Backend Server - FIXED" cmd /k "cd backend && echo Starting Backend with fixes... && npm run dev"
timeout /t 5 /nobreak > nul
start "Frontend Server - FIXED" cmd /k "cd frontend && echo Starting Frontend with fixes... && npm run dev"

echo.
echo ✅ Aplikasi sedang dimulai dengan perbaikan...
echo 🌐 Tunggu beberapa detik, lalu buka: http://localhost:3001
echo.
echo 📋 Perbaikan yang diterapkan:
echo 1. ✅ Fixed TypeScript errors di supabaseClient.ts
echo 2. ✅ Added timeout handling di AuthContext.tsx
echo 3. ✅ Improved error handling dan loading states
echo 4. ✅ Added connection health checks
echo.
echo 🔍 Jika masih loading:
echo 1. Buka Developer Tools (F12)
echo 2. Lihat tab Console untuk error
echo 3. Test koneksi: buka test-supabase-connection-fix.html
echo 4. Coba refresh halaman (Ctrl+F5)
echo.
echo 👤 Login credentials (jika diperlukan):
echo Email: admin@jempol.com
echo Password: admin123
echo.
pause