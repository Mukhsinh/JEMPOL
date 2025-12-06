# 📱 PANDUAN VISUAL - DEPLOY KE VERCEL

## ✅ STATUS: Code Sudah Di-Push ke GitHub!

Commit: `8c4fe71` - "fix: vercel deployment configuration"

---

## 🚀 LANGKAH-LANGKAH DEPLOY

### Step 1: Buka Vercel Dashboard

1. Buka browser dan kunjungi: **https://vercel.com/dashboard**
2. Login dengan akun GitHub Anda
3. Jika belum punya akun, klik "Sign Up" dan pilih "Continue with GitHub"

---

### Step 2: Import Project

1. Di dashboard Vercel, klik tombol **"Add New..."**
2. Pilih **"Project"**
3. Akan muncul daftar repository GitHub Anda
4. Cari repository: **"JEMPOL"** atau **"Mukhsinh/JEMPOL"**
5. Klik tombol **"Import"** di sebelah repository tersebut

---

### Step 3: Configure Project

Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`:

**Yang Akan Terdeteksi:**
```
✓ Framework Preset: Other
✓ Build Command: npm run vercel-build
✓ Output Directory: frontend/dist
✓ Install Command: npm install
```

**Jangan ubah apapun!** Konfigurasi sudah benar.

---

### Step 4: Environment Variables (Optional)

Jika ingin mengubah API URL:

1. Scroll ke bawah ke section **"Environment Variables"**
2. Klik **"Add"**
3. Tambahkan:
   - **Name:** `VITE_API_URL`
   - **Value:** `/api` (atau URL backend Anda)
4. Klik **"Add"** lagi

**Catatan:** Ini optional karena sudah ada di `.env.production`

---

### Step 5: Deploy!

1. Scroll ke paling bawah
2. Klik tombol besar **"Deploy"**
3. Tunggu proses build (2-5 menit)

**Proses yang Terjadi:**
```
⏳ Cloning repository...
⏳ Installing dependencies...
⏳ Running build command...
⏳ Uploading build output...
✅ Deployment ready!
```

---

### Step 6: Verifikasi Deployment

Setelah deploy selesai:

1. Akan muncul **"Congratulations!"** dengan confetti 🎉
2. Klik tombol **"Visit"** untuk membuka website
3. URL akan seperti: `https://jempol-xxx.vercel.app`

**Test Checklist:**
- [ ] Homepage terbuka dengan benar
- [ ] Navigasi menu berfungsi
- [ ] Styling (CSS) ter-load
- [ ] Gambar/logo tampil
- [ ] Routing ke halaman lain berfungsi

---

## 🔄 AUTO-DEPLOY

Setelah setup awal, setiap kali Anda push ke GitHub:

```bash
git add .
git commit -m "update: fitur baru"
git push origin main
```

Vercel akan **otomatis deploy** dalam 2-5 menit!

**Cara Cek Status Deploy:**
1. Buka Vercel Dashboard
2. Klik project "JEMPOL"
3. Lihat tab "Deployments"
4. Status akan muncul: Building → Ready

---

## 📊 Monitoring & Logs

### Cara Lihat Build Logs

1. Di Vercel Dashboard, klik project Anda
2. Klik deployment yang ingin dilihat
3. Klik tab **"Building"** atau **"Logs"**
4. Scroll untuk lihat detail build process

### Jika Build Gagal

1. **Cek Error Message** di build logs
2. **Copy error message** yang muncul
3. **Test lokal** dengan:
   ```bash
   npm run vercel-build
   ```
4. Fix error, commit, dan push lagi

---

## 🎯 Custom Domain (Optional)

Setelah deploy berhasil, Anda bisa tambah custom domain:

1. Di project dashboard, klik tab **"Settings"**
2. Klik **"Domains"** di sidebar
3. Klik **"Add"**
4. Masukkan domain Anda (contoh: `jempol.com`)
5. Follow instruksi untuk update DNS

---

## 🔧 Environment Variables Management

### Cara Update Environment Variables

1. Di project dashboard, klik tab **"Settings"**
2. Klik **"Environment Variables"** di sidebar
3. Klik **"Add New"** atau edit yang sudah ada
4. Pilih environment: Production, Preview, atau Development
5. Klik **"Save"**
6. **Redeploy** untuk apply changes

### Variables yang Mungkin Dibutuhkan

```env
VITE_API_URL=https://your-backend-api.com
VITE_PUBLIC_URL=https://jempol.vercel.app
```

---

## 📱 Preview Deployments

Setiap kali Anda push ke branch selain `main`:

1. Vercel akan create **Preview Deployment**
2. URL akan seperti: `https://jempol-git-feature-xxx.vercel.app`
3. Berguna untuk testing sebelum merge ke main

---

## 🚨 Troubleshooting

### Build Gagal dengan Error "Module not found"

**Solusi:**
```bash
cd frontend
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Halaman Blank Setelah Deploy

**Solusi:**
1. Buka Console Browser (F12)
2. Cek error message
3. Biasanya karena API URL salah
4. Update environment variable `VITE_API_URL`

### 404 Error saat Refresh Halaman

**Solusi:** Sudah di-handle dengan `rewrites` di `vercel.json`:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

### Build Timeout

**Solusi:**
1. Cek apakah ada dependencies yang terlalu besar
2. Optimize build dengan menghapus unused dependencies
3. Contact Vercel support jika masih timeout

---

## 📞 Support

### Vercel Documentation
- https://vercel.com/docs

### Vercel Support
- https://vercel.com/support

### Community
- Discord: https://vercel.com/discord
- GitHub Discussions: https://github.com/vercel/vercel/discussions

---

## ✨ Tips & Tricks

### 1. Faster Builds
- Vercel cache dependencies otomatis
- Build kedua dan seterusnya akan lebih cepat

### 2. Branch Previews
- Push ke branch `dev` untuk preview
- Test sebelum merge ke `main`

### 3. Rollback
- Jika deploy baru bermasalah
- Klik deployment lama → "Promote to Production"

### 4. Analytics
- Upgrade ke Pro untuk analytics
- Lihat visitor stats, performance, dll

---

## 🎉 Selamat!

Jika Anda sampai di sini dan deploy berhasil, **CONGRATULATIONS!** 🎊

Website Anda sekarang:
- ✅ Live di internet
- ✅ Auto-deploy setiap push
- ✅ SSL certificate gratis
- ✅ CDN global
- ✅ Unlimited bandwidth (Hobby plan)

**Next Steps:**
1. Share URL dengan tim
2. Setup custom domain (optional)
3. Monitor analytics
4. Deploy backend ke Railway/Render

---

**Happy Deploying! 🚀**
