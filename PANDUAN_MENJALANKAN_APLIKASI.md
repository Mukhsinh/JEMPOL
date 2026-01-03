# 🚀 Panduan Menjalankan Aplikasi Complaint System

## ✅ Status Saat Ini
- **Backend**: ✅ Berjalan di http://localhost:3003
- **Frontend**: ✅ Berjalan di http://localhost:3001
- **Database**: ✅ Supabase terhubung
- **API Endpoints**: ✅ Dapat diakses

## 🎯 Cara Menjalankan Aplikasi

### Opsi 1: Menggunakan Script Otomatis (Recommended)
```bash
# Mulai aplikasi lengkap
START_APPLICATION_COMPLETE.bat

# Cek status aplikasi
CHECK_APPLICATION_STATUS.bat

# Hentikan aplikasi
STOP_APPLICATION_COMPLETE.bat
```

### Opsi 2: Manual
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🔧 Troubleshooting

### Jika Muncul Error "ERR_CONNECTION_REFUSED"
1. Pastikan backend berjalan di port 3003:
   ```bash
   CHECK_APPLICATION_STATUS.bat
   ```

2. Jika backend tidak berjalan, mulai ulang:
   ```bash
   cd backend
   npm run dev
   ```

3. Jika frontend tidak berjalan, mulai ulang:
   ```bash
   cd frontend  
   npm run dev
   ```

### Jika Port Sudah Digunakan
```bash
# Hentikan semua proses
STOP_APPLICATION_COMPLETE.bat

# Mulai ulang
START_APPLICATION_COMPLETE.bat
```

## 📋 Konfigurasi Port
- **Backend**: Port 3003 (dapat diubah di `backend/.env`)
- **Frontend**: Port 3001 (dapat diubah di `frontend/vite.config.ts`)

## 🌐 URL Akses
- **Aplikasi Utama**: http://localhost:3001
- **API Backend**: http://localhost:3003/api
- **Health Check**: http://localhost:3003/api/health

## 🔍 Testing Koneksi
```bash
# Test koneksi cepat
node test-quick-connection.js

# Test semua endpoint API
node test-api-endpoints.js
```

## ⚠️ Catatan Penting
1. **Pastikan kedua server berjalan** sebelum mengakses aplikasi
2. **Backend harus dimulai terlebih dahulu** sebelum frontend
3. **Jangan tutup terminal** yang menjalankan server
4. **Gunakan Ctrl+C** untuk menghentikan server di terminal

## 🎉 Aplikasi Siap Digunakan!
Setelah kedua server berjalan, buka browser dan akses:
**http://localhost:3001**