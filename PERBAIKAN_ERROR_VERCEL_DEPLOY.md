# Perbaikan Error Vercel Deploy

## Masalah yang Ditemukan

Dari screenshot error yang Anda berikan, ada beberapa masalah:

1. **Error 405 Method Not Allowed** - Endpoint internal-tickets
2. **Non-JSON Response** - Server mengembalikan HTML instead of JSON
3. **Error loading units** - Response tidak valid
4. **Error loading app settings** - SyntaxError: Unexpected token

## Penyebab

1. **Routing Vercel tidak tepat** - Vercel tidak mengarahkan request ke serverless function dengan benar
2. **Environment variables tidak terset** - VITE_SUPABASE_URL dan VITE_SUPABASE_SERVICE_ROLE_KEY
3. **Timeout terlalu pendek** - maxDuration hanya 10 detik

## Solusi yang Diterapkan

### 1. Perbaikan vercel.json

✅ **Perubahan routing:**
- Menggunakan explicit routes dengan methods yang jelas
- Menambahkan `.ts` extension di destination
- Menambahkan `handle: filesystem` untuk static files
- Meningkatkan maxDuration dari 10 ke 30 detik

✅ **Perbaikan CORS headers:**
- Menambahkan Access-Control-Allow-Credentials
- Memperluas Access-Control-Allow-Headers
- Menggunakan wildcard methods yang lebih lengkap

### 2. Environment Variables yang Harus Diset di Vercel

Buka Vercel Dashboard → Project Settings → Environment Variables, lalu tambahkan:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
```

**PENTING:** Setelah menambahkan environment variables, Anda HARUS **Redeploy** aplikasi!

### 3. Cara Deploy Ulang

```bash
# 1. Commit perubahan
git add vercel.json
git commit -m "fix: perbaiki routing dan CORS untuk Vercel API"

# 2. Push ke GitHub
git push origin main

# 3. Vercel akan otomatis deploy ulang
# ATAU deploy manual:
vercel --prod
```

### 4. Verifikasi Setelah Deploy

1. **Cek Environment Variables:**
   - Buka Vercel Dashboard
   - Pastikan semua env vars sudah terset
   - Klik "Redeploy" jika baru menambahkan env vars

2. **Test API Endpoints:**
   ```bash
   # Test units endpoint
   curl https://your-app.vercel.app/api/public/units
   
   # Test app-settings endpoint
   curl https://your-app.vercel.app/api/public/app-settings
   
   # Test internal-tickets endpoint (POST)
   curl -X POST https://your-app.vercel.app/api/public/internal-tickets \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","description":"Test","unit_id":"uuid-here"}'
   ```

3. **Cek Logs di Vercel:**
   - Buka Vercel Dashboard → Deployments → Latest
   - Klik "View Function Logs"
   - Lihat apakah ada error

## Troubleshooting

### Jika Masih Error 405

1. Pastikan routing di vercel.json sudah benar
2. Clear cache Vercel: Settings → Clear Cache → Redeploy
3. Cek apakah file API ada di folder `api/public/`

### Jika Masih Non-JSON Response

1. Cek environment variables sudah terset
2. Lihat function logs untuk error detail
3. Pastikan Supabase credentials valid

### Jika Timeout

1. Tingkatkan maxDuration di vercel.json (sudah dinaikkan ke 30)
2. Optimasi query Supabase
3. Upgrade Vercel plan jika perlu

## Checklist Deploy

- [ ] vercel.json sudah diperbaiki
- [ ] Environment variables sudah diset di Vercel Dashboard
- [ ] Commit dan push ke GitHub
- [ ] Vercel sudah redeploy otomatis
- [ ] Test semua API endpoints
- [ ] Cek function logs tidak ada error
- [ ] Test form submission dari browser
- [ ] Verifikasi data masuk ke Supabase

## Catatan Penting

1. **Jangan ubah auth** - Konfigurasi auth sudah benar, jangan diubah
2. **Environment variables** - Harus sama persis dengan yang di local
3. **Redeploy wajib** - Setelah ubah env vars atau vercel.json
4. **Check logs** - Selalu cek function logs untuk debugging
