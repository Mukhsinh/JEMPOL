@echo off
echo ========================================
echo   TEST LOGIN - KISS SYSTEM
echo ========================================
echo.

echo [1/3] Membuka test login di browser...
start "" "test-login-browser-final.html"
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Testing dengan Node.js...
echo.
node reset-password-direct-sql.js

echo.
echo ========================================
echo   INSTRUKSI MANUAL JIKA GAGAL
echo ========================================
echo.
echo Jika login masih gagal, ikuti langkah ini:
echo.
echo 1. Buka Supabase Dashboard:
echo    https://supabase.com/dashboard/project/jxxzbdivafzzwqhagwrf
echo.
echo 2. Ke menu: Authentication ^> Users
echo.
echo 3. Cari user: admin@jempol.com
echo.
echo 4. Klik menu "..." ^> "Reset Password"
echo.
echo 5. Set password baru: admin123
echo.
echo 6. Atau gunakan SQL Editor dan jalankan:
echo    UPDATE auth.users 
echo    SET encrypted_password = crypt('admin123', gen_salt('bf'))
echo    WHERE email = 'admin@jempol.com';
echo.
echo ========================================
echo   KREDENSIAL LOGIN
echo ========================================
echo.
echo Email: admin@jempol.com
echo Password: admin123
echo.
echo URL Login: http://localhost:3002/login
echo.
echo ========================================
echo.
pause
