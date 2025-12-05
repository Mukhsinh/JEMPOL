# Solusi Lengkap: Materi Tidak Tampil & Login Error

## 🔍 Status Saat Ini

### ✅ Yang Sudah Berfungsi:
- Backend berjalan di port 5000
- API endpoint berfungsi (test dengan curl berhasil)
- Data ada di database (2 PDF, 1 video, 3 foto)
- Auth routes sudah terdaftar

### ❌ Yang Belum Berfungsi:
- Frontend tidak bisa mengambil data (Network Error)
- Login gagal karena tabel admins belum dibuat
- Browser menampilkan error 404 untuk auth endpoints

## 🎯 Solusi

### SOLUSI 1: Buat Tabel Admins (WAJIB!)

Tanpa tabel admins, sistem login tidak akan berfungsi.

**Langkah:**

1. Buka: https://supabase.com/dashboard
2. Login dan pilih project Anda
3. Klik **SQL Editor** → **New Query**
4. Copy paste SQL ini:

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

5. Klik **Run**
6. Tunggu "Success"

### SOLUSI 2: Restart Backend & Frontend

**Windows (Otomatis):**
```cmd
CLEAR_CACHE_AND_RESTART.bat
```

**Manual:**

1. **Stop semua process** (Ctrl+C di terminal)

2. **Clear cache frontend:**
   ```cmd
   cd frontend
   rmdir /s /q node_modules\.vite
   rmdir /s /q dist
   cd ..
   ```

3. **Start backend:**
   ```cmd
   cd backend
   npm run dev
   ```
   Tunggu: "Server running on port 5000"

4. **Start frontend** (terminal baru):
   ```cmd
   cd frontend
   npm run dev
   ```
   Tunggu: "Local: http://localhost:3001"

5. **Buka browser:**
   - URL: http://localhost:3001
   - **PENTING**: Tekan **Ctrl+F5** (hard refresh)

### SOLUSI 3: Clear Browser Cache

Jika masih error setelah restart:

1. Buka DevTools (F12)
2. Klik tab **Application**
3. Klik **Clear storage**
4. Klik **Clear site data**
5. Refresh halaman (Ctrl+F5)

Atau:

1. Tekan **Ctrl+Shift+Delete**
2. Pilih "Cached images and files"
3. Klik **Clear data**
4. Refresh halaman

## 🧪 Verifikasi

### Test 1: Backend Berfungsi

Buka: http://localhost:5000/api/health

Harus muncul:
```json
{"success":true,"message":"Server is running"}
```

### Test 2: Data Ada

Buka: http://localhost:5000/api/innovations

Harus muncul JSON dengan array data (6 items)

### Test 3: Auth Endpoint Ada

Buka: http://localhost:5000/api/auth/verify

Harus muncul:
```json
{"success":false,"error":"Token tidak ditemukan"}
```
(Error 401 itu normal, yang penting endpoint ada)

### Test 4: Frontend Connect

1. Buka: http://localhost:3001
2. Buka DevTools (F12) → Console
3. Tidak boleh ada error "ERR_CONNECTION_REFUSED"
4. Materi harus tampil

### Test 5: Login Berfungsi

1. Buka: http://localhost:3001/login
2. Username: `admin`
3. Password: `admin123`
4. Klik Login
5. Harus redirect ke Admin Panel

## 🐛 Troubleshooting

### Error: "Network Error" di Frontend

**Penyebab**: Frontend tidak bisa connect ke backend

**Solusi**:
1. Pastikan backend berjalan (cek terminal)
2. Test: http://localhost:5000/api/health
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)
5. Restart browser

### Error: "Login gagal" atau 404

**Penyebab**: Tabel admins belum dibuat

**Solusi**:
1. Buat tabel admins di Supabase (lihat SOLUSI 1)
2. Restart backend
3. Test login lagi

### Error: "Could not find the table 'public.admins'"

**Penyebab**: Tabel admins belum dibuat di Supabase

**Solusi**:
1. Buka Supabase Dashboard
2. Jalankan SQL untuk membuat tabel (lihat SOLUSI 1)
3. Restart backend

### Materi Masih Tidak Tampil

**Cek 1**: Backend berjalan?
```cmd
curl http://localhost:5000/api/health
```

**Cek 2**: Data ada?
```cmd
cd backend
node check-data.js
```

**Cek 3**: Frontend berjalan?
```cmd
netstat -ano | findstr :3001
```

**Cek 4**: Browser cache clear?
- Ctrl+Shift+Delete → Clear cache
- Ctrl+F5 → Hard refresh

**Cek 5**: Console error?
- F12 → Console
- Screenshot error dan kirim ke developer

### Port Sudah Digunakan

**Error**: "Port 5000 is already in use"

**Solusi**:
```cmd
npx kill-port 5000 3001
```

Atau ganti port di `.env`:
```
PORT=5001
```

## 📋 Checklist Sebelum Melaporkan Error

Pastikan sudah:
- [ ] Tabel admins dibuat di Supabase
- [ ] Backend berjalan (npm run dev)
- [ ] Frontend berjalan (npm run dev)
- [ ] Browser cache di-clear
- [ ] Hard refresh (Ctrl+F5) dilakukan
- [ ] Test http://localhost:5000/api/health berhasil
- [ ] Test http://localhost:5000/api/innovations return data
- [ ] Console browser tidak ada error "ERR_CONNECTION_REFUSED"

## 🎯 Quick Fix (Jika Semua Gagal)

```cmd
# 1. Kill semua node process
taskkill /F /IM node.exe

# 2. Clear cache
cd frontend
rmdir /s /q node_modules\.vite
rmdir /s /q dist
cd ..

# 3. Restart komputer (kadang perlu)

# 4. Start backend
cd backend
npm run dev

# 5. Start frontend (terminal baru)
cd frontend
npm run dev

# 6. Buka browser
# http://localhost:3001
# Ctrl+F5 (hard refresh)
```

## 📞 Bantuan

Jika masih error setelah semua langkah di atas, screenshot:

1. **Console browser** (F12 → Console)
2. **Terminal backend** (semua output)
3. **Terminal frontend** (semua output)
4. **Supabase Table Editor** (tabel admins)

Dan kirim ke developer dengan deskripsi:
- Langkah apa yang sudah dilakukan
- Error message yang muncul
- Kapan error terjadi

## 📝 File Bantuan

- `BUAT_TABEL_ADMIN.txt` - Cara buat tabel admins
- `FIX_MATERI_TIDAK_TAMPIL.txt` - Instruksi singkat
- `CLEAR_CACHE_AND_RESTART.bat` - Script otomatis restart
- `test-connection.html` - Test koneksi API
- `backend/check-data.js` - Cek data di database

## ✅ Kesimpulan

Masalah utama:
1. **Tabel admins belum dibuat** → Buat di Supabase
2. **Frontend cache lama** → Clear cache & hard refresh
3. **Backend belum siap saat frontend load** → Restart dengan urutan benar

Setelah mengikuti SOLUSI 1, 2, dan 3, aplikasi harus berfungsi normal.
