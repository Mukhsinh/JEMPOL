@echo off
echo ========================================
echo TEST FORM SUBMIT DI VERCEL
echo ========================================
echo.
echo Membuka form tiket internal dan survey untuk testing...
echo.

REM Test form tiket internal
start "" "https://jempol-frontend.vercel.app/form/internal?unit_id=test&unit_name=Jlamprang"

timeout /t 3 /nobreak >nul

REM Test form survey
start "" "https://jempol-frontend.vercel.app/form/survey?unit_id=test&unit_name=Jlamprang"

echo.
echo ========================================
echo INSTRUKSI TESTING:
echo ========================================
echo.
echo 1. FORM TIKET INTERNAL:
echo    - Isi semua field yang wajib
echo    - Pilih unit dari dropdown
echo    - Klik tombol "Kirim Tiket"
echo    - Pastikan tidak ada error JSON
echo.
echo 2. FORM SURVEY:
echo    - Isi nomor HP (wajib)
echo    - Pilih unit dari dropdown
echo    - Isi skor pertanyaan
echo    - Klik tombol "Kirim Survey"
echo    - Pastikan tidak ada error JSON
echo.
echo 3. CEK DROPDOWN UNIT:
echo    - Pastikan dropdown menampilkan data unit
echo    - Tidak ada error "Unexpected end of JSON input"
echo.
echo ========================================
echo PERBAIKAN YANG DILAKUKAN:
echo ========================================
echo.
echo 1. Tambah Content-Type header di semua API
echo 2. Validasi Supabase credentials
echo 3. Return JSON valid meskipun error
echo 4. Selalu sertakan data array kosong jika gagal
echo 5. Perbaiki integrasi data master units
echo.
pause
