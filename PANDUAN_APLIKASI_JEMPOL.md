# 📋 PANDUAN APLIKASI JEMPOL
## Jembatan Pembayaran Online - Sistem Manajemen Tiket dan Survei

### 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Atau klik file: `BUKA_APLIKASI_JEMPOL.bat`

2. **Akses Aplikasi**
   - Frontend: http://localhost:3003/
   - Backend API: http://localhost:3004/

### 🔐 Login Admin

- **Username**: `admin_jempol`
- **Email**: `admin@jempol.com`
- **Password**: `admin123`
- **Role**: `superadmin`

### 📱 Fitur Utama

#### 1. Dashboard
- Statistik real-time tiket dan survei
- Grafik performa dan analytics
- Filter dan pencarian advanced

#### 2. Manajemen Tiket
- **Tiket Internal**: Dibuat oleh admin/staff
- **Tiket Eksternal**: Dibuat melalui QR code
- **Tracking Tiket**: Pelacakan status real-time
- **Eskalasi Otomatis**: Berdasarkan SLA

#### 3. QR Code Management
- Generate QR untuk unit tertentu
- Tracking penggunaan QR
- Analytics QR code

#### 4. Survei Publik
- Survei tanpa login
- Survei terkait tiket
- Laporan survei

#### 5. Master Data
- **Units**: Unit/departemen
- **Service Categories**: Kategori layanan
- **Patient Types**: Jenis pasien
- **SLA Settings**: Pengaturan SLA
- **Roles & Permissions**: Manajemen akses

#### 6. Settings
- **App Settings**: Konfigurasi aplikasi
- **Response Templates**: Template respon
- **AI Trust Settings**: Pengaturan AI
- **Notification Settings**: Pengaturan notifikasi

### 🌐 URL Penting

- **Login**: http://localhost:3003/login
- **Dashboard**: http://localhost:3003/dashboard
- **Tiket**: http://localhost:3003/tickets
- **QR Management**: http://localhost:3003/tickets/qr-management
- **Survei Publik**: http://localhost:3003/survey/public
- **Settings**: http://localhost:3003/settings

### 🗄️ Database

- **Provider**: Supabase
- **URL**: https://jxxzbdivafzzwqhagwrf.supabase.co
- **Mode**: Production ready
- **Tables**: 30+ tabel terintegrasi

### 🔧 Troubleshooting

1. **Aplikasi tidak berjalan**
   - Jalankan: `npm install`
   - Cek port: `STATUS_APLIKASI_JEMPOL.bat`

2. **Login gagal**
   - Pastikan database terhubung
   - Cek kredensial admin di atas

3. **Error koneksi**
   - Periksa file `.env` di frontend dan backend
   - Pastikan Supabase URL dan keys benar

### 📞 Support

Untuk bantuan teknis, periksa file dokumentasi lengkap:
- `fix-aplikasi-komprehensif.md`
- `DOKUMENTASI_APLIKASI_LENGKAP.md`

---
**Aplikasi JEMPOL siap digunakan!** 🎉