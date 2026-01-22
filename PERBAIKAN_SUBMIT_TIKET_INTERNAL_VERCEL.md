# Perbaikan Submit Tiket Internal di Vercel

## Masalah
Error saat submit tiket internal di aplikasi yang dideploy di Vercel:
- API endpoint mengembalikan HTML (halaman index) bukan JSON
- Error: "Server mengembalikan response yang tidak valid"
- Response: `<!doctype html>...` bukan JSON

## Penyebab
1. **Routing Vercel salah**: Urutan `rewrites` di `vercel.json` salah, sehingga semua request (termasuk API) di-redirect ke `index.html`
2. **Rewrites vs Routes**: Vercel membutuhkan `routes` untuk serverless functions, bukan `rewrites`

## Solusi yang Diterapkan

### 1. Perbaikan vercel.json
**SEBELUM:**
```json
"rewrites": [
  { "source": "/api/public/internal-tickets", "destination": "/api/public/internal-tickets" },
  { "source": "/(.*)", "destination": "/index.html" }  // ❌ Ini menangkap semua request termasuk API
]
```

**SESUDAH:**
```json
"routes": [
  { "src": "/api/public/internal-tickets", "dest": "/api/public/internal-tickets.ts" },
  { "src": "/api/public/units", "dest": "/api/public/units.ts" },
  { "src": "/api/public/app-settings", "dest": "/api/public/app-settings.ts" }
],
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }  // ✅ Hanya untuk frontend routing
]
```

### 2. Perbaikan Content-Type Header
Semua API endpoint sudah memastikan Content-Type JSON di-set SEBELUM operasi lainnya:

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // PERBAIKAN: Set Content-Type SEBELUM operasi lainnya
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // ... rest of headers
}
```

### 3. Validasi Supabase Credentials
Semua endpoint memvalidasi credentials dan memberikan response JSON yang valid:

```typescript
if (!supabaseUrl || !supabaseKey) {
  return res.status(500).json({
    success: false,
    error: 'Konfigurasi server tidak lengkap'
  });
}
```

## File yang Diperbaiki
1. ✅ `vercel.json` - Routing configuration
2. ✅ `api/public/internal-tickets.ts` - Content-Type header
3. ✅ `api/public/units.ts` - Sudah benar
4. ✅ `api/public/app-settings.ts` - Sudah benar

## Cara Deploy

### Opsi 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Deploy
vercel --prod
```

### Opsi 2: Deploy via Git Push
```bash
git add vercel.json api/public/internal-tickets.ts
git commit -m "fix: perbaiki routing API untuk submit tiket internal di Vercel"
git push origin main
```

### Opsi 3: Redeploy di Vercel Dashboard
1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik "Redeploy" pada deployment terakhir
4. Atau push commit baru ke Git

## Verifikasi Setelah Deploy

### 1. Test API Endpoint Units
```bash
curl https://your-app.vercel.app/api/public/units
```
Expected response:
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### 2. Test API Endpoint App Settings
```bash
curl https://your-app.vercel.app/api/public/app-settings
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

### 3. Test Submit Tiket Internal
Buka form di browser:
```
https://your-app.vercel.app/form/internal?unit_id=xxx&unit_name=xxx
```

Isi form dan submit. Seharusnya berhasil tanpa error.

## Environment Variables yang Dibutuhkan di Vercel

Pastikan environment variables berikut sudah di-set di Vercel Dashboard:

1. `VITE_SUPABASE_URL` - URL Supabase project
2. `VITE_SUPABASE_ANON_KEY` - Anon key Supabase
3. `VITE_SUPABASE_SERVICE_ROLE_KEY` - Service role key Supabase (untuk API)

### Cara Set Environment Variables:
1. Buka Vercel Dashboard
2. Pilih project → Settings → Environment Variables
3. Tambahkan ketiga variable di atas
4. Redeploy project

## Troubleshooting

### Jika masih error "Non-JSON response"
1. Cek Vercel logs: `vercel logs`
2. Pastikan environment variables sudah di-set
3. Cek apakah file `api/public/*.ts` ter-deploy dengan benar
4. Clear browser cache dan coba lagi

### Jika error "Missing Supabase credentials"
1. Verifikasi environment variables di Vercel Dashboard
2. Pastikan nama variable PERSIS: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dll
3. Redeploy setelah set environment variables

### Jika error 404 pada API endpoint
1. Cek `vercel.json` sudah benar
2. Pastikan file `api/public/internal-tickets.ts` ada
3. Redeploy dengan `vercel --prod --force`

## Status
✅ Perbaikan selesai
✅ Routing API diperbaiki
✅ Content-Type header diperbaiki
✅ Validasi credentials ditambahkan
⏳ Menunggu deploy ke Vercel

## Catatan Penting
- **JANGAN** ubah auth yang sudah ada
- **JANGAN** ubah kode yang sudah benar dan terintegrasi
- Hanya perbaiki routing dan header untuk Vercel deployment
- Frontend dan backend tetap terintegrasi sempurna
