@echo off
echo ========================================
echo DEPLOY PERBAIKAN KE PRODUCTION
echo ========================================
echo.

echo Perbaikan yang akan di-deploy:
echo 1. Fix error registrasi pengunjung
echo 2. Fix error game (404 dan format data)
echo 3. Fix error CORS untuk materi/video/foto
echo 4. Database migration untuk RLS policies
echo.

echo ========================================
echo CHECKLIST SEBELUM DEPLOY
echo ========================================
echo.
echo [x] Database migration sudah dijalankan
echo [x] Frontend API service sudah diperbaiki
echo [x] Backend CORS sudah dikonfigurasi
echo [x] Game service format data sudah diperbaiki
echo [x] Vercel.json routing sudah diupdate
echo.

pause
echo.

echo ========================================
echo STEP 1: GIT ADD
echo ========================================
echo.
git add .
echo.

echo ========================================
echo STEP 2: GIT COMMIT
echo ========================================
echo.
git commit -m "fix: Perbaiki error registrasi, game, dan CORS untuk production - Fix API URL configuration untuk production - Fix game service data format (camelCase to snake_case) - Update CORS untuk allow Vercel deployments - Apply database migration untuk RLS policies - Update vercel.json routing configuration"
echo.

echo ========================================
echo STEP 3: GIT PUSH
echo ========================================
echo.
git push origin main
echo.

echo ========================================
echo DEPLOY INITIATED
echo ========================================
echo.
echo Vercel akan otomatis deploy setelah push ke GitHub.
echo.
echo Langkah selanjutnya:
echo 1. Buka Vercel Dashboard: https://vercel.com/dashboard
echo 2. Tunggu deployment selesai (2-3 menit)
echo 3. Jalankan TEST_PRODUCTION.bat untuk test
echo.
echo ========================================
echo MONITORING
echo ========================================
echo.
echo Setelah deploy selesai, test hal berikut:
echo.
echo [_] Health Check: https://jempol-frontend.vercel.app/api/health
echo [_] Registrasi: https://jempol-frontend.vercel.app/#registration
echo [_] Game: https://jempol-frontend.vercel.app/game
echo [_] Materi: Buka galeri dan klik foto/video
echo.
echo Jika ada error, cek:
echo - Vercel Function Logs
echo - Browser Console (F12)
echo - Supabase Logs
echo.

pause
