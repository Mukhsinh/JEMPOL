# Setup Environment Variables di Vercel - LENGKAP

## Masalah yang Diperbaiki
- ❌ Form inputan unit di Vercel tidak terintegrasi dengan master data
- ❌ Submit form gagal karena unit_id tidak terkirim
- ✅ Solusi: Konfigurasi environment variables yang benar di Vercel

## Environment Variables yang HARUS Diset di Vercel

Buka Vercel Dashboard → Project Settings → Environment Variables, lalu tambahkan:

### 1. Supabase Configuration (WAJIB)

```
VITE_SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
```

```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
```

```
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg
```

### 2. Frontend Configuration (OPSIONAL)

```
VITE_API_URL=https://your-vercel-app.vercel.app/api
```

```
VITE_FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Cara Set Environment Variables di Vercel

### Metode 1: Via Vercel Dashboard (RECOMMENDED)

1. Buka https://vercel.com/dashboard
2. Pilih project Anda
3. Klik **Settings** di menu atas
4. Klik **Environment Variables** di sidebar kiri
5. Untuk setiap variable:
   - Masukkan **Key** (contoh: `VITE_SUPABASE_URL`)
   - Masukkan **Value** (contoh: `https://jxxzbdivafzzwqhagwrf.supabase.co`)
   - Pilih **Environment**: Production, Preview, Development (pilih semua)
   - Klik **Save**

### Metode 2: Via Vercel CLI

```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login ke Vercel
vercel login

# Set environment variables
vercel env add VITE_SUPABASE_URL
# Paste value saat diminta: https://jxxzbdivafzzwqhagwrf.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste value saat diminta

vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY
# Paste value saat diminta
```

## Setelah Set Environment Variables

### 1. Redeploy Aplikasi

Environment variables baru hanya akan aktif setelah redeploy:

```bash
# Via CLI
vercel --prod

# Atau via Dashboard
# Klik "Deployments" → "Redeploy" pada deployment terakhir
```

### 2. Verifikasi Environment Variables

Setelah deploy, buka:
```
https://your-app.vercel.app/api/public/units
```

Response yang benar:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Unit Name",
      "code": "UNIT-CODE",
      "description": "Description",
      "is_active": true
    }
  ],
  "count": 10,
  "timestamp": "2025-01-22T..."
}
```

Response jika environment variables belum diset:
```json
{
  "success": false,
  "error": "Konfigurasi Supabase tidak lengkap di Vercel...",
  "data": [],
  "debug": {
    "hasUrl": false,
    "hasKey": false
  }
}
```

## Troubleshooting

### Problem 1: Units tidak muncul di dropdown

**Penyebab**: Environment variables belum diset atau belum redeploy

**Solusi**:
1. Cek environment variables di Vercel Dashboard
2. Pastikan semua 3 variables (URL, ANON_KEY, SERVICE_ROLE_KEY) sudah diset
3. Redeploy aplikasi
4. Clear browser cache dan refresh

### Problem 2: Submit form gagal dengan error "Unit ID harus diisi"

**Penyebab**: Dropdown unit kosong karena API tidak mengembalikan data

**Solusi**:
1. Buka browser console (F12)
2. Lihat error di Network tab saat load form
3. Cek response dari `/api/public/units`
4. Jika response error, cek environment variables di Vercel

### Problem 3: Error "Konfigurasi server tidak lengkap"

**Penyebab**: Environment variables tidak tersedia di Vercel Functions

**Solusi**:
1. Pastikan environment variables diset untuk **Production** environment
2. Redeploy aplikasi (environment variables hanya aktif setelah redeploy)
3. Tunggu 1-2 menit setelah redeploy untuk propagasi

## Checklist Sebelum Deploy

- [ ] Set `VITE_SUPABASE_URL` di Vercel
- [ ] Set `VITE_SUPABASE_ANON_KEY` di Vercel
- [ ] Set `VITE_SUPABASE_SERVICE_ROLE_KEY` di Vercel
- [ ] Pilih environment: Production, Preview, Development
- [ ] Redeploy aplikasi
- [ ] Test `/api/public/units` endpoint
- [ ] Test form internal ticket di browser
- [ ] Verify dropdown unit terisi
- [ ] Test submit form

## File yang Sudah Diperbaiki

1. ✅ `api/public/units.ts` - Enhanced error handling dan logging
2. ✅ `api/public/internal-tickets.ts` - Validasi unit_id yang lebih baik
3. ✅ `frontend/src/pages/public/DirectInternalTicketForm.tsx` - Fetch units dengan fallback
4. ✅ `frontend/src/pages/tickets/CreateInternalTicket.tsx` - Integrasi master data units

## Kontak Support

Jika masih ada masalah setelah mengikuti panduan ini:
1. Screenshot error di browser console
2. Screenshot response dari `/api/public/units`
3. Screenshot environment variables di Vercel (sensor sensitive data)
4. Hubungi tim development

---

**Catatan Penting**: 
- Environment variables dengan prefix `VITE_` akan di-embed ke frontend build
- Jangan expose service role key di frontend code
- Gunakan anon key untuk operasi public
- Service role key hanya untuk Vercel Functions (API routes)
