# Perbaikan Error Vercel - Analisis dan Solusi

## 🔍 Analisis Masalah

Dari screenshot error yang diberikan, teridentifikasi beberapa masalah utama:

### 1. **Error Loading Units**
```
Error loading units: Error: Server mengembalikan response yang tidak valid
```

### 2. **Error Loading App Settings**
```
Error loading app settings: SyntaxError: Unexpected token '<'
```

### 3. **Non-JSON Response**
```
Non-JSON response: <!doctype html>
```

### 4. **405 Method Not Allowed**
```
POST https://kiss2.vercel.app/api/public/internal-tickets 405 (Method Not Allowed)
```

### 5. **Submit Error**
```
Submit error: Error: Server mengembalikan response yang tidak valid (bukan JSON)
```

## 🎯 Akar Masalah

**Masalah utama**: API routes di Vercel tidak berfungsi dengan benar karena:

1. **Konflik Routing di `vercel.json`**
   - Menggunakan `rewrites` dan `routes` bersamaan menyebabkan konflik
   - Route pattern `/api/public/(.*)` terlalu umum dan menimpa route spesifik
   - Vercel mengembalikan HTML (halaman 404) bukan JSON response

2. **Environment Variables**
   - Kemungkinan environment variables belum di-set di Vercel Dashboard
   - API functions tidak bisa connect ke Supabase

3. **File Extension di Routes**
   - Routes tidak mengarah ke file `.ts` dengan benar

## ✅ Solusi yang Diterapkan

### 1. Perbaikan `vercel.json`

**SEBELUM** (Bermasalah):
```json
{
  "rewrites": [...],
  "routes": [
    {
      "src": "/api/public/(.*)",
      "dest": "/api/public/$1"
    },
    ...
  ]
}
```

**SESUDAH** (Diperbaiki):
```json
{
  "routes": [
    {
      "src": "/api/public/internal-tickets",
      "dest": "/api/public/internal-tickets.ts"
    },
    {
      "src": "/api/public/external-tickets",
      "dest": "/api/public/external-tickets.ts"
    },
    {
      "src": "/api/public/surveys",
      "dest": "/api/public/surveys.ts"
    },
    {
      "src": "/api/public/units",
      "dest": "/api/public/units.ts"
    },
    {
      "src": "/api/public/app-settings",
      "dest": "/api/public/app-settings.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Perubahan Kunci**:
- ✅ Hapus `rewrites` (konflik dengan `routes`)
- ✅ Route spesifik untuk setiap endpoint API
- ✅ Tambahkan `.ts` extension di destination
- ✅ Tambahkan `"handle": "filesystem"` untuk static files
- ✅ Catch-all route untuk SPA di akhir

### 2. Verifikasi API Functions

Semua API functions sudah:
- ✅ Set CORS headers dengan benar
- ✅ Handle OPTIONS request
- ✅ Return JSON valid meskipun error
- ✅ Validasi environment variables
- ✅ Error handling yang proper

### 3. Script Deploy Otomatis

Dibuat `DEPLOY_VERCEL_FIX_FINAL.bat` yang:
- Membersihkan cache dan build lama
- Install dependencies
- Build frontend
- Verifikasi file API
- Deploy ke Vercel

## 📋 Langkah-Langkah Deploy

### 1. Set Environment Variables di Vercel Dashboard

Buka Vercel Dashboard → Project Settings → Environment Variables

Tambahkan:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**PENTING**: Set untuk **Production**, **Preview**, dan **Development**

### 2. Deploy Aplikasi

Jalankan:
```bash
DEPLOY_VERCEL_FIX_FINAL.bat
```

Atau manual:
```bash
# 1. Bersihkan cache
rmdir /s /q frontend\dist
rmdir /s /q .vercel

# 2. Install dependencies
npm install

# 3. Build frontend
npm run vercel-build

# 4. Deploy
vercel --prod
```

### 3. Verifikasi Deployment

Setelah deploy berhasil, test endpoint:

**Test Units API**:
```
https://your-app.vercel.app/api/public/units
```

Expected response:
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

**Test App Settings API**:
```
https://your-app.vercel.app/api/public/app-settings
```

Expected response:
```json
{
  "success": true,
  "data": {
    "institution_name": "...",
    ...
  }
}
```

**Test Internal Tickets API** (POST):
```bash
curl -X POST https://your-app.vercel.app/api/public/internal-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_name": "Test",
    "reporter_email": "test@example.com",
    "unit_id": "uuid-here",
    "title": "Test",
    "description": "Test",
    "priority": "medium"
  }'
```

## 🔧 Troubleshooting

### Jika Masih Error 405

1. **Cek Vercel Logs**:
   - Buka Vercel Dashboard → Deployments → Latest → Functions
   - Lihat log error dari API functions

2. **Cek Environment Variables**:
   - Pastikan semua env vars sudah di-set
   - Redeploy setelah menambah env vars

3. **Cek File API**:
   - Pastikan file `api/public/*.ts` ada
   - Pastikan tidak ada syntax error

### Jika Masih Return HTML

1. **Clear Vercel Cache**:
   ```bash
   vercel --prod --force
   ```

2. **Cek Routes Order**:
   - Route spesifik harus di atas catch-all route
   - `"handle": "filesystem"` harus sebelum catch-all

3. **Cek Build Output**:
   - Pastikan `frontend/dist` ter-generate dengan benar
   - Pastikan `index.html` ada di `frontend/dist`

### Jika Supabase Connection Error

1. **Verifikasi Credentials**:
   - Test di local dulu dengan env vars yang sama
   - Pastikan URL dan keys valid

2. **Cek RLS Policies**:
   - Pastikan tables memiliki policies yang benar
   - Test query langsung di Supabase Dashboard

## 📊 Perbandingan Local vs Vercel

| Aspek | Local (Berjalan Normal) | Vercel (Error) | Solusi |
|-------|------------------------|----------------|---------|
| API Routing | Express.js handles | Vercel Functions | Fix vercel.json routes |
| Environment | .env files | Vercel Dashboard | Set env vars di dashboard |
| CORS | Express middleware | Function headers | Already handled in code |
| Error Response | JSON | HTML (404 page) | Fix routing to functions |

## ✅ Checklist Sebelum Deploy

- [ ] Environment variables sudah di-set di Vercel Dashboard
- [ ] File `vercel.json` sudah diperbaiki
- [ ] Build local berhasil (`npm run vercel-build`)
- [ ] Semua file API ada di `api/public/`
- [ ] Test local dengan env vars production
- [ ] Commit dan push ke Git (optional)
- [ ] Deploy dengan `vercel --prod`
- [ ] Test semua endpoint setelah deploy
- [ ] Cek Vercel logs jika ada error

## 🎉 Hasil yang Diharapkan

Setelah perbaikan:
- ✅ API endpoints return JSON valid
- ✅ Units loading berhasil
- ✅ App settings loading berhasil
- ✅ Form submission berhasil
- ✅ Tidak ada error 405
- ✅ Tidak ada "Unexpected token '<'"
- ✅ Aplikasi berjalan normal seperti di local

## 📞 Support

Jika masih ada masalah setelah mengikuti panduan ini:
1. Cek Vercel deployment logs
2. Cek browser console untuk error detail
3. Test API endpoints langsung dengan curl/Postman
4. Verifikasi environment variables di Vercel Dashboard
