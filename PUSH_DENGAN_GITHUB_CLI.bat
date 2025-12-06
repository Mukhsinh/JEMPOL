@echo off
echo ========================================
echo PUSH KE GITHUB DENGAN GITHUB CLI
echo ========================================
echo.
echo Cara ini lebih mudah dan tidak perlu token manual!
echo.

REM Cek apakah GitHub CLI sudah terinstall
where gh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo GitHub CLI belum terinstall!
    echo.
    echo Silakan install dulu:
    echo 1. Buka: https://cli.github.com/
    echo 2. Download dan install GitHub CLI
    echo 3. Restart Command Prompt
    echo 4. Jalankan script ini lagi
    echo.
    pause
    exit /b 1
)

echo GitHub CLI sudah terinstall! ✓
echo.

REM Login ke GitHub
echo [1/3] Login ke GitHub...
echo.
echo Anda akan diminta:
echo 1. Pilih: GitHub.com
echo 2. Pilih: HTTPS
echo 3. Pilih: Login with a web browser
echo 4. Copy kode yang muncul
echo 5. Tekan Enter, browser akan terbuka
echo 6. Paste kode dan authorize
echo.
gh auth login

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Login gagal! Coba lagi.
    pause
    exit /b 1
)

echo.
echo Login berhasil! ✓
echo.

REM Cek apakah repository sudah ada
echo [2/3] Cek repository...
gh repo view boshadi3030/JEMPOL >nul 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo Repository belum ada, membuat repository baru...
    echo.
    gh repo create JEMPOL --public --source=. --remote=origin
    echo.
    echo Repository dibuat! ✓
) else (
    echo Repository sudah ada! ✓
    echo.
    REM Pastikan remote sudah benar
    git remote remove origin 2>nul
    git remote add origin https://github.com/boshadi3030/JEMPOL.git
)

echo.
echo [3/3] Push ke GitHub...
git add .
git commit -m "Initial commit - Aplikasi JEMPOL lengkap" 2>nul
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo BERHASIL! ✓✓✓
    echo ========================================
    echo.
    echo Project sudah tersimpan di GitHub!
    echo.
    echo Lihat di: https://github.com/boshadi3030/JEMPOL
    echo.
    echo Langkah selanjutnya:
    echo - Deploy ke Vercel untuk hosting online
    echo - Jalankan: DEPLOY_VERCEL.md
) else (
    echo ========================================
    echo GAGAL!
    echo ========================================
    echo.
    echo Coba solusi lain di: CEK_DAN_FIX_TOKEN.md
)

echo.
pause
