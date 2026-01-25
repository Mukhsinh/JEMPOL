@echo off
chcp 65001 >nul
echo ========================================
echo DEPLOY DAN TEST INTERNAL TICKETS
echo ========================================
echo.
echo Perbaikan yang dilakukan:
echo ✅ Tambah fungsi handleDownloadPDF
echo ✅ Verifikasi API endpoint sudah benar
echo ✅ Buat file test untuk verifikasi
echo.
echo ========================================
echo LANGKAH 1: BUILD PROJECT
echo ========================================
echo.

cd frontend
call npm run build
if errorlevel 1 (
    echo ❌ Build gagal!
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Build berhasil!
echo.
echo ========================================
echo LANGKAH 2: COMMIT CHANGES
echo ========================================
echo.

git add .
git commit -m "fix: tambah handleDownloadPDF dan perbaiki error handling submit tiket internal"

echo.
echo ========================================
echo LANGKAH 3: PUSH TO GITHUB
echo ========================================
echo.

git push origin main

echo.
echo ========================================
echo LANGKAH 4: DEPLOY TO VERCEL
echo ========================================
echo.
echo Pilih metode deploy:
echo 1. Auto deploy (via GitHub push)
echo 2. Manual deploy (vercel --prod)
echo.
choice /c 12 /n /m "Pilih (1/2): "

if errorlevel 2 (
    echo.
    echo Deploying ke Vercel...
    vercel --prod
    if errorlevel 1 (
        echo ❌ Deploy gagal!
        pause
        exit /b 1
    )
) else (
    echo.
    echo ⏳ Menunggu auto deploy dari GitHub...
    echo 💡 Cek status di: https://vercel.com/dashboard
    echo.
)

echo.
echo ========================================
echo LANGKAH 5: TEST DI PRODUCTION
echo ========================================
echo.
echo Setelah deploy selesai, test dengan:
echo.
echo 1. Buka test page:
echo    https://your-app.vercel.app/test-vercel-internal-tickets.html
echo.
echo 2. Atau langsung test form:
echo    https://your-app.vercel.app/form/internal?unit_id=xxx^&unit_name=Test
echo.
echo 3. Jalankan test secara berurutan:
echo    - Test 1: OPTIONS request
echo    - Test 2: GET units (copy unit ID)
echo    - Test 3: Submit ticket (paste unit ID)
echo.
echo 4. Perhatikan response:
echo    ✅ Harus JSON
echo    ❌ Jika HTML = routing bermasalah
echo.
echo ========================================
echo TROUBLESHOOTING
echo ========================================
echo.
echo Jika masih error:
echo.
echo 1. Cek Environment Variables di Vercel:
echo    - SUPABASE_URL
echo    - SUPABASE_SERVICE_ROLE_KEY
echo    - SUPABASE_ANON_KEY
echo.
echo 2. Cek Vercel Build Log untuk error
echo.
echo 3. Cek file API ter-deploy:
echo    - api/public/internal-tickets.ts
echo    - api/public/units.ts
echo.
echo 4. Test endpoint langsung:
echo    curl https://your-app.vercel.app/api/public/units
echo.
echo ========================================
echo.
pause
