@echo off
echo ========================================
echo MEMERIKSA KONSISTENSI ENVIRONMENT
echo ========================================

echo.
echo 1. Memeriksa Backend Environment:
echo --------------------------------
if exist "backend\.env" (
    echo ✓ Backend .env ditemukan
    findstr /C:"SUPABASE_URL" backend\.env
    findstr /C:"DATABASE_MODE" backend\.env
    findstr /C:"NODE_ENV" backend\.env
) else (
    echo ✗ Backend .env tidak ditemukan!
)

echo.
echo 2. Memeriksa Frontend Environment:
echo ---------------------------------
if exist "frontend\.env" (
    echo ✓ Frontend .env ditemukan
    findstr /C:"VITE_SUPABASE_URL" frontend\.env
    findstr /C:"VITE_API_URL" frontend\.env
    findstr /C:"NODE_ENV" frontend\.env
) else (
    echo ✗ Frontend .env tidak ditemukan!
)

echo.
echo 3. Memeriksa Production Environment:
echo -----------------------------------
if exist "frontend\.env.production" (
    echo ✓ Frontend .env.production ditemukan
    findstr /C:"VITE_SUPABASE_URL" frontend\.env.production
    findstr /C:"VITE_API_URL" frontend\.env.production
    findstr /C:"NODE_ENV" frontend\.env.production
) else (
    echo ✗ Frontend .env.production tidak ditemukan!
)

echo.
echo 4. Memeriksa Vercel Configuration:
echo ---------------------------------
if exist "vercel.json" (
    echo ✓ vercel.json ditemukan
    findstr /C:"VITE_SUPABASE_URL" vercel.json
) else (
    echo ✗ vercel.json tidak ditemukan!
)

echo.
echo ========================================
echo PEMERIKSAAN SELESAI
echo ========================================
pause