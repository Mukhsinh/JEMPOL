# Perbaikan Referensi Localhost untuk Vercel

## Masalah
Aplikasi di Vercel masih merujuk ke localhost:3004 sehingga form tiket internal dan survey gagal submit.

## Perbaikan yang Dilakukan

### 1. File Environment Production
- ✅ Dibuat `frontend/.env.production` dengan `VITE_API_URL=/api`
- ✅ Ini memastikan di production menggunakan relative path `/api` yang akan di-route ke Vercel serverless functions

### 2. File `frontend/src/services/api.ts`
- ✅ Diperbaiki fungsi `getApiBaseUrl()` untuk selalu menggunakan `/api` di production
- ✅ Menambahkan console.log untuk debugging environment

### 3. File Form Components
- ✅ `frontend/src/pages/public/DirectSurveyForm.tsx` - Menghapus hardcoded localhost
- ✅ `frontend/src/pages/public/DirectInternalTicketForm.tsx` - Menghapus hardcoded localhost  
- ✅ `frontend/src/pages/public/TrackTicket.tsx` - Menggunakan VITE_API_URL atau fallback ke `/api`

## Cara Deploy ke Vercel

1. Commit semua perubahan:
```bash
git add .
git commit -m "fix: Hapus referensi localhost untuk Vercel production"
git push
```

2. Vercel akan otomatis deploy ulang

3. Pastikan environment variables di Vercel sudah diset:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY` (optional)

## Testing

Setelah deploy, test:
1. Form tiket internal: https://jempol-frontend.vercel.app/m/internal
2. Form survey: https://jempol-frontend.vercel.app/m/survey
3. Form tiket eksternal: https://jempol-frontend.vercel.app/m/external

## Endpoint yang Digunakan

Di production Vercel:
- `/api/public/internal-tickets` → `api/public/internal-tickets.ts`
- `/api/public/surveys` → `api/public/surveys.ts`
- `/api/public/external-tickets` → `api/public/external-tickets.ts`
- `/api/public/units` → `api/public/units.ts`

Semua endpoint ini adalah Vercel serverless functions yang langsung connect ke Supabase.
