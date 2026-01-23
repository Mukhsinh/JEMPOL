@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          🧪 TEST SUBMIT FORMS - KISS                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 PERBAIKAN YANG SUDAH DILAKUKAN:
echo.
echo    ✅ api/public/surveys.ts - Fixed double catch block
echo    ✅ api/public/external-tickets.ts - Better error handling
echo    ✅ api/public/internal-tickets.ts - Already working well
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 🚀 Membuka halaman test...
echo.

start http://localhost:5173/test-all-submit-forms.html

timeout /t 2 >nul

echo.
echo ✅ Halaman test dibuka!
echo.
echo 📋 INSTRUKSI:
echo.
echo    1. Pastikan backend running: cd backend ^&^& npm run dev
echo    2. Pastikan frontend running: cd frontend ^&^& npm run dev
echo    3. Klik "TEST SEMUA FORM SEKALIGUS" di browser
echo    4. Lihat hasil test untuk setiap form
echo.
echo 🔍 EXPECTED RESULTS:
echo.
echo    ✅ Internal Ticket: Status 201, ticket_number: INT-2026-XXXX
echo    ✅ External Ticket: Status 201, ticket_number: TKT-2026-XXXX
echo    ✅ Survey: Status 201, message: "Survei berhasil dikirim"
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
