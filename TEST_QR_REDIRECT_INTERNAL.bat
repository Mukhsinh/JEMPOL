@echo off
echo ========================================
echo TEST QR CODE REDIRECT - INTERNAL TICKET
echo ========================================
echo.
echo QR Code: QR87D3EEDA (Direktur Utama)
echo Redirect Type: internal_ticket
echo.
echo Seharusnya langsung ke form internal ticket
echo TANPA menampilkan menu pilihan
echo.
echo ========================================
echo.
echo Membuka browser untuk test...
echo.

start http://localhost:3002/m/QR87D3EEDA

echo.
echo Browser sudah dibuka!
echo.
echo Cek apakah:
echo [✓] Langsung ke form internal ticket
echo [✓] TIDAK menampilkan menu pilihan
echo [✓] Unit "Direktur Utama" sudah terisi otomatis
echo.
pause
