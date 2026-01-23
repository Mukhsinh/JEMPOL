# Checklist Environment Variables Vercel

## 📋 Daftar Environment Variables yang Harus Di-Set

Buka **Vercel Dashboard** → **Project Settings** → **Environment Variables**

### 1. VITE_SUPABASE_URL
- **Value**: `https://your-project-id.supabase.co`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Cara mendapatkan**: 
  1. Buka Supabase Dashboard
  2. Project Settings → API
  3. Copy "Project URL"

### 2. VITE_SUPABASE_ANON_KEY
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (panjang ~300 karakter)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Cara mendapatkan**:
  1. Buka Supabase Dashboard
  2. Project Settings → API
  3. Copy "anon public" key

### 3. VITE_SUPABASE_SERVICE_ROLE_KEY
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (panjang ~300 karakter)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- **Cara mendapatkan**:
  1. Buka Supabase Dashboard
  2. Project Settings → API
  3. Copy "service_role" key
  4. **⚠️ PENTING**: Key ini rahasia, jangan share ke publik!

## 🔍 Cara Verifikasi Environment Variables

### Metode 1: Melalui Vercel Dashboard

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Settings → Environment Variables
4. Pastikan ketiga variables ada dan ter-set untuk semua environment

### Metode 2: Melalui Vercel CLI

```bash
vercel env ls
```

Output yang diharapkan:
```
Environment Variables
  VITE_SUPABASE_URL              Production, Preview, Development
  VITE_SUPABASE_ANON_KEY         Production, Preview, Development
  VITE_SUPABASE_SERVICE_ROLE_KEY Production, Preview, Development
```

### Metode 3: Test API Endpoint

Setelah deploy, buka:
```
https://your-app.vercel.app/api/public/units
```

**Jika env vars TIDAK di-set**, response:
```json
{
  "success": false,
  "error": "Konfigurasi Supabase tidak lengkap di Vercel...",
  "data": [],
  "debug": {
    "hasUrl": false,
    "hasKey": false
  }
}
```

**Jika env vars SUDAH di-set**, response:
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

## 🛠️ Cara Menambah Environment Variables

### Via Vercel Dashboard (Recommended)

1. Login ke [vercel.com](https://vercel.com)
2. Pilih project Anda
3. Klik **Settings** di menu atas
4. Klik **Environment Variables** di sidebar kiri
5. Klik **Add New**
6. Isi:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Environment**: Centang **Production**, **Preview**, **Development**
7. Klik **Save**
8. Ulangi untuk `VITE_SUPABASE_ANON_KEY` dan `VITE_SUPABASE_SERVICE_ROLE_KEY`

### Via Vercel CLI

```bash
# Set untuk Production
vercel env add VITE_SUPABASE_URL production
# Paste value, tekan Enter

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste value, tekan Enter

vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY production
# Paste value, tekan Enter

# Set untuk Preview
vercel env add VITE_SUPABASE_URL preview
# Paste value, tekan Enter

# ... ulangi untuk semua variables dan environments
```

## ⚠️ PENTING: Redeploy Setelah Menambah Env Vars

Setelah menambah atau mengubah environment variables, Anda **HARUS redeploy**:

```bash
vercel --prod --force
```

Atau via Vercel Dashboard:
1. Deployments → Latest Deployment
2. Klik **...** (three dots)
3. Klik **Redeploy**

## 🧪 Test Setelah Set Env Vars

1. **Buka file**: `test-vercel-api-endpoints.html`
2. **Isi Base URL**: `https://your-app.vercel.app`
3. **Klik**: "🚀 Test Semua Endpoints"
4. **Verifikasi**: Semua test harus success (hijau)

## 📊 Troubleshooting

### Error: "Konfigurasi Supabase tidak lengkap"

**Penyebab**: Environment variables belum di-set atau salah nama

**Solusi**:
1. Cek nama variable harus **PERSIS**: `VITE_SUPABASE_URL` (bukan `SUPABASE_URL`)
2. Pastikan di-set untuk **Production** environment
3. Redeploy setelah menambah env vars

### Error: "Invalid API key"

**Penyebab**: Value dari ANON_KEY atau SERVICE_ROLE_KEY salah

**Solusi**:
1. Copy ulang dari Supabase Dashboard
2. Pastikan tidak ada spasi di awal/akhir
3. Pastikan copy full key (biasanya ~300 karakter)

### Error: "Failed to connect to Supabase"

**Penyebab**: URL Supabase salah atau project tidak aktif

**Solusi**:
1. Verifikasi URL di Supabase Dashboard
2. Pastikan format: `https://xxxxx.supabase.co` (tanpa trailing slash)
3. Pastikan Supabase project masih aktif

## ✅ Checklist Final

Sebelum deploy production, pastikan:

- [ ] `VITE_SUPABASE_URL` sudah di-set untuk Production
- [ ] `VITE_SUPABASE_ANON_KEY` sudah di-set untuk Production
- [ ] `VITE_SUPABASE_SERVICE_ROLE_KEY` sudah di-set untuk Production
- [ ] Semua values sudah di-verify (tidak ada typo)
- [ ] Sudah redeploy setelah menambah env vars
- [ ] Test API endpoints berhasil (semua return JSON valid)
- [ ] Aplikasi bisa load units dan app settings
- [ ] Form submission berhasil

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah:
1. Screenshot Vercel Environment Variables page
2. Screenshot error dari browser console
3. Copy response dari test API endpoints
4. Cek Vercel deployment logs
