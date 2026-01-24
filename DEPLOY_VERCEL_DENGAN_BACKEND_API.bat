@echo off
echo ========================================
echo DEPLOY KE VERCEL DENGAN BACKEND API
echo ========================================
echo.

echo [1/5] Install dependencies untuk API...
cd api
call npm install
cd ..
echo.

echo [2/5] Build frontend...
cd frontend
call npm run build
cd ..
echo.

echo [3/5] Verifikasi file API...
if not exist "api\index.ts" (
    echo ERROR: api\index.ts tidak ditemukan!
    pause
    exit /b 1
)
if not exist "api\handlers\auth.ts" (
    echo ERROR: api\handlers\auth.ts tidak ditemukan!
    pause
    exit /b 1
)
echo File API OK
echo.

echo [4/5] Verifikasi vercel.json...
if not exist "vercel.json" (
    echo ERROR: vercel.json tidak ditemukan!
    pause
    exit /b 1
)
echo vercel.json OK
echo.

echo [5/5] Deploy ke Vercel...
echo.
echo PENTING: Pastikan environment variables sudah diset di Vercel:
echo - SUPABASE_URL
echo - SUPABASE_ANON_KEY
echo - SUPABASE_SERVICE_ROLE_KEY (optional)
echo - JWT_SECRET
echo - NODE_ENV=production
echo.
echo Tekan ENTER untuk melanjutkan deploy atau CTRL+C untuk batal...
pause > nul

call vercel --prod

echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
echo.
echo Backend API sekarang tersedia di:
echo - /api/health
echo - /api/auth/login
echo - /api/auth/verify
echo - /api/complaints/*
echo - /api/reports/*
echo - /api/users/*
echo - /api/master-data/*
echo - /api/qr-codes/*
echo - /api/escalation/*
echo - /api/units/*
echo - /api/roles/*
echo - /api/response-templates/*
echo - /api/app-settings/*
echo - /api/ticket-actions/*
echo.
echo Public endpoints tetap tersedia di:
echo - /api/public/internal-tickets
echo - /api/public/external-tickets
echo - /api/public/surveys
echo - /api/public/track-ticket
echo - /api/public/app-settings
echo - /api/public/units
echo.
pause
