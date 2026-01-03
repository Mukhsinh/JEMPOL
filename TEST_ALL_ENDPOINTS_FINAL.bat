@echo off
echo ========================================
echo      TEST SEMUA ENDPOINT - FINAL
echo ========================================
echo.

echo [1/6] Testing Backend Health...
curl -X GET "http://localhost:3003/api/health" -H "Content-Type: application/json"
echo.
echo.

echo [2/6] Testing Public Endpoints...
echo Testing Public Units:
curl -X GET "http://localhost:3003/api/public/units" -H "Content-Type: application/json"
echo.
echo.

echo Testing Public Unit Types:
curl -X GET "http://localhost:3003/api/public/unit-types" -H "Content-Type: application/json"
echo.
echo.

echo [3/6] Testing Master Data Public Endpoints...
echo Testing Public Patient Types:
curl -X GET "http://localhost:3003/api/master-data/public/patient-types" -H "Content-Type: application/json"
echo.
echo.

echo Testing Public Service Categories:
curl -X GET "http://localhost:3003/api/master-data/public/service-categories" -H "Content-Type: application/json"
echo.
echo.

echo [4/6] Testing Auth Endpoint...
echo Testing Login:
curl -X POST "http://localhost:3003/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@jempol.com\",\"password\":\"admin123\"}"
echo.
echo.

echo [5/6] Testing Protected Endpoints (will show auth required)...
echo Testing Tickets (Auth Required):
curl -X GET "http://localhost:3003/api/complaints/tickets" -H "Content-Type: application/json"
echo.
echo.

echo Testing Users (Auth Required):
curl -X GET "http://localhost:3003/api/users" -H "Content-Type: application/json"
echo.
echo.

echo [6/6] Testing Frontend Accessibility...
echo Testing Frontend:
curl -X GET "http://localhost:3001" -I
echo.
echo.

echo ========================================
echo           TEST SELESAI!
echo ========================================
echo.
echo Jika semua endpoint merespons dengan benar:
echo ✅ Backend berjalan di http://localhost:3003
echo ✅ Frontend berjalan di http://localhost:3001
echo ✅ Database terhubung dengan Supabase
echo ✅ Auth system berfungsi
echo.
echo Untuk test lebih detail, buka:
echo http://localhost:3003/api/health
echo.
pause