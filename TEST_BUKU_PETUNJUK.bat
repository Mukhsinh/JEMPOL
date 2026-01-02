@echo off
echo ========================================
echo    TEST HALAMAN BUKU PETUNJUK KISS
echo ========================================
echo.
echo Memulai aplikasi untuk test halaman buku petunjuk...
echo.
echo Fitur yang akan ditest:
echo - Tombol "Kembali ke Dashboard"
echo - Tombol "Baca Online" untuk setiap e-book
echo - Tombol "Unduh PDF" untuk setiap e-book
echo - Konten e-book "Alur Teknis" yang sudah lengkap
echo - Informasi kontak yang sudah diperbaiki
echo.
echo URL yang akan dibuka: http://localhost:3003/buku-petunjuk
echo.

start "" "http://localhost:3003/buku-petunjuk"

echo.
echo ========================================
echo PANDUAN TESTING:
echo ========================================
echo.
echo 1. TOMBOL KEMBALI KE DASHBOARD:
echo    - Klik tombol "Kembali ke Dashboard" di bagian atas
echo    - Pastikan navigasi kembali ke /dashboard
echo.
echo 2. TOMBOL BACA ONLINE:
echo    - Klik "Baca Online" pada setiap e-book
echo    - Pastikan membuka halaman HTML di tab baru
echo    - Verifikasi konten e-book "Alur Teknis" sudah lengkap
echo.
echo 3. TOMBOL UNDUH PDF:
echo    - Klik "Unduh PDF" pada setiap e-book
echo    - Pastikan file PDF ter-download
echo    - Buka PDF dan verifikasi konten lengkap
echo.
echo 4. INFORMASI KONTAK:
echo    - Scroll ke bawah ke bagian "Butuh Bantuan?"
echo    - Verifikasi informasi kontak:
echo      * Email: support@kiss-app.com
echo      * Website: www.kiss-app.com  
echo      * WhatsApp: http://wa.me/085726112001
echo.
echo 5. VERIFIKASI E-BOOK ALUR TEKNIS:
echo    - Buka e-book "Alur Teknis"
echo    - Pastikan berisi 9 bab lengkap:
echo      * Arsitektur Sistem
echo      * Database Schema dan Relasi
echo      * API Architecture
echo      * Alur Data dan Proses
echo      * Integrasi Sistem
echo      * Security Implementation
echo      * Performance Optimization
echo      * Monitoring dan Logging
echo      * Deployment Architecture
echo.
echo ========================================
echo STATUS FILE PDF:
echo ========================================
if exist "frontend\public\pdfs\ebook-gambaran-umum-kiss.pdf" (
    echo ✓ PDF Gambaran Umum: TERSEDIA
) else (
    echo ✗ PDF Gambaran Umum: TIDAK TERSEDIA
)

if exist "frontend\public\pdfs\ebook-alur-teknis-kiss.pdf" (
    echo ✓ PDF Alur Teknis: TERSEDIA
) else (
    echo ✗ PDF Alur Teknis: TIDAK TERSEDIA
)

if exist "frontend\public\pdfs\ebook-petunjuk-teknis-kiss.pdf" (
    echo ✓ PDF Petunjuk Teknis: TERSEDIA
) else (
    echo ✗ PDF Petunjuk Teknis: TIDAK TERSEDIA
)

echo.
echo ========================================
echo CATATAN PENTING:
echo ========================================
echo.
echo - Pastikan aplikasi frontend sudah berjalan di port 3003
echo - Jika PDF tidak ter-download, jalankan: npm run generate-ebook-pdfs
echo - Semua tombol HTML dan Markdown sudah dihapus
echo - Hanya tersedia "Baca Online" dan "Unduh PDF"
echo.
pause