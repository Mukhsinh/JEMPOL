# 🚀 PANDUAN DEPLOY VERCEL - SIAP PRODUCTION

## 📍 Repository GitHub
**Aplikasi ini disimpan di:** https://github.com/Mukhsinh/JEMPOL.git

## ✅ Status Persiapan
- [x] Build berhasil tanpa error
- [x] Konfigurasi `vercel.json` sudah optimal
- [x] Environment variables sudah disiapkan
- [x] TypeScript errors sudah diperbaiki
- [x] API endpoints sudah dikonfigurasi

## 🔧 Konfigurasi yang Sudah Disiapkan

### 1. **vercel.json**
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/[...slug]"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. **Environment Variables**
File `.env.production` sudah dibuat dengan:
```
VITE_API_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. **Build Script**
```json
{
  "vercel-build": "cd frontend && npm install && npm run build"
}
```

## 🚀 Langkah Deploy ke Vercel

### Opsi 1: Deploy via Vercel Dashboard (RECOMMENDED)

1. **Commit dan Push ke GitHub:**
   ```bash
   git add .
   git commit -m "feat: siap deploy ke vercel - build berhasil"
   git push origin main
   ```

2. **Import Project ke Vercel:**
   - Buka [Vercel Dashboard](https://vercel.com/dashboard)
   - Klik "New Project"
   - Import dari GitHub: `Mukhsinh/JEMPOL`
   - Vercel akan auto-detect konfigurasi dari `vercel.json`

3. **Set Environment Variables di Vercel:**
   - Di project settings, tambahkan:
     - `VITE_SUPABASE_URL` = URL Supabase Anda
     - `VITE_SUPABASE_ANON_KEY` = Anon key Supabase Anda

4. **Deploy:**
   - Klik "Deploy"
   - Tunggu proses build selesai (~2-3 menit)

### Opsi 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 🧪 Test Build Lokal

Untuk memastikan build berhasil sebelum deploy:

```bash
npm run vercel-build
```

Jika berhasil, folder `frontend/dist` akan berisi file-file production.

## 📋 Checklist Deploy

- [x] Repository: https://github.com/Mukhsinh/JEMPOL.git
- [x] Build script berfungsi
- [x] TypeScript errors diperbaiki
- [x] Konfigurasi vercel.json optimal
- [x] Environment variables disiapkan
- [ ] Code di-push ke GitHub
- [ ] Project di-import ke Vercel
- [ ] Environment variables di-set di Vercel
- [ ] Deploy berhasil

## 🎯 Fitur yang Akan Tersedia Setelah Deploy

### Frontend (Static)
- ✅ Landing page dengan game interaktif
- ✅ Dashboard admin
- ✅ Sistem tiket dan complaint
- ✅ Survey management
- ✅ Master data management
- ✅ User management
- ✅ Reports dan analytics

### API (Serverless Functions)
- ✅ Health check endpoint: `/api/health`
- ✅ Proxy untuk backend services: `/api/*`

## ⚠️ Catatan Penting

1. **Backend Terpisah**: Backend Node.js tidak di-deploy ke Vercel, hanya frontend
2. **API Proxy**: Endpoint `/api/*` akan di-handle oleh serverless functions
3. **Database**: Pastikan Supabase sudah dikonfigurasi dengan benar
4. **File Upload**: Fitur upload mungkin perlu penyesuaian untuk Vercel

## 🔧 Troubleshooting

### Build Error
```bash
# Cek error detail
npm run vercel-build

# Fix dependencies
npm install
cd frontend && npm install
```

### Environment Variables
Pastikan di Vercel Dashboard sudah set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### API Not Working
- Cek apakah backend server sudah running
- Pastikan CORS sudah dikonfigurasi
- Periksa network tab di browser

## 📞 Support

Jika ada masalah saat deploy:
1. Cek build logs di Vercel Dashboard
2. Test build lokal dengan `npm run vercel-build`
3. Pastikan semua environment variables sudah benar

## 🎉 Setelah Deploy Berhasil

Anda akan mendapatkan:
- URL production (contoh: `https://jempol-xxx.vercel.app`)
- Auto-deploy setiap push ke GitHub
- Preview deployments untuk pull requests
- SSL certificate otomatis
- CDN global untuk performa optimal

---

**Repository:** https://github.com/Mukhsinh/JEMPOL.git  
**Status:** ✅ Siap Deploy ke Vercel