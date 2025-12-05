# 🚀 Deploy Aplikasi untuk PowerPoint Viewer

## Kenapa Perlu Deploy?

PowerPoint Viewer menggunakan **Office Online** dan **Google Docs Viewer** yang memerlukan URL publik. Localhost tidak bisa diakses oleh server eksternal, jadi PowerPoint tidak bisa tampil langsung.

**Setelah deploy**, PowerPoint akan tampil sempurna langsung di browser tanpa perlu download!

---

## ✅ Option 1: Vercel (Recommended - Gratis)

### Keuntungan:
- ✅ Gratis untuk personal project
- ✅ Deploy otomatis dari Git
- ✅ HTTPS gratis
- ✅ CDN global (cepat di seluruh dunia)
- ✅ Easy setup (5 menit)

### Langkah-Langkah:

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login ke Vercel
```bash
vercel login
```

#### 3. Deploy Backend
```bash
cd backend
vercel

# Ikuti prompt:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? jempol-backend
# - Directory? ./
# - Override settings? No
```

Setelah deploy, Anda akan dapat URL seperti:
```
https://jempol-backend.vercel.app
```

#### 4. Deploy Frontend
```bash
cd ../frontend
vercel

# Ikuti prompt yang sama
# Project name? jempol-frontend
```

#### 5. Set Environment Variables

**Di Vercel Dashboard** (https://vercel.com):
1. Buka project `jempol-frontend`
2. Settings → Environment Variables
3. Tambahkan:
   ```
   VITE_API_URL=https://jempol-backend.vercel.app/api
   VITE_PUBLIC_URL=https://jempol-backend.vercel.app
   ```
4. Redeploy: `vercel --prod`

**Di Vercel Dashboard untuk Backend**:
1. Buka project `jempol-backend`
2. Settings → Environment Variables
3. Tambahkan semua variable dari `.env`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   FRONTEND_URL=https://jempol-frontend.vercel.app
   ```

#### 6. Test PowerPoint Viewer
1. Buka https://jempol-frontend.vercel.app
2. Klik card PowerPoint
3. PowerPoint akan tampil langsung! 🎉

---

## ✅ Option 2: Netlify (Gratis)

### Keuntungan:
- ✅ Gratis untuk personal project
- ✅ Drag & drop deploy
- ✅ HTTPS gratis
- ✅ Form handling built-in

### Langkah-Langkah:

#### 1. Build Frontend
```bash
cd frontend
npm run build
```

#### 2. Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 3. Login dan Deploy
```bash
netlify login
netlify deploy --prod

# Pilih:
# - Create & configure a new site
# - Publish directory: dist
```

#### 4. Deploy Backend
Untuk backend, gunakan Vercel atau Railway (Netlify lebih cocok untuk frontend)

#### 5. Set Environment Variables
Di Netlify Dashboard:
1. Site settings → Environment variables
2. Tambahkan `VITE_API_URL` dan `VITE_PUBLIC_URL`
3. Redeploy

---

## ✅ Option 3: Railway (Gratis untuk Backend)

### Keuntungan:
- ✅ Gratis $5/bulan credit
- ✅ Support Node.js backend
- ✅ Database built-in
- ✅ Auto deploy dari Git

### Langkah-Langkah:

#### 1. Buat Akun di Railway.app
https://railway.app

#### 2. New Project → Deploy from GitHub
- Connect GitHub repository
- Pilih folder `backend`

#### 3. Set Environment Variables
Di Railway Dashboard:
- Tambahkan semua variable dari `.env`

#### 4. Deploy Frontend ke Vercel/Netlify
- Gunakan Railway URL untuk backend

---

## ✅ Option 4: Ngrok (Testing Saja)

### Keuntungan:
- ✅ Instant public URL
- ✅ Tidak perlu deploy
- ✅ Bagus untuk testing

### Kekurangan:
- ❌ URL berubah setiap restart
- ❌ Tidak untuk production
- ❌ Koneksi bisa lambat

### Langkah-Langkah:

#### 1. Install Ngrok
```bash
npm install -g ngrok
```

#### 2. Jalankan Aplikasi
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### 3. Expose Backend dengan Ngrok
```bash
# Terminal 3
ngrok http 5000
```

Anda akan dapat URL seperti:
```
https://abc123.ngrok.io
```

#### 4. Update Frontend Environment
Edit `frontend/.env`:
```
VITE_API_URL=https://abc123.ngrok.io/api
VITE_PUBLIC_URL=https://abc123.ngrok.io
```

#### 5. Restart Frontend
```bash
cd frontend
npm run dev
```

#### 6. Test PowerPoint
Buka http://localhost:3001 dan test PowerPoint viewer!

---

## 🎯 Rekomendasi

### Untuk Development:
- ✅ Gunakan download button (sudah optimal)
- ✅ Atau gunakan ngrok untuk testing viewer

### Untuk Production:
- ✅ **Vercel** (paling mudah dan gratis)
- ✅ Frontend di Vercel + Backend di Railway
- ✅ Netlify untuk frontend saja

### Untuk Enterprise:
- ✅ VPS (DigitalOcean, AWS, Google Cloud)
- ✅ Docker + Kubernetes
- ✅ Custom domain + SSL

---

## 🔧 Troubleshooting

### PowerPoint Masih Tidak Tampil Setelah Deploy?

#### 1. Cek URL Publik
Pastikan `VITE_PUBLIC_URL` sudah benar:
```bash
# Di browser console
console.log(import.meta.env.VITE_PUBLIC_URL)
```

#### 2. Cek CORS
Pastikan backend sudah set CORS headers (sudah diimplementasikan)

#### 3. Cek File URL
Pastikan file PowerPoint bisa diakses:
```
https://your-backend.vercel.app/uploads/filename.pptx
```

#### 4. Test dengan Google Docs Viewer
Klik tombol "Google Docs" di viewer untuk coba alternatif

#### 5. Cek Browser Console
Buka Developer Tools → Console untuk lihat error

---

## 📞 Bantuan

Jika masih ada masalah:
1. Cek dokumentasi di `PERBAIKAN_POWERPOINT_DAN_THUMBNAIL.md`
2. Cek logs di Vercel/Netlify dashboard
3. Test dengan file PowerPoint yang berbeda
4. Gunakan download option sebagai fallback

---

**Status**: ✅ Siap untuk deploy
**Estimasi Waktu**: 10-15 menit
**Biaya**: Gratis (Vercel/Netlify free tier)
