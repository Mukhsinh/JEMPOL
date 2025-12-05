# 🚀 Quick Start Guide - JEMPOL Platform

## Instalasi Cepat

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/innovation-landing-page
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE_MB=50
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### 4. Run Development Servers

**⚠️ PENTING: Jalankan di terminal TERPISAH!**

**Windows - Cara Mudah:**
```bash
# Double-click file ini:
START_BACKEND.bat

# Kemudian di terminal baru, double-click:
START_FRONTEND.bat
```

**Manual (Semua OS):**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (BUKA TERMINAL BARU!)
cd frontend
npm run dev
```

**✅ Verifikasi Backend Running:**
- Buka: http://localhost:5000/api/health
- Harus muncul: `{"success":true,"message":"Server is running"}`

### 5. Akses Aplikasi
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

## 📋 Fitur Utama

### 1. Daftar Pengunjung
- Buka homepage
- Scroll ke section "Daftar Pengunjung"
- Isi form: Nama, Instansi, Jabatan, No HP
- Klik "Daftar Sekarang"

### 2. Upload Konten (Admin)
- Buka http://localhost:3000/admin
- Isi form upload:
  - **Judul**: Nama konten
  - **Deskripsi**: Penjelasan singkat
  - **File**: Pilih PowerPoint (.ppt, .pptx) atau Video (.mp4, .webm, .avi)
- Klik "Upload Konten"
- Tunggu progress bar selesai
- File akan muncul di galeri

### 3. Lihat Galeri Inovasi
- Buka homepage
- Scroll ke "Galeri Inovasi JEMPOL"
- Filter berdasarkan tipe (PowerPoint/Video)
- Klik card untuk melihat detail
- **PowerPoint**: Download untuk dibaca
- **Video**: Putar langsung di browser

### 4. Main Game
- Klik menu "Game" atau tombol di homepage
- Pilih mode: Single Player atau Multiplayer
- Gerakkan basket dengan mouse/touch
- Tangkap item hijau (+10) dan emas (+50)
- Hindari item merah (-5 poin, -1 nyawa)
- Raih skor tertinggi!

### 5. Lihat Leaderboard
- Klik menu "Leaderboard"
- Lihat top players
- Tantang diri untuk masuk top 10!

## 🔧 Troubleshooting Cepat

### Upload Tidak Berhasil?
1. Cek console browser (F12)
2. Pastikan file < 50MB
3. Pastikan ekstensi file benar
4. Restart backend jika perlu

### Game Tidak Jalan?
1. Refresh halaman
2. Cek console untuk error
3. Pastikan browser support HTML5 Canvas

### Data Tidak Muncul?
1. Pastikan MongoDB running
2. Cek backend console untuk error
3. Refresh halaman

## 📱 Test di Mobile

1. Cari IP address komputer:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

2. Update frontend/.env:
```env
VITE_API_URL=http://YOUR_IP:5000/api
```

3. Akses dari mobile:
```
http://YOUR_IP:3000
```

## 🎯 Testing Checklist

- [ ] Daftar pengunjung berhasil
- [ ] Upload PowerPoint berhasil
- [ ] Upload Video berhasil
- [ ] Video bisa diputar
- [ ] PowerPoint bisa didownload
- [ ] Game berjalan lancar
- [ ] Leaderboard menampilkan data
- [ ] Responsive di mobile
- [ ] Admin panel berfungsi

## 📞 Kontak

**RSUD Bendan Kota Pekalongan**
- Kontak Person: Mukhsin Hadi
- WhatsApp: +62 857 2611 2001
- Lokasi: Pekalongan, Indonesia

## 📚 Dokumentasi Lengkap

- `README.md` - Dokumentasi lengkap
- `CHANGELOG.md` - Daftar perubahan
- `UPLOAD_TROUBLESHOOTING.md` - Panduan troubleshooting upload
- `QUICK_START.md` - Panduan cepat (file ini)

---

**Selamat menggunakan JEMPOL Platform! 💳**
