# Cara Cek dan Set Environment Variables di Vercel

## Langkah 1: Buka Vercel Dashboard

1. Buka browser dan kunjungi: https://vercel.com/dashboard
2. Login dengan akun Anda
3. Pilih project aplikasi KISS

## Langkah 2: Buka Settings

1. Klik tab **"Settings"** di menu atas
2. Klik **"Environment Variables"** di sidebar kiri

## Langkah 3: Cek Environment Variables

Pastikan ada 4 environment variables berikut:

### 1. VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://xxxxxxxxxx.supabase.co
Environment: Production, Preview, Development (pilih semua)
```

### 2. VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (panjang)
Environment: Production, Preview, Development (pilih semua)
```

### 3. VITE_SUPABASE_SERVICE_ROLE_KEY
```
Name: VITE_SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (panjang, berbeda dari anon key)
Environment: Production, Preview, Development (pilih semua)
```

### 4. NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production (hanya production)
```

## Langkah 4: Cara Menambahkan Environment Variable

Jika ada yang belum ada:

1. Klik tombol **"Add New"**
2. Isi **Name** (contoh: VITE_SUPABASE_URL)
3. Isi **Value** (copy dari file `.env` lokal Anda)
4. Pilih **Environment**: 
   - Untuk Supabase vars: pilih **Production**, **Preview**, dan **Development**
   - Untuk NODE_ENV: pilih hanya **Production**
5. Klik **"Save"**

## Langkah 5: Cara Mendapatkan Value dari Local

Buka file `.env` atau `frontend/.env` di project lokal Anda:

```bash
# Contoh isi file .env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Copy value-nya dan paste ke Vercel.

## Langkah 6: Redeploy Setelah Menambahkan Env Vars

**PENTING:** Setelah menambahkan atau mengubah environment variables, Anda HARUS redeploy!

1. Klik tab **"Deployments"**
2. Klik titik tiga (...) di deployment terakhir
3. Klik **"Redeploy"**
4. Tunggu hingga selesai (2-5 menit)

## Langkah 7: Verifikasi

Setelah redeploy selesai:

1. Buka aplikasi di browser: https://your-app.vercel.app
2. Buka Developer Tools (F12)
3. Buka tab Console
4. Refresh halaman
5. Cek apakah masih ada error

## Troubleshooting

### Jika Masih Error "Missing Supabase credentials"

1. Pastikan nama environment variable **PERSIS** seperti di atas (case-sensitive)
2. Pastikan tidak ada spasi di awal/akhir value
3. Pastikan sudah pilih environment yang benar (Production)
4. Pastikan sudah redeploy setelah menambahkan

### Jika Tidak Tahu Service Role Key

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **"Settings"** → **"API"**
4. Scroll ke bawah ke bagian **"Project API keys"**
5. Copy **"service_role"** key (bukan anon key!)
6. **JANGAN SHARE** service role key ke publik!

### Jika Lupa Supabase URL

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **"Settings"** → **"API"**
4. Copy **"Project URL"** di bagian atas
5. Format: `https://xxxxxxxxxx.supabase.co`

## Catatan Keamanan

⚠️ **PENTING:**
- **Service Role Key** memiliki akses penuh ke database
- **JANGAN** commit ke Git
- **JANGAN** share ke orang lain
- Hanya set di Vercel Environment Variables
- Jika ter-leak, segera regenerate di Supabase Dashboard

## Checklist

- [ ] VITE_SUPABASE_URL sudah diset
- [ ] VITE_SUPABASE_ANON_KEY sudah diset
- [ ] VITE_SUPABASE_SERVICE_ROLE_KEY sudah diset
- [ ] NODE_ENV=production sudah diset
- [ ] Semua env vars dipilih untuk Production environment
- [ ] Sudah redeploy setelah menambahkan env vars
- [ ] Aplikasi sudah ditest dan tidak ada error
- [ ] Function logs tidak menunjukkan "Missing Supabase credentials"
