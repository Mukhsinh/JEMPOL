@echo off
echo ========================================
echo TEST SUBMIT TIKET INTERNAL DAN SURVEY
echo ========================================
echo.
echo Membuka halaman test untuk submit tiket internal dan survey...
echo.

start "" "http://localhost:5173/form/internal?qr=QR-MKP2FMYY&unit_id=7bac7321-86e2-4dce-936d-2adde223c314&unit_name=Jlamprang&auto_fill=true"

timeout /t 2 /nobreak >nul

start "" "http://localhost:5173/form/survey?qr=QR-MKP2FMYY&unit_id=7bac7321-86e2-4dce-936d-2adde223c314&unit_name=Jlamprang&auto_fill=true"

echo.
echo ✅ Halaman test dibuka
echo.
echo INSTRUKSI TEST:
echo 1. Isi form tiket internal dan klik submit
echo 2. Isi form survey dan klik submit
echo 3. Periksa apakah submit berhasil tanpa error JSON
echo.
pause
