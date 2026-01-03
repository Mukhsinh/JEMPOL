@echo off
echo ========================================
echo 🚀 START AND TEST LOGIN FIX
echo ========================================
echo.

echo 📋 Informasi Login:
echo Email: admin@jempol.com
echo Password: [masukkan password yang benar]
echo.

echo 🔧 Perbaikan yang telah dilakukan:
echo ✅ Admin admin@jempol.com sudah ditambahkan ke database
echo ✅ AuthContext diperbaiki dengan multiple fallback strategies
echo ✅ Supabase client dikonfigurasi ulang
echo.

echo 🚀 Memulai aplikasi...
echo.

echo 📂 Membuka frontend...
cd frontend
start cmd /k "npm run dev"

echo.
echo ⏳ Menunggu frontend siap...
timeout /t 5 /nobreak > nul

echo.
echo 📂 Membuka backend...
cd ..\backend
start cmd /k "npm run dev"

echo.
echo ⏳ Menunggu backend siap...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Membuka browser untuk test...
timeout /t 3 /nobreak > nul
start "" "http://localhost:3001"

echo.
echo ✅ Aplikasi telah dimulai!
echo.
echo 📋 Langkah selanjutnya:
echo 1. Tunggu hingga aplikasi fully loaded
echo 2. Buka halaman login
echo 3. Masukkan email: admin@jempol.com
echo 4. Masukkan password yang benar
echo 5. Klik login
echo.
echo 🔍 Periksa console browser untuk log detail
echo 📊 Periksa Network tab untuk melihat request/response
echo.
echo ❓ Jika masih error 406:
echo - Periksa console untuk error detail
echo - Coba refresh halaman
echo - Pastikan backend berjalan di port 3003
echo.
pause