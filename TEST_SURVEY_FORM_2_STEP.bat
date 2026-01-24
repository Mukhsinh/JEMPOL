@echo off
echo ========================================
echo TEST FORM SURVEY 2 STEP
echo ========================================
echo.
echo Membuka form survey dengan 2 step:
echo - Step 1: Identitas Diri (Unit, Nama, HP, Alamat)
echo - Step 2: Form Survey (Penilaian 8 pertanyaan + Saran)
echo.
echo Footer sudah dihapus
echo.
echo ========================================
echo.

start http://localhost:3002/form/survey

echo.
echo Form survey dibuka di browser
echo Silakan cek:
echo 1. Progress bar menunjukkan "Step 1 dari 2" dan "Step 2 dari 2"
echo 2. Step 1 berisi: Unit Tujuan, Nama, HP, dan Alamat
echo 3. Step 2 berisi: Penilaian 8 pertanyaan + Saran
echo 4. Footer sudah tidak ada
echo.
pause
