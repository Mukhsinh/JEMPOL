# Perbaikan Environment Variable di Vercel

## Masalah
- Error "Invalid API key" saat menambah user
- Error "Unauthorized: Token tidak ditemukan" saat menghapus user (sudah diperbaiki)

## Solusi

### 1. Cek Environment Variable di Vercel

Buka Vercel Dashboard:
1. Masuk ke project Anda di Vercel
2. Klik tab **Settings**
3. Klik **Environment Variables** di sidebar

### 2. Pastikan Variable Berikut Ada:

**WAJIB:**
- `SUPABASE_URL` = URL Supabase project Anda (contoh: https://xxxxx.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` = Service Role Key dari Supabase (BUKAN anon key!)

**Cara mendapatkan Service Role Key:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Settings** > **API**
4. Copy key dari bagian **service_role** (bukan anon/public key!)
5. Key ini biasanya dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Set Environment Variable di Vercel:

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [paste service role key dari Supabase]
Environment: Production, Preview, Development (pilih semua)
```

### 4. Redeploy

Setelah menambahkan environment variable:
1. Klik **Deployments** tab
2. Klik titik tiga (...) pada deployment terakhir
3. Klik **Redeploy**
4. Tunggu sampai deployment selesai

### 5. Test

Setelah redeploy selesai:
1. Coba tambah user baru
2. Coba hapus user (pastikan login sebagai superadmin)

## Catatan Penting

⚠️ **JANGAN gunakan ANON KEY untuk operasi admin!**
- Anon key hanya untuk operasi public/read-only
- Service Role Key diperlukan untuk bypass RLS dan operasi admin

⚠️ **Service Role Key adalah RAHASIA!**
- Jangan commit ke git
- Jangan share ke orang lain
- Hanya simpan di environment variable Vercel

## Troubleshooting

Jika masih error setelah set environment variable:
1. Pastikan key yang di-copy lengkap (tidak terpotong)
2. Pastikan tidak ada spasi di awal/akhir key
3. Coba hapus dan tambah ulang environment variable
4. Pastikan sudah redeploy setelah menambah variable
