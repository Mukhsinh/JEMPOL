# 🔐 Cara Login Admin - JEMPOL

## Kredensial Login

```
Username: admin
Password: admin123
```

## 📱 Cara Login dari Browser

1. **Buka aplikasi** di browser:
   ```
   http://localhost:3001/login
   ```

2. **Masukkan kredensial**:
   - Username: `admin`
   - Password: `admin123`

3. **Klik tombol Login**

4. **Anda akan diarahkan** ke halaman Admin Dashboard

## 🧪 Test Login dari Command Line

Untuk test apakah backend berfungsi dengan baik:

```bash
node backend/test-admin-login.js
```

Script ini akan test:
- ✅ Login dengan kredensial benar
- ✅ Verify JWT token
- ✅ Reject password salah
- ✅ Reject username salah

## 🔧 Troubleshooting

### Backend tidak berjalan
Pastikan backend sudah running:
```bash
cd backend
npm run dev
```

### Frontend tidak berjalan
Pastikan frontend sudah running:
```bash
cd frontend
npm run dev
```

### Login gagal
1. Cek apakah backend sudah running di port 5000
2. Cek apakah DATABASE_MODE di `backend/.env` sudah diset ke `supabase`
3. Cek apakah tabel admins sudah ada di Supabase
4. Jalankan ulang setup admin:
   ```bash
   node backend/setup-admin-user.js
   ```

## 📊 Struktur Database

Tabel `admins` di Supabase:
- Username: admin
- Password: admin123 (di-hash dengan bcrypt)
- Role: superadmin
- Status: active

## 🔒 Security Features

- ✅ Password di-hash dengan bcrypt
- ✅ JWT token untuk authentication
- ✅ Token expires dalam 24 jam
- ✅ Last login tracking
- ✅ Row Level Security (RLS) enabled
- ✅ Hanya admin aktif yang bisa login

## 📝 Menambah Admin Baru

Edit file `backend/setup-admin-user.js` dan ubah:
```javascript
const password = 'admin123'; // Ganti dengan password baru
```

Lalu jalankan:
```bash
node backend/setup-admin-user.js
```

## 🎯 Next Steps

Setelah login berhasil, Anda bisa:
1. Upload konten PowerPoint/PDF/Video
2. Kelola data pengunjung
3. Lihat statistik game
4. Manage semua konten inovasi
