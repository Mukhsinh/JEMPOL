@echo off
echo ========================================
echo TEST PERBAIKAN ESKALASI DAN RESPON TIKET
echo ========================================
echo.
echo Membuka halaman test...
echo.
start http://localhost:3003/test-eskalasi-respon-fixed.html
echo.
echo Halaman test dibuka di browser!
echo.
echo INSTRUKSI:
echo 1. Login terlebih dahulu untuk mendapatkan token
echo 2. Copy token dan paste ke form test
echo 3. Masukkan ID tiket yang valid
echo 4. Test eskalasi dan respon
echo.
echo Perbaikan yang dilakukan:
echo - Validasi user authentication sebelum insert
echo - Pastikan from_user_id dan responder_id selalu ada
echo - Return error 401 jika user tidak terautentikasi
echo.
pause
