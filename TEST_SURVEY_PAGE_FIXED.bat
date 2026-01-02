@echo off
echo ========================================
echo TEST SURVEY PAGE - FIXED VERSION
echo ========================================
echo.

echo 1. Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo 2. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 3. Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo 4. Waiting for frontend to start...
timeout /t 10 /nobreak > nul

echo 5. Opening test page...
start "" "test-survey-page-fixed.html"

echo 6. Opening survey page directly...
timeout /t 3 /nobreak > nul
start "" "http://localhost:3001/survey?ticketId=990e8400-e29b-41d4-a716-446655440001"

echo.
echo ========================================
echo TEST SURVEY PAGE STARTED
echo ========================================
echo.
echo Test URLs:
echo - Test Page: test-survey-page-fixed.html
echo - Survey Form: http://localhost:3001/survey?ticketId=990e8400-e29b-41d4-a716-446655440001
echo - Survey Report: http://localhost:3001/survey/report
echo - Backend API: http://localhost:5000/api/health
echo.
echo Press any key to close all servers...
pause > nul

echo Closing servers...
taskkill /f /im node.exe 2>nul
taskkill /f /im cmd.exe /fi "WINDOWTITLE:Backend Server*" 2>nul
taskkill /f /im cmd.exe /fi "WINDOWTITLE:Frontend Server*" 2>nul

echo Done!