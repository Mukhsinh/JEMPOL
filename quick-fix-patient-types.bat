@echo off
echo 🔧 Quick fix untuk patient-types error 403...
echo.

echo 📋 Step 1: Update masterDataService
echo Copy code from masterdata-service-update.txt to frontend/src/services/masterDataService.ts
echo Look for getPatientTypes function and replace with improved version
echo.

echo 📋 Step 2: Update PatientTypes component  
echo Copy code from patient-types-component-update.txt to frontend/src/pages/settings/PatientTypes.tsx
echo Look for fetchPatientTypes function and replace with improved version
echo.

echo 📋 Step 3: Test endpoints
node test-patient-types-comprehensive.js
echo.

echo 📋 Step 4: Start backend if not running
echo cd backend
echo npm start
echo.

echo 📋 Step 5: Test frontend
echo Open http://localhost:3001/admin/settings/patient-types
echo Check browser console for errors
echo.

pause