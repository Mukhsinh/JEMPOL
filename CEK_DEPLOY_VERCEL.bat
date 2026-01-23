@echo off
echo ========================================
echo CEK STATUS DEPLOY VERCEL
echo ========================================
echo.

echo Membuka Vercel Dashboard...
start https://vercel.com/dashboard

echo.
echo ========================================
echo INSTRUKSI CEK DEPLOY
echo ========================================
echo.
echo 1. Login ke Vercel Dashboard
echo 2. Pilih project JEMPOL
echo 3. Lihat status deployment terakhir
echo 4. Tunggu hingga status "Ready" (hijau)
echo 5. Klik "Visit" untuk buka aplikasi
echo.
echo Jika deploy berhasil:
echo - Status: Ready (hijau)
echo - Duration: ~2-3 menit
echo - No errors di Functions tab
echo.
echo Jika deploy gagal:
echo - Status: Error (merah)
echo - Klik deployment untuk lihat logs
echo - Cek Functions tab untuk error details
echo.
echo Setelah deploy selesai, test aplikasi:
echo - Buka halaman Units Management
echo - Cek console browser (F12)
echo - Pastikan tidak ada error
echo.
pause
