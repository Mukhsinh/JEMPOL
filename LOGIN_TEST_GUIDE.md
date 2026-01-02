# Panduan Test Login SARAH

## Status Sistem Auth

✅ **Sistem auth telah diubah dari JWT ke Supabase Auth**

### Perubahan yang Dilakukan:

1. **Backend Auth Controller** - Menggunakan Supabase Auth
2. **Frontend Auth Service** - Menggunakan Supabase Auth
3. **Auth Context** - Updated untuk email login
4. **Login Page** - Menggunakan email instead of username
5. **Middleware** - Menggunakan Supabase token verification

### User Auth yang Tersedia:

| Email | Password | Role |
|-------|----------|------|
| admin@jempol.com | admin123 | superadmin |
| mukhsin9@gmail.com | admin123 | superadmin |

## Cara Test Login:

### 1. Akses Aplikasi
- Frontend: http://localhost:3002
- Backend: http://localhost:5000

### 2. Test Login
1. Buka http://localhost:3002
2. Masukkan email: `admin@jempol.com`
3. Masukkan password: `admin123`
4. Klik "Masuk Sistem"

### 3. Test API Langsung
Buka file `test-login.html` di browser untuk test API langsung.

## Troubleshooting:

### Jika Login Gagal:
1. Pastikan backend running di port 5000
2. Pastikan frontend running di port 3002
3. Check console browser untuk error
4. Pastikan Supabase config benar

### Jika Error "User not found":
- User auth sudah dibuat di Supabase
- Pastikan email sesuai dengan yang ada di tabel admins

### Jika Error "Token invalid":
- Logout dan login ulang
- Clear localStorage browser
- Restart aplikasi

## Keamanan:

⚠️ **PENTING**: Ganti password default `admin123` setelah login pertama!

## Next Steps:

1. Test login dengan kedua user
2. Test logout functionality  
3. Test protected routes
4. Implement password change feature
5. Add email verification (optional)

## Sistem Auth Baru:

- ✅ Menggunakan Supabase Auth (lebih aman)
- ✅ Login dengan email (bukan username)
- ✅ Session management otomatis
- ✅ Token refresh otomatis
- ✅ Logout yang proper
- ✅ Role-based access control

Login sekarang lebih sederhana dan aman dengan Supabase Auth!