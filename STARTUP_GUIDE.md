# 🚀 Panduan Startup JEMPOL Platform

## ⚠️ PENTING: Error "Network Error" atau "Connection Refused"

Error ini terjadi karena **backend server belum berjalan**. Ikuti langkah-langkah di bawah ini:

## 📋 Langkah-Langkah Startup

### 1. ✅ Pastikan MongoDB Berjalan

**Windows:**
```bash
# Buka Command Prompt atau PowerShell sebagai Administrator
mongod
```

**Atau jika sudah install sebagai service:**
```bash
net start MongoDB
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
# atau
sudo service mongod start
```

**Cek MongoDB berjalan:**
```bash
# Buka terminal baru
mongosh
# atau
mongo
```

### 2. 🔧 Setup Environment Variables (Sudah Dibuat)

File `backend/.env` sudah dibuat otomatis dengan konfigurasi:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/innovation-landing-page
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
MAX_FILE_SIZE_MB=50
```

### 3. 🚀 Start Backend Server

**Opsi A: Menggunakan Batch File (Recommended untuk Windows)**
```bash
# Double-click file ini atau jalankan di terminal:
START_BACKEND.bat
```

**Opsi B: Manual**
```bash
# Buka terminal baru
cd backend
npm run dev
```

**Output yang benar:**
```
Server running on port 5000
MongoDB connected successfully
```

### 4. 🎨 Start Frontend

**Opsi A: Menggunakan Batch File (Recommended untuk Windows)**
```bash
# Double-click file ini atau jalankan di terminal BARU:
START_FRONTEND.bat
```

**Opsi B: Manual**
```bash
# Buka terminal BARU (jangan tutup terminal backend!)
cd frontend
npm run dev
```

**Output yang benar:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:3000/
```

### 5. ✅ Verifikasi

1. **Cek Backend:**
   - Buka browser: http://localhost:5000/api/health
   - Harus muncul: `{"success":true,"message":"Server is running"}`

2. **Cek Frontend:**
   - Buka browser: http://localhost:3000
   - Homepage harus muncul dengan logo JEMPOL

3. **Test Upload:**
   - Buka: http://localhost:3000/admin
   - Coba upload file
   - Tidak boleh ada error "Network Error"

## 🔍 Troubleshooting

### Error: "MongoDB connection failed"
**Solusi:**
1. Pastikan MongoDB sudah terinstall
2. Jalankan `mongod` di terminal
3. Cek apakah port 27017 tidak digunakan aplikasi lain

### Error: "Port 5000 already in use"
**Solusi:**
1. Cari proses yang menggunakan port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID [PID_NUMBER] /F
   
   # Linux/Mac
   lsof -i :5000
   kill -9 [PID]
   ```
2. Atau ubah PORT di `backend/.env` menjadi 5001

### Error: "Network Error" saat upload
**Penyebab:** Backend tidak berjalan
**Solusi:**
1. Cek apakah backend masih running
2. Cek console backend untuk error
3. Restart backend jika perlu

### Upload stuck di 0%
**Solusi:**
1. Cek ukuran file (max 50MB)
2. Cek ekstensi file (.ppt, .pptx, .mp4, .webm, .avi)
3. Cek console browser (F12) untuk error detail
4. Restart backend dan frontend

## 📱 Development Workflow

### Setiap Kali Mulai Development:

1. **Terminal 1 - MongoDB:**
   ```bash
   mongod
   ```

2. **Terminal 2 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Terminal 3 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Atau Gunakan Batch Files:

1. Double-click `START_BACKEND.bat`
2. Double-click `START_FRONTEND.bat` (di terminal baru)

## 🎯 Quick Test Checklist

Setelah startup, test ini harus berhasil:

- [ ] http://localhost:5000/api/health menampilkan success
- [ ] http://localhost:3000 menampilkan homepage JEMPOL
- [ ] http://localhost:3000/admin bisa diakses
- [ ] Upload file PowerPoint berhasil
- [ ] Upload file Video berhasil
- [ ] File muncul di galeri
- [ ] Video bisa diputar
- [ ] PowerPoint bisa didownload

## 💡 Tips

1. **Jangan tutup terminal backend dan frontend** saat development
2. **Gunakan terminal terpisah** untuk backend dan frontend
3. **Cek console** (F12 di browser) jika ada error
4. **Restart backend** jika ada perubahan di backend code
5. **Frontend auto-reload** saat ada perubahan code

## 📞 Masih Ada Masalah?

1. Cek semua terminal untuk error messages
2. Pastikan MongoDB, Backend, dan Frontend semuanya running
3. Cek file `UPLOAD_TROUBLESHOOTING.md` untuk masalah upload
4. Restart semua services (MongoDB, Backend, Frontend)

---

**Selamat Development! 💻**

**Kontak:**
- RSUD Bendan Kota Pekalongan
- Mukhsin Hadi: +62 857 2611 2001
