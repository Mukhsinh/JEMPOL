@echo off
echo ========================================
echo TEST CREATE INTERNAL TICKET - FIXED
echo ========================================
echo.

echo Opening test page in browser...
start http://localhost:3002/form/internal

echo.
echo ========================================
echo Test Instructions:
echo ========================================
echo 1. Fill in all required fields
echo 2. Select a valid unit
echo 3. Select a valid category
echo 4. Click "Kirim Tiket"
echo 5. Check browser console for detailed logs
echo.
echo Backend logs will show:
echo - Received data
echo - Validation results
echo - Database insert attempt
echo - Success or error details
echo.
pause
