@echo off
echo ========================================
echo PUSH PROJECT KE GITHUB
echo ========================================
echo.
echo Repository: https://github.com/boshadi3030/JEMPOL.git
echo.

REM Cek status git
echo [1/4] Mengecek status git...
git status
echo.

REM Tambahkan semua perubahan
echo [2/4] Menambahkan semua file...
git add .
echo.

REM Commit perubahan
echo [3/4] Commit perubahan...
set /p commit_msg="Masukkan pesan commit (atau tekan Enter untuk 'Update project'): "
if "%commit_msg%"=="" set commit_msg=Update project
git commit -m "%commit_msg%"
echo.

REM Push ke GitHub
echo [4/4] Push ke GitHub...
echo.
echo PENTING: Anda akan diminta login GitHub
echo - Username: boshadi3030
echo - Password: Gunakan Personal Access Token (bukan password biasa)
echo.
echo Cara membuat Personal Access Token:
echo 1. Buka: https://github.com/settings/tokens
echo 2. Klik "Generate new token (classic)"
echo 3. Beri nama token, centang "repo"
echo 4. Copy token yang muncul
echo 5. Paste sebagai password saat diminta
echo.
pause

git push -u origin main

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Cek hasil di: https://github.com/boshadi3030/JEMPOL
echo.
pause
