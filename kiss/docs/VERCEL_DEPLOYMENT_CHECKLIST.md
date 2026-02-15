# ✅ Checklist Deployment ke Vercel

## 📋 Persiapan Sebelum Deploy

### 1. Environment Variables di Vercel Dashboard

Buka **Vercel Dashboard** → Pilih Project → **Settings** → **Environment Variables**

Tambahkan variabel berikut (untuk **Production**, **Preview**, dan **Development**):

#### Frontend Variables (dengan prefix VITE_)
```
VITE_SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTkwNTEsImV4cCI6MjA1MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
VITE_API_URL=/api
```

#### Backend Variables (TANPA prefix VITE_)
```
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTkwNTEsImV4cCI6MjA1MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDkxOTA1MSwiZXhwIjoyMDUwNDk1MDUxfQ.Ql_Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8Ql8
NODE_ENV=production
```

⚠️ **PENTING**: 
- Ganti `SUPABASE_SERVICE_ROLE_KEY` dengan key yang sebenarnya dari Supabase Dashboard
- Key di atas hanya contoh placeholder

### 2. Verifikasi File Konfigurasi

#### ✅ Cek `.gitignore`
Pastikan file berikut TIDAK ter-commit:
```
.env
.env.local
.env.production
kiss/.env.local
kiss/.env.production
```

#### ✅ Cek `vercel.json`
File sudah benar dengan konfigurasi:
- Build command: `npm install --legacy-peer-deps --workspaces && npm run vercel-build`
- Output directory: `dist`
- Rewrites untuk SPA routing
- API functions configuration

#### ✅ Cek `package.json`
Build script sudah benar:
```json
"vercel-build": "npm run vercel-build --workspace=kiss"
```

### 3. Test Build Lokal

Sebelum deploy, test build di lokal:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build untuk production
npm run vercel-build

# Verifikasi output di folder dist/
ls dist/
```

Pastikan folder `dist/` berisi:
- `index.html`
- `assets/` (JS dan CSS files)

## 🚀 Langkah Deployment

### Opsi 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy ke production
vercel --prod
```

### Opsi 2: Deploy via Git Push

1. Push code ke GitHub/GitLab/Bitbucket
2. Vercel akan otomatis detect dan deploy
3. Tunggu build selesai

### Opsi 3: Deploy via Vercel Dashboard

1. Buka Vercel Dashboard
2. Klik "Add New Project"
3. Import repository
4. Vercel akan auto-detect settings
5. Klik "Deploy"

## 🔍 Verifikasi Setelah Deploy

### 1. Test API Endpoints

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/public/health

# Test QR codes endpoint
curl https://your-app.vercel.app/api/public/qr-codes

# Test surveys endpoint
curl https://your-app.vercel.app/api/public/surveys
```

### 2. Test Frontend Routes

Buka browser dan test:
- ✅ Homepage: `https://your-app.vercel.app/`
- ✅ Login: `https://your-app.vercel.app/login`
- ✅ Dashboard: `https://your-app.vercel.app/dashboard`
- ✅ Public Survey: `https://your-app.vercel.app/public/survey`
- ✅ Public Ticket: `https://your-app.vercel.app/public/ticket`
- ✅ Track Ticket: `https://your-app.vercel.app/public/track`

### 3. Test Refresh (404 Prevention)

Refresh halaman di berbagai route untuk memastikan tidak ada error 404.

### 4. Test Form Submission

- ✅ Submit survey form
- ✅ Submit external ticket
- ✅ Submit internal ticket
- ✅ Track ticket dengan nomor tiket

### 5. Cek Console Browser

Buka Developer Tools → Console, pastikan tidak ada error:
- ❌ `undefined` API URL
- ❌ CORS errors
- ❌ 404 errors untuk API calls

## 🐛 Troubleshooting

### Masalah: API mengembalikan undefined

**Solusi:**
1. Cek Environment Variables di Vercel Dashboard
2. Pastikan semua variabel sudah ditambahkan
3. Klik "Redeploy" setelah menambah/ubah env vars

### Masalah: Error 404 saat refresh halaman

**Solusi:**
Sudah ditangani oleh `vercel.json` dengan rewrites:
```json
"rewrites": [
  {
    "source": "/((?!api/|assets/|.*\\..*).*)",
    "destination": "/index.html"
  }
]
```

### Masalah: CORS Error

**Solusi:**
Sudah ditangani oleh headers di `vercel.json`:
```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      { "key": "Access-Control-Allow-Origin", "value": "*" }
    ]
  }
]
```

### Masalah: Build Failed

**Solusi:**
1. Cek build logs di Vercel Dashboard
2. Pastikan semua dependencies terinstall
3. Test build di lokal terlebih dahulu
4. Cek TypeScript errors dengan `npm run build`

### Masalah: Environment Variables tidak terbaca

**Solusi:**
1. Pastikan prefix `VITE_` untuk frontend variables
2. Pastikan TIDAK ada prefix untuk backend variables
3. Redeploy setelah menambah env vars
4. Clear cache browser dan test lagi

## 📊 Monitoring Setelah Deploy

### 1. Cek Vercel Analytics
- Buka Vercel Dashboard → Analytics
- Monitor traffic dan performance

### 2. Cek Vercel Logs
- Buka Vercel Dashboard → Deployments → View Function Logs
- Monitor API errors dan warnings

### 3. Cek Supabase Dashboard
- Monitor database queries
- Cek RLS policies
- Monitor API usage

## 🔐 Security Checklist

- ✅ File `.env` tidak ter-commit ke Git
- ✅ Service Role Key hanya di backend (tidak di frontend)
- ✅ Anon Key di frontend (aman karena protected by RLS)
- ✅ CORS headers sudah dikonfigurasi
- ✅ Security headers sudah ditambahkan

## 📝 Catatan Penting

1. **Jangan commit file `.env`** - Gunakan Vercel Dashboard untuk env vars
2. **Redeploy setelah ubah env vars** - Perubahan tidak otomatis apply
3. **Test di lokal dulu** - Pastikan build berhasil sebelum deploy
4. **Monitor logs** - Cek Vercel logs untuk debug issues
5. **Backup database** - Backup Supabase sebelum deploy major changes

## ✅ Final Checklist

Sebelum deploy, pastikan:

- [ ] Semua env vars sudah ditambahkan di Vercel Dashboard
- [ ] File `.env` tidak ter-commit ke Git
- [ ] Build berhasil di lokal (`npm run vercel-build`)
- [ ] `vercel.json` sudah benar
- [ ] TypeScript tidak ada error
- [ ] Test API endpoints di lokal
- [ ] Test form submissions di lokal
- [ ] Backup database Supabase

Setelah deploy, verifikasi:

- [ ] Homepage bisa diakses
- [ ] API endpoints berfungsi
- [ ] Form submissions berhasil
- [ ] Refresh tidak error 404
- [ ] Console browser tidak ada error
- [ ] Supabase connection berhasil

---

**Status**: ✅ Aplikasi siap untuk di-deploy ke Vercel

**Terakhir diupdate**: 2025-02-15
