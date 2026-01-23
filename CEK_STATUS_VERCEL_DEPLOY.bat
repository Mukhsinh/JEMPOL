@echo off
echo ========================================
echo CEK STATUS DEPLOYMENT VERCEL
echo ========================================
echo.

echo Membuka Vercel Dashboard...
start https://vercel.com/dashboard
echo.

echo Checklist yang perlu dicek:
echo.
echo [1] STATUS DEPLOYMENT
echo     - Buka tab Deployments
echo     - Cek status deployment terbaru
echo     - Harus: Ready (hijau)
echo     - Jika Failed (merah), klik untuk lihat error
echo.

echo [2] ENVIRONMENT VARIABLES
echo     - Buka tab Settings ^> Environment Variables
echo     - Pastikan sudah ada:
echo       * VITE_SUPABASE_URL
echo       * VITE_SUPABASE_ANON_KEY
echo       * VITE_SUPABASE_SERVICE_ROLE_KEY
echo     - Pastikan di-set untuk: Production, Preview, Development
echo.

echo [3] FUNCTION LOGS
echo     - Buka Deployments ^> Klik deployment terbaru
echo     - Klik tab Functions
echo     - Cek logs untuk error
echo     - Cari file: api/public/internal-tickets.ts
echo.

echo [4] TEST ENDPOINT
echo     - Buka: https://your-domain.vercel.app/test-vercel-submit-endpoints.html
echo     - Test setiap endpoint
echo     - Cek response harus JSON, bukan HTML
echo.

echo [5] BROWSER CONSOLE
echo     - Buka aplikasi di browser
echo     - Tekan F12 untuk buka DevTools
echo     - Cek tab Console untuk error
echo     - Cek tab Network untuk request/response
echo.

echo ========================================
echo TIPS TROUBLESHOOTING
echo ========================================
echo.
echo Jika masih error 405:
echo - Cek file ada di folder api/public/
echo - Cek vercel.json routing
echo - Redeploy: vercel --prod --force
echo.
echo Jika response bukan JSON:
echo - Cek Content-Type header
echo - Cek error handling di code
echo - Cek Vercel Function Logs
echo.
echo Jika env vars tidak terbaca:
echo - Set di Vercel Dashboard
echo - Redeploy setelah set
echo - Cek logs untuk "MISSING"
echo.
pause
