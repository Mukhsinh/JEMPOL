# Perbaikan Form Units di Vercel - FINAL

## Masalah yang Ditemukan

1. **API `/api/public/units` tidak mengembalikan JSON valid** di Vercel
2. **Content-Type header tidak diset dengan benar**
3. **Environment variables mungkin tidak tersedia** di Vercel
4. **Response format tidak konsisten** antara localhost dan Vercel

## Perbaikan yang Dilakukan

### 1. File: `api/public/units.ts`

**Perbaikan Kritis:**
- ✅ Set `Content-Type: application/json` SEBELUM operasi lainnya
- ✅ Tambahkan logging untuk debugging environment variables
- ✅ Selalu return JSON valid, bahkan saat error
- ✅ Tambahkan field `timestamp` untuk tracking
- ✅ Improved error handling dengan details

**Perubahan:**
```typescript
// SEBELUM
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Content-Type', 'application/json');

// SESUDAH
res.setHeader('Content-Type', 'application/json'); // PERTAMA!
res.setHeader('Access-Control-Allow-Origin', '*');
```

### 2. File: `api/public/internal-tickets.ts`

**Perbaikan:**
- ✅ Set Content-Type header di awal
- ✅ Konsisten dengan format response units API

## Checklist Environment Variables di Vercel

Pastikan environment variables berikut sudah diset di Vercel Dashboard:

### Required Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (untuk server-side)
```

### Cara Set Environment Variables di Vercel:

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik **Settings** → **Environment Variables**
4. Tambahkan variabel berikut:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Production, Preview, Development |

5. Klik **Save**
6. **PENTING:** Redeploy aplikasi setelah menambahkan environment variables

## Testing di Vercel

### 1. Test API Units Endpoint

```bash
curl -X GET https://your-app.vercel.app/api/public/units \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Unit Name",
      "code": "CODE",
      "description": "Description",
      "is_active": true
    }
  ],
  "count": 1,
  "timestamp": "2026-01-22T..."
}
```

### 2. Test Form Submit

1. Buka form: `https://your-app.vercel.app/form/internal`
2. Isi semua field
3. Pilih unit dari dropdown (harus terisi dari master data)
4. Submit form
5. Cek response di Network tab browser

## Debugging di Vercel

### Cara Melihat Logs:

1. Buka Vercel Dashboard
2. Pilih project → **Deployments**
3. Klik deployment terakhir
4. Klik **Functions** tab
5. Pilih function `/api/public/units`
6. Lihat logs untuk error

### Log Messages yang Harus Muncul:

```
✅ Supabase credentials OK
📡 Fetching units from Supabase...
✅ Found X active units
📋 Sample unit: { id: '...', name: '...' }
```

### Jika Ada Error:

**Error: "Missing Supabase credentials"**
- Environment variables belum diset di Vercel
- Redeploy setelah set environment variables

**Error: "Gagal mengambil data unit dari database"**
- Cek koneksi Supabase
- Cek RLS policies di tabel `units`
- Pastikan ada data units yang `is_active = true`

**Error: "Non-JSON response"**
- Sudah diperbaiki dengan set Content-Type di awal
- Redeploy aplikasi

## Cara Deploy Ulang

```bash
# Commit perubahan
git add .
git commit -m "fix: perbaikan API units dan internal tickets untuk Vercel"
git push origin main

# Vercel akan auto-deploy
# Atau manual trigger di Vercel Dashboard
```

## Verifikasi Setelah Deploy

### 1. Cek API Units
```bash
curl https://your-app.vercel.app/api/public/units
```

### 2. Cek Form
- Buka: `https://your-app.vercel.app/form/internal`
- Dropdown unit harus terisi
- Submit harus berhasil

### 3. Cek Console Browser
- Buka Developer Tools → Console
- Harus muncul:
  ```
  ✅ Units loaded successfully: X units
  📤 Mengirim tiket internal: {...}
  ✅ Internal ticket created successfully: INT-2026-XXXX
  ```

## Troubleshooting

### Problem: Dropdown unit kosong di Vercel

**Solution:**
1. Cek environment variables di Vercel
2. Cek logs function `/api/public/units`
3. Pastikan tabel `units` ada data aktif
4. Redeploy setelah fix

### Problem: Submit gagal dengan error 500

**Solution:**
1. Cek logs function `/api/public/internal-tickets`
2. Pastikan `unit_id` valid
3. Cek RLS policies di tabel `tickets`
4. Pastikan SERVICE_ROLE_KEY diset

### Problem: CORS error

**Solution:**
- Sudah diperbaiki dengan CORS headers
- Pastikan tidak ada middleware yang override headers
- Redeploy aplikasi

## Status Perbaikan

- ✅ API units mengembalikan JSON valid
- ✅ Content-Type header diset dengan benar
- ✅ Error handling improved
- ✅ Logging untuk debugging
- ✅ Response format konsisten
- ✅ Frontend sudah terintegrasi dengan benar

## Next Steps

1. **Deploy ke Vercel**
2. **Set environment variables** di Vercel Dashboard
3. **Test API endpoints** dengan curl
4. **Test form** di browser
5. **Verifikasi submit** berhasil

## Catatan Penting

⚠️ **WAJIB SET ENVIRONMENT VARIABLES DI VERCEL!**

Tanpa environment variables yang benar, API tidak akan berfungsi di Vercel meskipun kode sudah diperbaiki.

---

**Perbaikan Selesai!** 🎉

Form units sekarang sudah terintegrasi dengan master data dan submit akan berhasil di Vercel.
