# 🚀 Deploy ke Vercel - Panduan Cepat

## ⚡ Quick Start

### 1. Verifikasi Kesiapan

```bash
npm run verify-vercel
```

Pastikan semua ✅ sebelum lanjut.

### 2. Setup Environment Variables

Buka Vercel Dashboard dan tambahkan 7 variabel ini:

**Frontend (dengan prefix VITE_):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL=/api`

**Backend (tanpa prefix VITE_):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Ambil dari Supabase Dashboard
- `NODE_ENV=production`

📖 Lihat [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) untuk panduan detail.

### 3. Test Build Lokal (Opsional)

```bash
npm run test-build-vercel
```

### 4. Deploy

**Opsi A: Via Vercel CLI**
```bash
vercel --prod
```

**Opsi B: Via Git Push**
```bash
git add .
git commit -m "Ready for deployment"
git push
```

Vercel akan otomatis detect dan deploy.

**Opsi C: Via Vercel Dashboard**
1. Buka Vercel Dashboard
2. Klik "Add New Project"
3. Import repository
4. Klik "Deploy"

### 5. Verifikasi Deployment

Setelah deploy selesai, test:

```bash
# Test API
curl https://your-app.vercel.app/api/public/health

# Test Frontend
# Buka browser: https://your-app.vercel.app
```

## 📋 Checklist Deployment

- [ ] `npm run verify-vercel` berhasil
- [ ] Environment variables sudah ditambahkan di Vercel
- [ ] SUPABASE_SERVICE_ROLE_KEY sudah benar
- [ ] File .env tidak ter-commit
- [ ] Build berhasil di lokal
- [ ] Sudah Redeploy setelah tambah env vars

## 🐛 Troubleshooting

### Build Failed

```bash
# Test build di lokal
npm run test-build-vercel

# Cek error di output
```

### API Error (undefined)

1. Cek env vars di Vercel Dashboard
2. Pastikan prefix VITE_ untuk frontend
3. Redeploy

### Error 404 saat refresh

Sudah ditangani oleh `vercel.json`. Jika masih error:
1. Cek vercel.json ada rewrites
2. Redeploy

## 📚 Dokumentasi Lengkap

- [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) - Checklist lengkap
- [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) - Setup environment variables
- [.env.production.example](./.env.production.example) - Template env vars

## 🎯 Struktur Deployment

```
Root
├── api/                    → Vercel Serverless Functions
│   ├── public/            → Public API endpoints
│   └── master-data/       → Master data endpoints
├── kiss/                   → Frontend source
│   └── src/
└── dist/                   → Build output (auto-generated)
    ├── index.html
    └── assets/
```

## ⚙️ Konfigurasi Vercel

File `vercel.json` sudah dikonfigurasi dengan:
- ✅ Build command
- ✅ Output directory
- ✅ SPA routing (rewrites)
- ✅ API functions
- ✅ CORS headers
- ✅ Security headers

## 🔐 Keamanan

✅ **Aman**:
- Anon key di frontend (protected by RLS)
- Service role key hanya di backend
- File .env tidak ter-commit

❌ **Jangan**:
- Commit file .env
- Expose service role key ke frontend
- Hardcode credentials di code

---

**Status**: ✅ Aplikasi siap deploy

**Terakhir diupdate**: 2025-02-15
