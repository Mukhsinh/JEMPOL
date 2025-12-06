@echo off
echo ========================================
echo PUSH PROJECT KE GITHUB - MANUAL
echo ========================================
echo.
echo Repository: https://github.com/boshadi3030/JEMPOL
echo.
echo PENTING: Siapkan Personal Access Token Anda!
echo.
echo Jika belum punya atau token lama tidak berfungsi:
echo 1. Buka: https://github.com/settings/tokens
echo 2. Klik "Generate new token (classic)"
echo 3. Centang "repo" (semua sub-item)
echo 4. Generate dan copy token
echo.
echo Baca panduan lengkap di: BUAT_TOKEN_GITHUB_BARU.md
echo.
pause

REM Reset remote
echo [1/5] Reset remote URL...
git remote remove origin 2>nul
git remote add origin https://github.com/boshadi3030/JEMPOL.git
echo.

REM Cek status
echo [2/5] Cek status git...
git status
echo.

REM Add files
echo [3/5] Tambahkan semua file...
git add .
echo.

REM Commit
echo [4/5] Commit perubahan...
git commit -m "Update: Push aplikasi JEMPOL ke GitHub"
echo.

REM Push
echo [5/5] Push ke GitHub...
echo.
echo Anda akan diminta login:
echo - Username: boshadi3030
echo - Password: PASTE TOKEN ANDA (bukan password biasa!)
echo.
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo BERHASIL!
    echo ========================================
    echo.
    echo Project sudah tersimpan di GitHub
    echo Cek di: https://github.com/boshadi3030/JEMPOL
) else (
    echo ========================================
    echo GAGAL!
    echo ========================================
    echo.
    echo Kemungkinan masalah:
    echo 1. Token tidak valid atau expired
    echo 2. Token tidak punya permission "repo"
    echo 3. Repository belum dibuat di GitHub
    echo.
    echo Baca solusi di: BUAT_TOKEN_GITHUB_BARU.md
)

echo.
pause
