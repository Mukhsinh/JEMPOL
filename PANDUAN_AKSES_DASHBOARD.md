# 🎯 Panduan Akses Dashboard SARAH

## ✅ Status Sistem
- ✅ Frontend: Berjalan di http://localhost:3001
- ✅ Backend: Berjalan di http://localhost:5001  
- ✅ Database: Terhubung ke Supabase
- ✅ Autentikasi: Berfungsi normal
- ✅ Dashboard API: Berfungsi normal

## 🚀 Cara Mengakses Dashboard

### 1. Pastikan Server Berjalan
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend  
cd backend
npm run dev
```

### 2. Buka Browser
Akses: **http://localhost:3001**

### 3. Login dengan Kredensial Admin
- **Email**: `admin@jempol.com`
- **Password**: `admin123`

### 4. Dashboard Akan Muncul
Setelah login berhasil, Anda akan diarahkan ke dashboard dengan:
- KPI Cards (Total Tickets, Open Tickets, In Progress, Resolved)
- Status Chart (Grafik distribusi tiket)
- Ticket Table (Daftar tiket terbaru)
- Filter dan kontrol dashboard

## 🔧 Troubleshooting

### Jika Dashboard Tidak Muncul:

#### 1. Periksa Console Browser
- Buka Developer Tools (F12)
- Lihat tab Console untuk error JavaScript
- Lihat tab Network untuk error API

#### 2. Periksa Server Status
```bash
# Test frontend
curl http://localhost:3001

# Test backend
curl http://localhost:5001/api/health
```

#### 3. Clear Cache Browser
- Tekan Ctrl+Shift+R (hard refresh)
- Atau clear browser cache

#### 4. Periksa File .env
File `frontend/.env` harus berisi:
```
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Jika Login Gagal:

#### 1. Periksa Kredensial
- Email: `admin@jempol.com`
- Password: `admin123`

#### 2. Periksa Database Supabase
- Pastikan tabel `admins` memiliki user dengan email tersebut
- Pastikan field `is_active` = true

#### 3. Periksa Koneksi Supabase
- Pastikan VITE_SUPABASE_URL benar
- Pastikan VITE_SUPABASE_ANON_KEY benar

## 🧪 Test Otomatis

### Jalankan Test Script
```bash
node test-dashboard-login.js
```

### Buka Test HTML
Buka file `test-dashboard-access.html` di browser untuk test manual.

## 📱 Fitur Dashboard

### 1. KPI Cards
- **Total Tickets**: Jumlah semua tiket
- **Open Tickets**: Tiket yang belum ditangani
- **In Progress**: Tiket yang sedang diproses
- **Resolved**: Tiket yang sudah diselesaikan

### 2. Status Chart
- Grafik distribusi tiket berdasarkan unit/kategori
- Menampilkan volume tiket per departemen

### 3. Ticket Table
- Daftar tiket terbaru
- Filter dan pencarian
- Akses detail tiket

### 4. Kontrol Dashboard
- Refresh data
- Export laporan CSV
- Filter berdasarkan tanggal, unit, status

## 🔗 URL Penting

- **Dashboard**: http://localhost:3001/
- **Login**: http://localhost:3001/login
- **Ticket List**: http://localhost:3001/tickets
- **Settings**: http://localhost:3001/settings
- **API Health**: http://localhost:5001/api/health

## 📞 Bantuan

Jika masih mengalami masalah:
1. Periksa log server di terminal
2. Jalankan test script untuk diagnosis
3. Periksa file konfigurasi .env
4. Restart kedua server (frontend & backend)

---
**Status Terakhir**: Dashboard berhasil diakses dan berfungsi normal ✅