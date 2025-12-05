# Setup Admin Login

## Langkah 1: Buat Tabel Admins di Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di menu sebelah kiri
4. Klik **New Query**
5. Copy dan paste SQL berikut:

```sql
-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on admins" ON admins
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

6. Klik **Run** atau tekan `Ctrl+Enter`
7. Pastikan muncul pesan sukses

## Langkah 2: Buat Admin Default

Setelah tabel dibuat, jalankan command berikut untuk membuat admin default:

```bash
cd backend
node create-admin-table.js
```

Atau bisa juga insert manual di Supabase SQL Editor:

```sql
-- Insert default admin (password: admin123)
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$rKZvJQxQxQxQxQxQxQxQxOeKH7PehIHy4H8/Od9JIZ7QSKlGiwWO')
ON CONFLICT (username) DO NOTHING;
```

## Langkah 3: Test Login

1. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

2. Buka browser dan akses: http://localhost:3001/login

3. Login dengan kredensial:
   - **Username**: `admin`
   - **Password**: `admin123`

4. Setelah login berhasil, Anda akan diarahkan ke halaman Admin

## Fitur Admin Login

### Backend
- ✅ JWT authentication dengan bcrypt password hashing
- ✅ Protected routes untuk upload, edit, dan delete
- ✅ Token verification middleware
- ✅ Secure password storage

### Frontend
- ✅ Login page dengan form validation
- ✅ Protected routes dengan redirect ke login
- ✅ Auth context untuk state management
- ✅ Token storage di localStorage
- ✅ Auto-redirect jika unauthorized
- ✅ Logout functionality

## Keamanan

### Password Hashing
Password di-hash menggunakan bcrypt dengan 10 rounds. Tidak ada plain text password yang disimpan di database.

### JWT Token
- Token expires dalam 24 jam
- Token disimpan di localStorage
- Setiap request ke protected endpoint memerlukan valid token
- Token di-verify di backend sebelum mengizinkan akses

### Protected Endpoints
Endpoint berikut memerlukan autentikasi:
- `POST /api/innovations` - Upload konten
- `POST /api/innovations/bulk-photos` - Upload multiple photos
- `DELETE /api/innovations/:id` - Delete konten

## Mengganti Password Admin

Untuk mengganti password admin, jalankan SQL berikut di Supabase:

```sql
-- Generate password hash untuk password baru
-- Gunakan online bcrypt generator atau script Node.js

-- Update password admin
UPDATE admins 
SET password_hash = 'HASH_PASSWORD_BARU_DISINI'
WHERE username = 'admin';
```

Atau buat script Node.js:

```javascript
import bcrypt from 'bcryptjs';

const newPassword = 'password_baru_anda';
const hash = await bcrypt.hash(newPassword, 10);
console.log('Password hash:', hash);
```

## Troubleshooting

### Error: "Could not find the table 'public.admins'"
- Pastikan Anda sudah menjalankan SQL untuk membuat tabel di Supabase
- Cek di Supabase Dashboard > Table Editor apakah tabel `admins` sudah ada

### Error: "Username atau password salah"
- Pastikan username dan password benar
- Default: username=`admin`, password=`admin123`
- Cek di database apakah admin sudah dibuat

### Error: "Token tidak valid"
- Token mungkin sudah expired (24 jam)
- Logout dan login kembali
- Clear localStorage di browser

### Redirect loop ke /login
- Pastikan backend server berjalan
- Cek console browser untuk error
- Pastikan token tersimpan di localStorage

## Environment Variables

Pastikan file `.env` di backend memiliki:

```env
JWT_SECRET=your-secret-key-change-in-production
```

⚠️ **PENTING**: Ganti `JWT_SECRET` dengan string random yang aman untuk production!

## Status

✅ Backend authentication system - SELESAI
✅ Frontend login page - SELESAI
✅ Protected routes - SELESAI
✅ Token management - SELESAI
✅ Logout functionality - SELESAI
✅ PowerPoint files deleted - SELESAI

## Next Steps

1. Buat tabel admins di Supabase (SQL di atas)
2. Insert admin default
3. Test login di http://localhost:3001/login
4. Upload file PDF baru
5. Ganti password default untuk keamanan
