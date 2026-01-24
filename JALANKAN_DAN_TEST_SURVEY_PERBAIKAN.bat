@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════════╗
echo ║   TEST FORM SURVEY - PERBAIKAN IDENTITAS RESPONDEN        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ✅ Perbaikan yang sudah dilakukan:
echo.
echo 1. USIA - Diubah ke Dropdown
echo    └─ Pilihan: ^<20, 20-40, 41-60, ^>60 Tahun
echo.
echo 2. PEKERJAAN - Diubah ke Dropdown  
echo    └─ Pilihan: PNS, Swasta, Wiraswasta, dll
echo.
echo 3. ALAMAT DOMISILI - Diperbaiki
echo    ├─ Kab/Kota: Kota Pekalongan, Kab Pekalongan, 
echo    │            Kab Batang, Kab Pemalang
echo    ├─ Kecamatan: Otomatis sesuai Kab/Kota
echo    └─ Alamat Detail: Input manual lengkap
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 🚀 Memulai aplikasi...
echo.

cd frontend
start http://localhost:3002/form/survey
npm run dev
