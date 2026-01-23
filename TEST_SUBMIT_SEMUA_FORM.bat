@echo off
chcp 65001 >nul
echo ========================================
echo 🧪 TEST SUBMIT SEMUA FORM - KISS
echo ========================================
echo.
echo Membuka halaman test untuk:
echo 1. Tiket Internal
echo 2. Tiket Eksternal  
echo 3. Survey
echo.
echo ⏳ Membuka browser...
echo.

start http://localhost:5173/test-all-submit-forms.html

timeout /t 2 >nul

echo.
echo ✅ Halaman test dibuka!
echo.
echo 📋 INSTRUKSI:
echo 1. Klik tombol "TEST SEMUA FORM SEKALIGUS"
echo 2. Atau test satu per satu
echo 3. Lihat hasil di masing-masing section
echo.
echo ⚠️ PASTIKAN:
echo - Backend sudah running (npm run dev di folder backend)
echo - Frontend sudah running (npm run dev di folder frontend)
echo - Database Supabase sudah terhubung
echo.
pause
