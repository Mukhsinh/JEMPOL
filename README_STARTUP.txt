================================================================================
                    JEMPOL PLATFORM - STARTUP INSTRUCTIONS
================================================================================

⚠️  ERROR "Network Error" atau "Connection Refused"? 
    Backend server belum berjalan! Ikuti langkah di bawah:

================================================================================
                              QUICK START
================================================================================

1. PASTIKAN MONGODB BERJALAN
   Windows: Buka Command Prompt, ketik: mongod
   Linux/Mac: sudo systemctl start mongod

2. START BACKEND (Terminal 1)
   Windows: Double-click START_BACKEND.bat
   Manual: cd backend && npm run dev
   
   ✅ Harus muncul: "Server running on port 5000"

3. START FRONTEND (Terminal 2 - BARU!)
   Windows: Double-click START_FRONTEND.bat
   Manual: cd frontend && npm run dev
   
   ✅ Harus muncul: "Local: http://localhost:3000/"

4. VERIFIKASI
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin

================================================================================
                           TROUBLESHOOTING
================================================================================

❌ "Network Error" saat upload?
   → Backend tidak berjalan. Jalankan START_BACKEND.bat

❌ "MongoDB connection failed"?
   → MongoDB tidak berjalan. Jalankan: mongod

❌ "Port 5000 already in use"?
   → Ada aplikasi lain di port 5000. Matikan atau ubah PORT di backend/.env

❌ Upload stuck di 0%?
   → Cek ukuran file (max 50MB) dan ekstensi (.ppt, .pptx, .mp4, .webm, .avi)

================================================================================
                         DOKUMENTASI LENGKAP
================================================================================

📄 STARTUP_GUIDE.md - Panduan startup lengkap
📄 UPLOAD_TROUBLESHOOTING.md - Troubleshooting upload
📄 QUICK_START.md - Quick start guide
📄 README.md - Dokumentasi lengkap aplikasi

================================================================================
                              KONTAK
================================================================================

RSUD Bendan Kota Pekalongan
Mukhsin Hadi: +62 857 2611 2001
Pekalongan, Indonesia

================================================================================
