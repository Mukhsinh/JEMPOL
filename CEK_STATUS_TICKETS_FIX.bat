@echo off
echo ========================================
echo    CEK STATUS APLIKASI TICKETS
echo ========================================
echo.

echo 1. Mengecek Backend (Port 5001)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/health' -Method GET -TimeoutSec 5; Write-Host 'Backend: ONLINE' -ForegroundColor Green; Write-Host 'Response:' $response.Content } catch { Write-Host 'Backend: OFFLINE' -ForegroundColor Red }"
echo.

echo 2. Mengecek Frontend (Port 3001)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001' -Method GET -TimeoutSec 5; Write-Host 'Frontend: ONLINE' -ForegroundColor Green } catch { Write-Host 'Frontend: OFFLINE' -ForegroundColor Red }"
echo.

echo 3. Mengecek Database Connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/complaints/tickets' -Method GET -TimeoutSec 5; Write-Host 'Database: ERROR (Expected 401 - Auth Required)' -ForegroundColor Yellow } catch { if ($_.Exception.Response.StatusCode -eq 'Unauthorized') { Write-Host 'Database: OK (Auth middleware working)' -ForegroundColor Green } else { Write-Host 'Database: ERROR' -ForegroundColor Red } }"
echo.

echo ========================================
echo STATUS SUMMARY
echo ========================================
echo Backend harus ONLINE di port 5001
echo Frontend harus ONLINE di port 3001
echo Database harus OK (Auth middleware working)
echo.
echo Jika semua OK, buka: http://localhost:3001/login
echo Login dengan: admin@jempol.com / admin123
echo.
pause