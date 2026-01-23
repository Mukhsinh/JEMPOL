@echo off
echo ========================================
echo DEPLOY PERBAIKAN SUBMIT TIKET VERCEL
echo ========================================
echo.

echo [1/5] Menambahkan file ke Git...
git add .
if errorlevel 1 (
    echo ERROR: Gagal menambahkan file ke Git
    pause
    exit /b 1
)
echo SUKSES: File ditambahkan ke Git
echo.

echo [2/5] Commit perubahan...
git commit -m "fix: perbaikan error submit tiket di Vercel - error 405 dan non-JSON response"
if errorlevel 1 (
    echo WARNING: Tidak ada perubahan untuk di-commit atau commit gagal
    echo Melanjutkan ke push...
)
echo.

echo [3/5] Push ke GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Gagal push ke GitHub
    echo Coba push manual: git push origin main
    pause
    exit /b 1
)
echo SUKSES: Perubahan di-push ke GitHub
echo.

echo [4/5] Menunggu Vercel auto-deploy...
echo Vercel akan otomatis deploy dari GitHub
echo Buka Vercel Dashboard untuk melihat progress:
echo https://vercel.com/dashboard
echo.
timeout /t 5 /nobreak >nul

echo [5/5] Langkah selanjutnya:
echo.
echo 1. Buka Vercel Dashboard
echo 2. Pastikan deployment berhasil (status: Ready)
echo 3. Cek Environment Variables sudah di-set:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo    - VITE_SUPABASE_SERVICE_ROLE_KEY
echo.
echo 4. Test endpoint dengan membuka:
echo    https://your-domain.vercel.app/test-vercel-submit-endpoints.html
echo.
echo 5. Jika masih error, cek Vercel Function Logs:
echo    Dashboard ^> Deployments ^> Functions ^> View Logs
echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Baca PANDUAN_DEPLOY_FIX_SUBMIT_VERCEL.md untuk detail lengkap
echo.
pause
