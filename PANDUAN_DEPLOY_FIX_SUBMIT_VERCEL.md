# PANDUAN DEPLOY DAN PERBAIKAN ERROR SUBMIT TIKET VERCEL

## Masalah yang Ditemukan

1. **Error 405 (Method Not Allowed)** pada endpoint /api/public/internal-tickets
2. **Server mengembalikan HTML instead of JSON** (non-JSON response)
3. **Error loading app settings** - response tidak valid

## Penyebab

- Vercel serverless function tidak ter-deploy dengan benar
- Environment variables tidak ter-set di Vercel
- CORS headers tidak lengkap
- Error handling tidak mengembalikan JSON yang valid

## Solusi yang Diterapkan

### 1. Perbaikan File API

✅ **api/public/internal-tickets.ts**
- Menambahkan logging yang lebih detail
- Memperbaiki CORS headers
- Menambahkan Cache-Control header
- Memperbaiki OPTIONS handler
- Menambahkan validasi environment variables yang lebih baik

✅ **api/public/app-settings.ts**
- Sudah diperbaiki sebelumnya
- Mengembalikan default settings jika error

### 2. Environment Variables yang Diperlukan

Pastikan environment variables berikut sudah di-set di **Vercel Dashboard**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Cara set environment variables di Vercel:**

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik tab **Settings**
4. Klik **Environment Variables**
5. Tambahkan ketiga variable di atas
6. Pilih environment: **Production**, **Preview**, dan **Development**
7. Klik **Save**

### 3. Cara Deploy

```bash
# 1. Commit perubahan
git add .
git commit -m "fix: perbaikan error submit tiket di Vercel"

# 2. Push ke GitHub
git push origin main

# 3. Vercel akan otomatis deploy
# Atau deploy manual:
vercel --prod
```

### 4. Cara Test Setelah Deploy

1. **Buka file test di browser:**
   ```
   https://your-domain.vercel.app/test-vercel-submit-endpoints.html
   ```

2. **Test setiap endpoint:**
   - Test OPTIONS request (untuk CORS)
   - Test POST internal ticket
   - Test POST external ticket
   - Test GET app settings
   - Test GET units

3. **Periksa Vercel Logs:**
   - Buka Vercel Dashboard
   - Klik project Anda
   - Klik tab **Deployments**
   - Klik deployment terbaru
   - Klik **Functions** untuk melihat logs

### 5. Troubleshooting

#### Jika masih error 405:

1. **Cek routing di vercel.json:**
   ```json
   {
     "rewrites": [
       {
         "source": "/((?!api/).*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. **Cek file ada di folder api/public/:**
   - internal-tickets.ts
   - external-tickets.ts
   - app-settings.ts
   - units.ts
   - surveys.ts

3. **Cek Vercel Function Logs:**
   - Buka Vercel Dashboard > Deployments > Functions
   - Lihat error message yang muncul

#### Jika response bukan JSON:

1. **Cek Content-Type header:**
   - Harus: `application/json; charset=utf-8`

2. **Cek error handling:**
   - Semua error harus return JSON
   - Tidak boleh return HTML

3. **Cek environment variables:**
   - Pastikan semua variable sudah ter-set
   - Restart deployment jika baru set variable

#### Jika environment variables tidak terbaca:

1. **Redeploy setelah set variables:**
   ```bash
   vercel --prod --force
   ```

2. **Cek di Vercel Dashboard:**
   - Settings > Environment Variables
   - Pastikan sudah ter-set untuk Production

3. **Cek di Function Logs:**
   - Lihat apakah ada log "MISSING" untuk env vars

### 6. Checklist Deploy

- [ ] Semua file API ada di folder api/public/
- [ ] vercel.json sudah benar
- [ ] Environment variables sudah di-set di Vercel
- [ ] Code sudah di-commit dan push
- [ ] Deployment berhasil (cek Vercel Dashboard)
- [ ] Test endpoint dengan file test HTML
- [ ] Cek Vercel Function Logs tidak ada error
- [ ] Test submit tiket dari aplikasi

### 7. Monitoring

Setelah deploy, monitor:

1. **Vercel Function Logs:**
   - Cek apakah ada error
   - Cek apakah request masuk

2. **Browser Console:**
   - Cek apakah ada error CORS
   - Cek apakah response valid JSON

3. **Network Tab:**
   - Cek status code (harus 200/201)
   - Cek response headers
   - Cek response body

## Kontak

Jika masih ada masalah, cek:
1. Vercel Function Logs
2. Browser Console
3. Network Tab di DevTools
