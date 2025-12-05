# 🚀 Instruksi Cepat: Setup Admin Login

## Langkah 1: Buat Tabel di Supabase (5 menit)

1. Buka: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** (menu kiri)
4. Klik **New Query**
5. Copy paste SQL ini:

```sql
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true) WITH CHECK (true);

INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (username) DO NOTHING;
```

6. Klik **Run** (atau Ctrl+Enter)
7. Tunggu sampai muncul "Success"

## Langkah 2: Jalankan Aplikasi

```bash
npm run dev
```

## Langkah 3: Login

1. Buka browser: **http://localhost:3001/login**
2. Login:
   - Username: **admin**
   - Password: **admin123**
3. Klik **Login**

## Langkah 4: Upload PDF

1. Setelah login, Anda masuk ke **Admin Panel**
2. Tab **"Upload Konten"** sudah terbuka
3. Isi form:
   - **Judul**: Nama materi (contoh: "Panduan JEMPOL")
   - **Deskripsi**: Deskripsi materi
   - **File**: Pilih file PDF Anda
4. Klik **Upload**
5. Tunggu sampai selesai
6. PDF akan muncul di halaman "Daftar Tamu"

## ✅ Selesai!

Sekarang:
- ✅ Admin bisa login
- ✅ Admin bisa upload PDF
- ✅ PDF tampil langsung di browser
- ✅ PowerPoint sudah dihapus
- ✅ Pengunjung bisa lihat PDF tanpa download

## 🔐 Info Login

- **URL Login**: http://localhost:3001/login
- **Username**: admin
- **Password**: admin123
- **Token**: Expires dalam 24 jam

## 📱 Fitur Admin Panel

1. **Upload Konten** - Upload PDF, foto, video
2. **Upload Multiple Foto** - Upload banyak foto sekaligus
3. **Data Pengunjung** - Lihat dan export data
4. **Logout** - Tombol di kanan atas

## ❓ Masalah?

**Login gagal?**
→ Pastikan SQL sudah dijalankan di Supabase

**Upload gagal?**
→ Pastikan sudah login

**PDF tidak tampil?**
→ Gunakan Chrome/Firefox/Edge terbaru

---

**Dokumentasi lengkap**: Lihat `SETUP_ADMIN_LOGIN.md`
