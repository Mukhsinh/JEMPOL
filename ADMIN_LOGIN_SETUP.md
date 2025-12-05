# Setup Admin Login - Supabase

## ✅ Tabel Admin Berhasil Dibuat

Tabel `admins` telah dibuat di Supabase dengan struktur:

### Struktur Tabel
- `id` (UUID) - Primary key
- `username` (VARCHAR) - Username unik untuk login
- `password_hash` (TEXT) - Password yang di-hash dengan bcrypt
- `full_name` (VARCHAR) - Nama lengkap admin
- `email` (VARCHAR) - Email admin
- `role` (VARCHAR) - Role: 'admin' atau 'superadmin'
- `is_active` (BOOLEAN) - Status aktif admin
- `last_login` (TIMESTAMPTZ) - Waktu login terakhir
- `created_at` (TIMESTAMPTZ) - Waktu dibuat
- `updated_at` (TIMESTAMPTZ) - Waktu update terakhir

## 🔑 Kredensial Login Default

```
Username: admin
Password: admin123
```

## 📝 Cara Menggunakan

### 1. Login dari Frontend
Buka aplikasi dan login dengan kredensial di atas.

### 2. Update Password (Opsional)
Jalankan script untuk membuat admin baru atau update password:

```bash
node backend/setup-admin-user.js
```

### 3. Verifikasi Login
Backend akan:
- Verifikasi username dan password
- Update `last_login` setiap kali login berhasil
- Generate JWT token untuk authentication
- Return data admin (tanpa password)

## 🔧 Konfigurasi Backend

File yang sudah diupdate:
- `backend/src/models/Admin.ts` - Model admin dengan field lengkap
- `backend/src/controllers/authController.ts` - Controller untuk login/verify
- `backend/setup-admin-user.js` - Script untuk setup admin

## 🔒 Security

- Password di-hash dengan bcrypt (salt rounds: 10)
- JWT token untuk authentication
- RLS (Row Level Security) enabled
- Hanya admin aktif (`is_active = true`) yang bisa login
- Last login tracking untuk audit

## 📊 Database Mode

Pastikan di `backend/.env`:
```
DATABASE_MODE=supabase
```

Atau gunakan mode dual untuk support MongoDB dan Supabase:
```
DATABASE_MODE=dual
```
