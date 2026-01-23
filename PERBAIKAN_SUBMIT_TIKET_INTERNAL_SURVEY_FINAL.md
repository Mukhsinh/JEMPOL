# Perbaikan Submit Tiket Internal dan Survey - FINAL

## Masalah yang Ditemukan

### Error Log:
```
❌ Error loading app settings: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
📥 Response status: 200
📥 Response headers: text/html; charset=utf-8
❌ Non-JSON response: <!doctype html>...
❌ Error loading units: Error: Server mengembalikan response yang tidak valid
📤 Mengirim tiket internal: {...}
🌐 API Endpoint: /api/public/internal-tickets
POST https://kiss2.vercel.app/api/public/internal-tickets 405 (Method Not Allowed)
```

### Analisis Masalah:
1. **Endpoint mengembalikan HTML bukan JSON** - Server mengembalikan halaman HTML (<!doctype html>) bukan response JSON
2. **Error 405 Method Not Allowed** - Endpoint tidak menerima method POST
3. **Routing Vercel tidak bekerja** - Konfigurasi `routes` di vercel.json tidak tepat untuk Vercel v2

## Perbaikan yang Dilakukan

### 1. Perbaikan vercel.json
**File:** `vercel.json`

**Perubahan:**
- Mengganti `routes` dengan `rewrites` (sesuai Vercel v2 spec)
- Rewrites lebih tepat untuk API routing di Vercel

**Sebelum:**
```json
"routes": [
  {
    "src": "/api/public/internal-tickets",
    "dest": "/api/public/internal-tickets.ts"
  },
  ...
]
```

**Sesudah:**
```json
"rewrites": [
  {
    "source": "/api/public/internal-tickets",
    "destination": "/api/public/internal-tickets"
  },
  ...
]
```

### 2. Struktur File API yang Benar
Vercel secara otomatis mendeteksi file di folder `api/` sebagai serverless functions.

**Struktur:**
```
api/
  public/
    internal-tickets.ts  ✅ Akan menjadi /api/public/internal-tickets
    external-tickets.ts  ✅ Akan menjadi /api/public/external-tickets
    surveys.ts           ✅ Akan menjadi /api/public/surveys
    units.ts             ✅ Akan menjadi /api/public/units
    app-settings.ts      ✅ Akan menjadi /api/public/app-settings
```

### 3. Endpoint API Sudah Benar
File `api/public/internal-tickets.ts` sudah:
- ✅ Menangani OPTIONS request untuk CORS
- ✅ Hanya menerima POST method
- ✅ Mengembalikan JSON response
- ✅ Validasi unit_id dan field wajib
- ✅ Generate ticket number otomatis
- ✅ Sinkron dengan backend Express

### 4. Frontend Sudah Benar
File `DirectInternalTicketForm.tsx` sudah:
- ✅ Menggunakan relative path `/api/public/internal-tickets`
- ✅ Mengirim payload yang benar
- ✅ Menangani response JSON
- ✅ Error handling untuk non-JSON response

## Langkah Deploy ke Vercel

### 1. Commit Perubahan
```bash
git add vercel.json
git commit -m "fix: perbaiki routing API Vercel untuk submit tiket internal dan survey"
git push origin main
```

### 2. Vercel Akan Auto-Deploy
Setelah push, Vercel akan otomatis:
1. Detect perubahan di `vercel.json`
2. Build ulang dengan konfigurasi baru
3. Deploy serverless functions di folder `api/`

### 3. Verifikasi Deployment
Setelah deploy selesai, test endpoint:

```bash
# Test endpoint units
curl https://kiss2.vercel.app/api/public/units

# Test endpoint app-settings
curl https://kiss2.vercel.app/api/public/app-settings

# Test endpoint internal-tickets (POST)
curl -X POST https://kiss2.vercel.app/api/public/internal-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_name": "Test User",
    "reporter_email": "test@example.com",
    "reporter_phone": "08123456789",
    "reporter_department": "IT",
    "category": "it_support",
    "priority": "medium",
    "title": "Test Ticket",
    "description": "Test description",
    "unit_id": "YOUR_UNIT_ID_HERE"
  }'
```

## Environment Variables di Vercel

Pastikan environment variables sudah di-set di Vercel Dashboard:

### Required Variables:
1. `VITE_SUPABASE_URL` - URL Supabase project
2. `VITE_SUPABASE_ANON_KEY` - Anon key untuk public access
3. `VITE_SUPABASE_SERVICE_ROLE_KEY` - Service role key untuk admin operations

### Cara Set di Vercel:
1. Buka Vercel Dashboard
2. Pilih project `kiss2`
3. Settings → Environment Variables
4. Add variable untuk Production, Preview, dan Development

## Testing Setelah Deploy

### 1. Test Form Internal Ticket
```
URL: https://kiss2.vercel.app/form/internal?unit_id=xxx&unit_name=xxx
```

**Expected:**
- ✅ Form muncul tanpa sidebar
- ✅ Dropdown unit terisi dari API
- ✅ Submit berhasil dengan response JSON
- ✅ Nomor tiket ditampilkan

### 2. Test Form Survey
```
URL: https://kiss2.vercel.app/form/survey?unit_id=xxx&unit_name=xxx
```

**Expected:**
- ✅ Form survey muncul
- ✅ Submit berhasil
- ✅ Response JSON diterima

### 3. Test QR Code Redirect
```
URL: https://kiss2.vercel.app/qr/xxx
```

**Expected:**
- ✅ Redirect ke form yang sesuai
- ✅ Parameter unit_id dan unit_name terisi otomatis

## Troubleshooting

### Jika Masih Error 405:
1. Clear Vercel cache:
   ```bash
   vercel --prod --force
   ```

2. Periksa Vercel logs:
   - Buka Vercel Dashboard
   - Deployments → Latest → Function Logs
   - Cari error di `/api/public/internal-tickets`

### Jika Masih Return HTML:
1. Periksa routing di Vercel Dashboard:
   - Settings → Functions
   - Pastikan `api/public/*.ts` terdeteksi

2. Periksa build output:
   - Deployments → Build Logs
   - Cari "Serverless Functions" section
   - Pastikan API functions ter-list

### Jika Environment Variables Tidak Terbaca:
1. Redeploy dengan environment variables:
   ```bash
   vercel --prod
   ```

2. Atau trigger redeploy dari Vercel Dashboard:
   - Deployments → Latest → ... → Redeploy

## Kesimpulan

Perbaikan utama adalah mengganti `routes` dengan `rewrites` di `vercel.json`. Vercel v2 menggunakan `rewrites` untuk routing API, bukan `routes`.

Setelah deploy ulang, endpoint API akan:
- ✅ Mengembalikan JSON (bukan HTML)
- ✅ Menerima POST request (bukan 405)
- ✅ Berfungsi untuk submit tiket internal dan survey

## Status
- ✅ vercel.json diperbaiki
- ⏳ Menunggu deploy ke Vercel
- ⏳ Testing setelah deploy

## Next Steps
1. Commit dan push perubahan
2. Tunggu Vercel auto-deploy
3. Test semua endpoint API
4. Verifikasi submit tiket internal dan survey berhasil
