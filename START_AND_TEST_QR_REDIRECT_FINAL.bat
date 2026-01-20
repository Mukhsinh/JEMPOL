@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     START DAN TEST QR REDIRECT KE FORM - FINAL FIX        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/5] Checking current processes...
netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend sudah running di port 3001
) else (
    echo ⚠️  Backend belum running, akan distart...
    cd backend
    start "Backend Server - Port 3001" cmd /k "npm run dev"
    cd ..
    timeout /t 5 /nobreak >nul
)

echo.
netstat -ano | findstr ":3002" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend sudah running di port 3002
) else (
    echo ⚠️  Frontend belum running, akan distart...
    cd frontend
    start "Frontend Server - Port 3002" cmd /k "npm run dev"
    cd ..
    timeout /t 10 /nobreak >nul
)

echo.
echo [2/5] Waiting for servers to be ready...
timeout /t 3 /nobreak >nul

echo.
echo [3/5] Opening test page...
start http://localhost:3002/test-qr-redirect-form.html

echo.
echo [4/5] Opening QR Management page...
timeout /t 2 /nobreak >nul
start http://localhost:3002/tickets/qr-management

echo.
echo [5/5] Done!
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    APLIKASI SIAP DITEST                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📍 Backend:        http://localhost:3001
echo 📍 Frontend:       http://localhost:3002
echo 📍 Test Page:      http://localhost:3002/test-qr-redirect-form.html
echo 📍 QR Management:  http://localhost:3002/tickets/qr-management
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    CARA TEST REDIRECT                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🔍 METODE 1: Test di QR Management
echo    1. Login ke dashboard admin
echo    2. Buka menu: Tickets → QR Code Management
echo    3. Lihat kolom "Redirect"
echo    4. Klik link "Lihat" atau tombol "Salin"
echo    5. Buka link di tab baru
echo    6. VERIFIKASI:
echo       ✅ Langsung tampil form input
echo       ✅ TIDAK ADA sidebar navigasi
echo       ✅ TIDAK PERLU login
echo.
echo 🧪 METODE 2: Test dengan Halaman Test
echo    1. Gunakan halaman test yang sudah dibuka
echo    2. Klik tombol test yang tersedia
echo    3. Cek URL yang dihasilkan
echo    4. Test redirect langsung
echo.
echo 📱 METODE 3: Test dengan QR Code Scanner
echo    1. Scan QR code dengan HP
echo    2. Pastikan langsung ke form
echo    3. Tidak ada sidebar
echo    4. Bisa langsung isi form
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  PERBAIKAN YANG DILAKUKAN                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ✅ MobileFormLanding.tsx - Fixed redirect route
echo    Dari: /m/tiket-internal, /m/pengaduan, /m/survei
echo    Ke:   /form/internal, /form/eksternal, /form/survey
echo.
echo ✅ Semua redirect sekarang konsisten:
echo    • /form/internal     → DirectInternalTicketForm (NO SIDEBAR)
echo    • /form/eksternal    → DirectExternalTicketForm (NO SIDEBAR)
echo    • /form/survey       → DirectSurveyForm (NO SIDEBAR)
echo.
echo ✅ Route /form/... karakteristik:
echo    • Tidak ada sidebar navigasi
echo    • Tidak perlu login
echo    • Mobile-first design
echo    • Auto-fill unit dari QR code
echo    • Clean UI fokus pada form
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    EXPECTED BEHAVIOR                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo SEBELUM PERBAIKAN:
echo ❌ Klik redirect → Muncul halaman dengan sidebar
echo ❌ Form tidak tampil atau error
echo ❌ User bingung
echo.
echo SESUDAH PERBAIKAN:
echo ✅ Klik redirect → Langsung ke form input
echo ✅ Tidak ada sidebar
echo ✅ Tidak perlu login
echo ✅ User langsung bisa isi form
echo.
echo ════════════════════════════════════════════════════════════
echo Tekan tombol apapun untuk menutup window ini...
pause >nul
