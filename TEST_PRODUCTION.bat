@echo off
echo ========================================
echo TEST PRODUCTION ENDPOINTS
echo ========================================
echo.

echo Testing production API...
echo.

REM Set production URL
set API_URL=https://jempol-frontend.vercel.app/api

echo API URL: %API_URL%
echo.

REM Test health endpoint
echo 1. Testing Health Check...
curl -s %API_URL%/health
echo.
echo.

REM Test visitors endpoint
echo 2. Testing Get Visitors...
curl -s %API_URL%/visitors
echo.
echo.

REM Test game leaderboard
echo 3. Testing Game Leaderboard...
curl -s %API_URL%/game/leaderboard?limit=5
echo.
echo.

REM Test innovations
echo 4. Testing Get Innovations...
curl -s %API_URL%/innovations
echo.
echo.

echo ========================================
echo TEST COMPLETED
echo ========================================
echo.
echo Jika semua endpoint return JSON data, berarti API berjalan dengan baik.
echo Jika ada error, cek Vercel deployment logs.
echo.

pause
