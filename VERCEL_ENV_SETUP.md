# 🔐 Setup Environment Variables di Vercel

## Langkah-langkah Setup

### 1. Buka Vercel Dashboard

1. Login ke [vercel.com](https://vercel.com)
2. Pilih project Anda
3. Klik tab **Settings**
4. Klik **Environment Variables** di sidebar

### 2. Tambahkan Variables Berikut

Copy-paste variabel di bawah ini satu per satu:

#### Frontend Variables (dengan prefix VITE_)

```
Key: VITE_SUPABASE_URL
Value: https://jxxzbdivafzzwqhagwrf.supabase.co
Environment: Production, Preview, Development
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTkwNTEsImV4cCI6MjA1MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
Environment: Production, Preview, Development
```

```
Key: VITE_API_URL
Value: /api
Environment: Production, Preview, Development
```

#### Backend Variables (TANPA prefix VITE_)

```
Key: SUPABASE_URL
Value: https://jxxzbdivafzzwqhagwrf.supabase.co
Environment: Production, Preview, Development
```

```
Key: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTkwNTEsImV4cCI6MjA1MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
Environment: Production, Preview, Development
```

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [GANTI DENGAN SERVICE ROLE KEY DARI SUPABASE DASHBOARD]
Environment: Production, Preview, Development
```

⚠️ **PENTING**: Ganti `SUPABASE_SERVICE_ROLE_KEY` dengan key yang sebenarnya dari:
- Buka [Supabase Dashboard](https://supabase.com/dashboard)
- Pilih project Anda
- Settings → API
- Copy **service_role** key (bukan anon key!)

```
Key: NODE_ENV
Value: production
Environment: Production
```

### 3. Cara Menambahkan di Vercel Dashboard

Untuk setiap variabel:

1. Klik tombol **Add New**
2. Masukkan **Key** (nama variabel)
3. Masukkan **Value** (nilai variabel)
4. Pilih **Environment**:
   - ✅ Production (untuk production deployment)
   - ✅ Preview (untuk preview deployment dari PR)
   - ✅ Development (untuk development dengan `vercel dev`)
5. Klik **Save**

### 4. Redeploy Setelah Menambah Variables

⚠️ **PENTING**: Perubahan environment variables tidak otomatis apply!

Cara redeploy:
1. Pergi ke tab **Deployments**
2. Klik titik tiga (⋮) di deployment terakhir
3. Pilih **Redeploy**
4. Tunggu hingga deployment selesai

## 🔍 Verifikasi Setup

Setelah redeploy, test dengan:

```bash
# Test API endpoint
curl https://your-app.vercel.app/api/public/health

# Harusnya return:
# {"status":"ok","message":"API is running"}
```

Buka browser dan cek Console (F12):
- ❌ Tidak boleh ada error "undefined"
- ❌ Tidak boleh ada error CORS
- ✅ API calls harus berhasil

## 📊 Checklist

Sebelum deploy, pastikan:

- [ ] Semua 7 variabel sudah ditambahkan
- [ ] SUPABASE_SERVICE_ROLE_KEY sudah diganti dengan key yang benar
- [ ] Semua variabel dipilih untuk Production, Preview, dan Development
- [ ] Sudah klik Save untuk setiap variabel
- [ ] Sudah Redeploy setelah menambah variabel

## 🐛 Troubleshooting

### Error: "Supabase URL is undefined"

**Penyebab**: Environment variables belum ditambahkan atau belum redeploy

**Solusi**:
1. Cek apakah semua variabel sudah ditambahkan di Vercel Dashboard
2. Pastikan sudah Redeploy
3. Clear cache browser dan refresh

### Error: "Invalid API key"

**Penyebab**: SUPABASE_SERVICE_ROLE_KEY salah atau tidak diset

**Solusi**:
1. Buka Supabase Dashboard → Settings → API
2. Copy service_role key (bukan anon key!)
3. Update di Vercel Dashboard
4. Redeploy

### API calls return 404

**Penyebab**: Routing tidak benar atau API functions tidak ter-deploy

**Solusi**:
1. Cek vercel.json sudah benar
2. Cek folder api/ ada di repository
3. Redeploy

### Frontend tidak bisa connect ke Supabase

**Penyebab**: VITE_ prefix tidak ada atau salah

**Solusi**:
1. Pastikan variabel frontend menggunakan prefix VITE_
2. Contoh: VITE_SUPABASE_URL (bukan SUPABASE_URL)
3. Redeploy

## 📝 Catatan Keamanan

✅ **AMAN untuk di-expose**:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_API_URL

❌ **JANGAN di-expose ke frontend**:
- SUPABASE_SERVICE_ROLE_KEY (hanya untuk backend!)

⚠️ **JANGAN commit ke Git**:
- File .env
- File .env.local
- File .env.production

✅ **Boleh commit ke Git**:
- File .env.example
- File .env.production.example

---

**Terakhir diupdate**: 2025-02-15
