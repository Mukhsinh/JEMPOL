@echo off
echo ========================================
echo MEMULAI APLIKASI DENGAN ENVIRONMENT YANG AMAN
echo ========================================

echo.
echo 1. Memeriksa Node.js dan npm...
node --version
npm --version

echo.
echo 2. Membersihkan cache npm...
npm cache clean --force

echo.
echo 3. Install dependencies untuk root...
npm install

echo.
echo 4. Install dependencies untuk frontend...
cd frontend
npm install
cd ..

echo.
echo 5. Install dependencies untuk backend...
cd backend
npm install
cd ..

echo.
echo 6. Memeriksa environment variables...
call CHECK_ENV_CONSISTENCY.bat

echo.
echo 7. Memulai aplikasi...
echo Frontend akan berjalan di: http://localhost:3001
echo Backend akan berjalan di: http://localhost:3003
echo.
echo Tekan Ctrl+C untuk menghentikan aplikasi
echo.

npm run dev

pause