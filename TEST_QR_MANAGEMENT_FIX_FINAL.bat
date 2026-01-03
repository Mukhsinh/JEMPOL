@echo off
echo 🧪 Testing QR Management Authentication Fix...
echo.

echo 📋 Langkah 1: Memulai backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo 📋 Langkah 2: Memulai frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak > nul

echo 📋 Langkah 3: Membuka test page...
start "" "test-qr-management-session-fix.html"
timeout /t 2 /nobreak > nul

echo 📋 Langkah 4: Membuka aplikasi...
start "" "http://localhost:5173/login"

echo.
echo ✅ Test environment siap!
echo.
echo 📋 Langkah testing:
echo 1. Login dengan akun admin di http://localhost:5173/login
echo 2. Navigasi ke halaman QR Management (/tickets/qr-management)
echo 3. Periksa apakah error 403 masih muncul
echo 4. Test fungsi-fungsi QR Management
echo 5. Periksa console untuk log authentication
echo.
echo 🔍 Jika masih ada masalah:
echo - Periksa console browser untuk error
echo - Periksa network tab untuk failed requests
echo - Periksa apakah token valid di localStorage
echo.
pause