# Cara Membuka Aplikasi JEMPOL

## ✅ Status Saat Ini
- ✅ Backend: BERJALAN di http://localhost:5000
- ✅ Frontend: BERJALAN di http://localhost:3001
- ✅ Semua komponen: TIDAK ADA ERROR

## 🚀 Cara Membuka Aplikasi

### Opsi 1: Aplikasi Sudah Berjalan (SEKARANG)
Aplikasi sudah berjalan! Buka browser dan akses:
- **Homepage**: http://localhost:3001
- **Admin Panel**: http://localhost:3001/admin
- **Game**: http://localhost:3001/game

**Jika halaman masih error:**
1. Tekan `Ctrl + Shift + R` di browser untuk hard refresh
2. Atau buka browser dalam mode incognito/private
3. Atau clear cache browser

### Opsi 2: Jika Aplikasi Belum Berjalan
Jalankan salah satu file berikut:

**Recommended:**
```
START_CLEAN.bat
```

**Atau:**
```
START_ALL.bat
```

## 🔧 Troubleshooting

### Masalah: Halaman Blank/Kosong
**Solusi:**
1. Tekan `F12` untuk buka Developer Tools
2. Lihat tab Console untuk error
3. Tekan `Ctrl + Shift + R` untuk hard refresh
4. Jika masih error, jalankan `START_CLEAN.bat`

### Masalah: Port Already in Use
**Solusi:**
```
taskkill /F /IM node.exe
```
Lalu jalankan `START_ALL.bat`

### Masalah: Backend Tidak Terhubung
**Solusi:**
1. Pastikan backend berjalan (cek terminal "JEMPOL Backend")
2. Test backend: buka http://localhost:5000/api/health
3. Harus muncul: `{"success":true,"message":"Server is running"}`

### Masalah: Data Tidak Muncul
**Solusi:**
1. Pastikan Supabase terhubung (cek terminal backend)
2. Harus ada pesan: "Supabase connected successfully"
3. Cek file `backend/.env` sudah benar

## 📝 Catatan Penting

1. **Port yang Digunakan:**
   - Backend: 5000
   - Frontend: 3001

2. **Browser yang Disarankan:**
   - Google Chrome
   - Microsoft Edge
   - Firefox

3. **Jika Masih Error:**
   - Tutup semua terminal
   - Jalankan `START_CLEAN.bat`
   - Tunggu 10 detik
   - Buka http://localhost:3001
   - Tekan `Ctrl + Shift + R`

## ✨ Fitur yang Tersedia

1. **Homepage** (/)
   - Hero Section
   - Form Registrasi Pengunjung
   - Galeri Materi PowerPoint
   - Galeri Video
   - Galeri Foto
   - Leaderboard Game

2. **Admin Panel** (/admin)
   - Upload Materi (PowerPoint, Video, Foto)
   - Manajemen Pengunjung
   - Statistik

3. **Game** (/game)
   - Innovation Catcher Game
   - Mode Easy, Medium, Hard
   - Leaderboard

## 🎯 Langkah Cepat

```bash
# 1. Hentikan proses lama
taskkill /F /IM node.exe

# 2. Start aplikasi
START_CLEAN.bat

# 3. Tunggu 10 detik

# 4. Buka browser
http://localhost:3001

# 5. Hard refresh
Ctrl + Shift + R
```

---

**Aplikasi sudah siap digunakan!** 🎉
