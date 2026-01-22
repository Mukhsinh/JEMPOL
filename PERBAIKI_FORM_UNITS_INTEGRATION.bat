@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║   🔧 PERBAIKAN INTEGRASI UNITS UNTUK FORM VERCEL            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📋 Masalah yang diperbaiki:
echo    1. Form tiket internal tidak bisa load units
echo    2. Form survey tidak bisa submit (unit_id kosong)
echo    3. Dropdown units tidak terisi
echo    4. Error JSON parsing di Vercel
echo.
echo ⏳ Memulai perbaikan...
echo.

echo [1/4] 🔍 Verifikasi file yang sudah diperbaiki...
if exist "frontend\src\pages\public\DirectInternalTicketForm.tsx" (
    echo     ✅ DirectInternalTicketForm.tsx - OK
) else (
    echo     ❌ DirectInternalTicketForm.tsx - NOT FOUND
    goto :error
)

if exist "api\public\units.ts" (
    echo     ✅ api/public/units.ts - OK
) else (
    echo     ❌ api/public/units.ts - NOT FOUND
    goto :error
)

if exist "api\public\internal-tickets.ts" (
    echo     ✅ api/public/internal-tickets.ts - OK
) else (
    echo     ❌ api/public/internal-tickets.ts - NOT FOUND
    goto :error
)

if exist "api\public\surveys.ts" (
    echo     ✅ api/public/surveys.ts - OK
) else (
    echo     ❌ api/public/surveys.ts - NOT FOUND
    goto :error
)

echo.
echo [2/4] 🧪 Membuka test page...
start http://localhost:5173/test-form-units-integration.html
timeout /t 2 >nul

echo.
echo [3/4] 📝 Ringkasan Perbaikan:
echo.
echo     ✅ DirectInternalTicketForm.tsx:
echo        - Improved error handling untuk fetch units
echo        - Validasi content-type response
echo        - Auto-select unit dari URL parameter
echo        - Better logging untuk debugging
echo.
echo     ✅ api/public/units.ts:
echo        - Return format: { success: true, data: [...] }
echo        - CORS headers yang benar
echo        - Error handling yang lebih baik
echo.
echo     ✅ api/public/internal-tickets.ts:
echo        - Validasi unit_id yang lebih ketat
echo        - Verifikasi unit exists dan aktif
echo        - Better error messages
echo.
echo     ✅ api/public/surveys.ts:
echo        - Validasi unit_id required
echo        - Verifikasi unit exists dan aktif
echo        - Improved error handling
echo.

echo [4/4] 🚀 Langkah Selanjutnya:
echo.
echo     1. Jalankan test di browser yang terbuka
echo     2. Pastikan semua test ✅ SUCCESS
echo     3. Test manual:
echo        - Buka: http://localhost:5173/form/internal?unit_id=xxx
echo        - Pastikan dropdown units terisi
echo        - Coba submit form
echo.
echo     4. Deploy ke Vercel:
echo        vercel --prod
echo.
echo     5. Test di Vercel:
echo        - Buka: https://your-app.vercel.app/form/internal?unit_id=xxx
echo        - Pastikan dropdown units terisi
echo        - Coba submit form
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ✅ PERBAIKAN SELESAI                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 💡 Tips:
echo    - Jika dropdown masih kosong, cek console browser untuk error
echo    - Pastikan tabel 'units' di Supabase ada data
echo    - Pastikan environment variables di Vercel sudah benar
echo.
pause
goto :end

:error
echo.
echo ❌ ERROR: File tidak ditemukan!
echo    Pastikan Anda menjalankan script ini dari root project.
echo.
pause
exit /b 1

:end
