# 🔧 Solusi Login Error 400: Invalid Session

## 📋 Analisis Masalah

### Error yang Terjadi:
```
Failed to load resource: the server responded with a status of 400 ()
400 error detected, clearing invalid session...
supabaseClient.ts:229
```

### Penyebab:
1. **Session Corrupt** - Ada session Supabase yang invalid/corrupt tersimpan di localStorage browser
2. **Token Expired** - Refresh token yang sudah tidak valid masih tersimpan
3. **Multiple Sessions** - Beberapa session key yang saling konflik
4. **Cache Issue** - Browser cache yang menyimpan state lama

### Dampak:
- Login gagal dengan error 400
- Halaman loading terus menerus
- Tidak bisa akses dashboard
- Session tidak bisa di-refresh

---

## ✅ Solusi Lengkap

### Metode 1: Menggunakan Tool Otomatis (RECOMMENDED)

#### Langkah 1: Jalankan BAT File
```batch
BUKA_PERBAIKAN_SESSION.bat
```

Atau buka file HTML langsung:
```
clear-session-400-error.html
```

#### Langkah 2: Klik Tombol "Bersihkan Session & Cache"
Tool akan otomatis:
- ✅ Membersihkan localStorage
- ✅ Membersihkan sessionStorage  
- ✅ Membersihkan cookies
- ✅ Membersihkan cache

#### Langkah 3: Klik "Buka Halaman Login"
Setelah selesai, klik tombol untuk langsung ke halaman login.

#### Langkah 4: Login
```
Email: admin@jempol.com
Password: admin123
```

---

### Metode 2: Manual via Browser DevTools

#### Langkah 1: Buka DevTools
- Tekan `F12` atau `Ctrl+Shift+I`
- Atau klik kanan → Inspect

#### Langkah 2: Buka Tab Application/Storage
- Klik tab "Application" (Chrome) atau "Storage" (Firefox)

#### Langkah 3: Clear Local Storage
1. Di sidebar kiri, expand "Local Storage"
2. Klik "http://localhost:3002"
3. Hapus SEMUA item yang dimulai dengan:
   - `sb-`
   - `supabase`
   - `auth`
   - `token`

#### Langkah 4: Clear Session Storage
1. Di sidebar kiri, klik "Session Storage"
2. Klik "http://localhost:3002"
3. Klik kanan → Clear

#### Langkah 5: Clear Cookies
1. Di sidebar kiri, expand "Cookies"
2. Klik "http://localhost:3002"
3. Hapus semua cookies

#### Langkah 6: Clear Cache
- Tekan `Ctrl+Shift+Delete`
- Pilih:
  - ✅ Cached images and files
  - ✅ Cookies and other site data
- Klik "Clear data"

#### Langkah 7: Restart Browser
- Tutup browser sepenuhnya
- Buka kembali browser
- Buka http://localhost:3002/login

---

### Metode 3: Reset Password via Script

Jika masih gagal, reset password admin:

```batch
PERBAIKI_LOGIN_SESSION_400.bat
```

Script akan:
1. Test koneksi Supabase
2. Cek admin yang ada
3. Reset password untuk admin@jempol.com
4. Memberikan instruksi lengkap

---

## 🔍 Verifikasi Perbaikan

### Cek 1: Console Browser
Setelah clear session, buka console (F12) dan cek:
- ❌ Tidak ada error 400
- ❌ Tidak ada "invalid session"
- ✅ Request berhasil dengan status 200

### Cek 2: Network Tab
Di DevTools → Network:
- ✅ Request ke `/auth/v1/token` berhasil (200)
- ✅ Request ke `/rest/v1/admins` berhasil (200)
- ❌ Tidak ada request yang gagal dengan 400

### Cek 3: Application Tab
Di DevTools → Application → Local Storage:
- ✅ Tidak ada key yang dimulai dengan `sb-jxxzbdivafzzwqhagwrf-auth-token` yang lama
- ✅ Setelah login, ada key baru dengan token yang valid

---

## 🛡️ Pencegahan

### 1. Auto-Clear Invalid Session
Frontend sudah dilengkapi dengan auto-clear:
```typescript
// Di supabaseClient.ts
window.addEventListener('load', async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error && (error.message.includes('400') || error.message.includes('invalid'))) {
    await clearInvalidSession();
  }
});
```

### 2. Handle 400 Errors Globally
```typescript
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  if (response.status === 400 && args[0].toString().includes('supabase.co')) {
    await clearInvalidSession();
  }
  
  return response;
};
```

### 3. Token Refresh Handler
```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
  }
});
```

---

## 📊 Troubleshooting

### Masalah: Masih error 400 setelah clear session

**Solusi:**
1. Pastikan browser benar-benar ditutup (cek Task Manager)
2. Coba browser lain (Chrome/Edge/Firefox)
3. Coba mode Incognito/Private
4. Jalankan script reset password

### Masalah: Login berhasil tapi langsung logout

**Solusi:**
1. Cek backend sedang running: `http://localhost:3004/api/health`
2. Cek .env file frontend dan backend konsisten
3. Restart backend dan frontend

### Masalah: Error "Failed to fetch"

**Solusi:**
1. Cek koneksi internet
2. Cek Supabase URL benar
3. Cek firewall tidak memblokir Supabase

---

## 🎯 Kesimpulan

Error 400 "Invalid Session" disebabkan oleh:
- ❌ Session corrupt di localStorage
- ❌ Token expired yang tidak di-clear
- ❌ Cache browser yang menyimpan state lama

Solusi:
- ✅ Clear localStorage, sessionStorage, cookies, dan cache
- ✅ Reset password jika perlu
- ✅ Login dengan kredensial yang benar

**Kredensial Login:**
```
Email: admin@jempol.com
Password: admin123
```

---

## 📞 Bantuan Lebih Lanjut

Jika masih mengalami masalah:
1. Cek console browser untuk error detail
2. Cek Network tab untuk request yang gagal
3. Jalankan script diagnosis: `diagnose-loading-issue.js`
4. Hubungi tim support dengan screenshot error

---

**Dibuat:** 21 Januari 2026
**Status:** ✅ Tested & Working
