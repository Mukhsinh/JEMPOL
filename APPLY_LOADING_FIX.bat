@echo off
echo ========================================
echo 🔧 MENERAPKAN PERBAIKAN LOADING ISSUE
echo ========================================
echo.

echo 1️⃣ Backup file asli...
if exist "frontend\src\contexts\AuthContext.tsx.backup" (
    echo ⚠️ Backup sudah ada, skip backup
) else (
    copy "frontend\src\contexts\AuthContext.tsx" "frontend\src\contexts\AuthContext.tsx.backup"
    echo ✅ AuthContext.tsx di-backup
)

if exist "frontend\src\components\ProtectedRoute.tsx.backup" (
    echo ⚠️ Backup sudah ada, skip backup
) else (
    copy "frontend\src\components\ProtectedRoute.tsx" "frontend\src\components\ProtectedRoute.tsx.backup"
    echo ✅ ProtectedRoute.tsx di-backup
)

if exist "frontend\src\utils\supabaseClient.ts.backup" (
    echo ⚠️ Backup sudah ada, skip backup
) else (
    copy "frontend\src\utils\supabaseClient.ts" "frontend\src\utils\supabaseClient.ts.backup"
    echo ✅ supabaseClient.ts di-backup
)

echo.
echo 2️⃣ Menerapkan file yang diperbaiki...
copy "frontend\src\contexts\AuthContextFixed.tsx" "frontend\src\contexts\AuthContext.tsx"
echo ✅ AuthContext diperbaiki

copy "frontend\src\components\ProtectedRouteFixed.tsx" "frontend\src\components\ProtectedRoute.tsx"
echo ✅ ProtectedRoute diperbaiki

copy "frontend\src\utils\supabaseClientFixed.ts" "frontend\src\utils\supabaseClient.ts"
echo ✅ supabaseClient diperbaiki

echo.
echo 3️⃣ Membersihkan cache dan restart aplikasi...
cd frontend
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ Vite cache dibersihkan
)

if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ Build cache dibersihkan
)

echo.
echo 4️⃣ Restart aplikasi...
echo 🔄 Menghentikan proses yang berjalan...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🚀 Memulai frontend...
start "Frontend" cmd /c "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🚀 Memulai backend...
start "Backend" cmd /c "cd backend && npm start"

echo.
echo ========================================
echo ✅ PERBAIKAN LOADING ISSUE SELESAI
echo ========================================
echo.
echo 📋 Yang telah diperbaiki:
echo - AuthContext: Timeout dan infinite loop prevention
echo - ProtectedRoute: Loading timeout dengan fallback
echo - SupabaseClient: Connection stability dan error handling
echo.
echo 🌐 Aplikasi akan terbuka di:
echo - Frontend: http://localhost:3001
echo - Backend: http://localhost:3003
echo.
echo ⏰ Tunggu 10-15 detik untuk aplikasi fully loaded
echo.
pause