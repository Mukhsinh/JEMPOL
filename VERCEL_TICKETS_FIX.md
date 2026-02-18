# Perbaikan Error 404 pada Endpoint Tickets di Vercel

## Masalah
Error 404 saat mengakses `/api/public/tickets`:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
✅ Tickets fetched from backend: 0 tickets
```

## Penyebab
Environment variables untuk Supabase belum terset di Vercel untuk serverless functions.

## Solusi

### 1. Tambahkan Environment Variables di Vercel

Buka Vercel Dashboard:
1. Masuk ke project Anda di https://vercel.com
2. Pilih project **jempol-frontend**
3. Klik tab **Settings**
4. Klik **Environment Variables** di sidebar kiri

### 2. Tambahkan Variable Berikut:

**Variable 1: SUPABASE_URL**
```
Name: SUPABASE_URL
Value: https://jxxzbdivafzzwqhagwrf.supabase.co
Environment: Production, Preview, Development (centang semua)
```

**Variable 2: SUPABASE_ANON_KEY**
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
Environment: Production, Preview, Development (centang semua)
```

**Variable 3: SUPABASE_SERVICE_ROLE_KEY** (untuk operasi admin)
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Ambil dari Supabase Dashboard > Settings > API > service_role key]
Environment: Production, Preview, Development (centang semua)
```

### 3. Cara Mendapatkan Service Role Key:
1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Settings** (ikon gear di sidebar)
4. Klik **API**
5. Scroll ke bawah ke bagian **Project API keys**
6. Copy key dari **service_role** (BUKAN anon key!)

### 4. Redeploy Project

Setelah menambahkan semua environment variables:
1. Kembali ke tab **Deployments**
2. Klik titik tiga (...) pada deployment terakhir
3. Klik **Redeploy**
4. Tunggu sampai deployment selesai (biasanya 2-3 menit)

### 5. Verifikasi

Setelah deployment selesai:
1. Buka aplikasi di browser
2. Buka halaman **Daftar Tiket**
3. Buka Developer Console (F12)
4. Periksa apakah masih ada error 404
5. Seharusnya tickets sudah muncul

## Catatan Penting

⚠️ **Perbedaan VITE_ prefix:**
- `VITE_*` variables hanya tersedia saat **build time** (untuk frontend)
- Serverless functions butuh variables **tanpa prefix VITE_** untuk **runtime**
- Jadi kita perlu set KEDUA versi:
  - `VITE_SUPABASE_URL` untuk frontend
  - `SUPABASE_URL` untuk backend functions

⚠️ **Service Role Key adalah RAHASIA:**
- Jangan commit ke git
- Jangan share ke orang lain
- Hanya simpan di environment variable Vercel

## Troubleshooting

### Jika masih error 404:
1. Pastikan semua 3 environment variables sudah ditambahkan
2. Pastikan sudah **redeploy** setelah menambah variables
3. Clear browser cache (Ctrl+Shift+Delete)
4. Coba akses dalam mode incognito

### Jika tickets masih 0:
1. Periksa apakah ada data tickets di Supabase
2. Buka Supabase Dashboard > Table Editor > tickets
3. Pastikan ada data di tabel tickets

### Jika error "Invalid API key":
1. Pastikan SUPABASE_ANON_KEY sudah benar
2. Pastikan tidak ada spasi di awal/akhir key
3. Coba copy ulang dari Supabase Dashboard

## Verifikasi Environment Variables

Untuk memastikan environment variables sudah terset dengan benar:
1. Buka https://[your-app].vercel.app/api/public/tickets
2. Jika berhasil, akan muncul JSON response dengan data tickets
3. Jika gagal, akan muncul error message yang lebih spesifik
