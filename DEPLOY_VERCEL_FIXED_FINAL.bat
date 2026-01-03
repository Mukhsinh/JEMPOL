@echo off
echo ========================================
echo DEPLOY VERCEL - PERBAIKAN FINAL
echo ========================================

echo.
echo [1/4] Membersihkan cache dan dependencies...
cd frontend
if exist node_modules rmdir /s /q node_modules 2>nul
if exist dist rmdir /s /q dist 2>nul
npm cache clean --force

echo.
echo [2/4] Install dependencies frontend...
npm install

echo.
echo [3/4] Test build lokal...
npm run build

echo.
echo [4/4] Deploy ke Vercel...
cd ..
vercel --prod

echo.
echo ========================================
echo DEPLOY SELESAI!
echo ========================================
pause