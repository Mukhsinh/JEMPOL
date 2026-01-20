@echo off
echo ========================================
echo TEST QR REDIRECT LINK
echo ========================================
echo.
echo Membuka browser untuk test redirect link QR Code...
echo.
echo PENTING:
echo - Link harus mengarah ke /form/internal (TANPA SIDEBAR)
echo - BUKAN ke /tickets/create/internal (DENGAN SIDEBAR)
echo.
echo Contoh URL yang BENAR:
echo http://localhost:3003/form/internal?qr=XXX^&unit_id=YYY^&unit_name=ZZZ
echo.
echo Contoh URL yang SALAH:
echo http://localhost:3003/tickets/create/internal?unit_id=YYY
echo.
pause
echo.
echo Membuka test page...
start http://localhost:3003/form/internal?qr=TEST123^&unit_id=550e8400-e29b-41d4-a716-446655440004^&unit_name=Bagian%%20Keuangan
echo.
echo Jika halaman yang terbuka:
echo [V] TANPA SIDEBAR dan TANPA LOGIN = BENAR
echo [X] DENGAN SIDEBAR atau PERLU LOGIN = SALAH
echo.
pause
