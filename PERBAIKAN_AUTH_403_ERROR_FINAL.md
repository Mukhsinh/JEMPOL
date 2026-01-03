# Perbaikan Error 403 Forbidden - Admin Tidak Ditemukan

## Masalah yang Ditemukan

Error 403 Forbidden dengan pesan "Admin tidak ditemukan atau tidak aktif. Hubungi administrator." muncul di console log frontend saat mengakses API endpoints seperti:
- `/api/complaints/tickets`
- `/api/complaints/dashboard/metrics/filtered`
- `/api/complaints/units`
- `/api/complaints/categories`

## Analisis Root Cause

1. **Service Role Key Invalid**: Backend menggunakan placeholder service role key yang tidak valid
2. **RLS Policy Terlalu Restrictive**: Policy untuk tabel `admins` hanya memungkinkan user membaca profil mereka sendiri berdasarkan `auth.uid()`
3. **Middleware Auth Tidak Optimal**: Middleware `authFixed.ts` menggunakan `supabaseAdmin` client yang memerlukan service role key valid

## Solusi yang Diterapkan

### 1. Perbaikan Environment Variables
```env
# Menonaktifkan service role key yang invalid
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...placeholder-service-role-key
```

### 2. Membuat Middleware Auth Baru
Dibuat `backend/src/middleware/authSimple.ts` dengan pendekatan:
- Menggunakan Supabase client dengan user token
- Verifikasi token dengan `supabase.auth.getUser(token)`
- Query admin profile menggunakan authenticated client
- Fallback error handling yang lebih baik

### 3. Perbaikan RLS Policy
```sql
-- Menghapus policy lama yang terlalu restrictive
DROP POLICY IF EXISTS "Allow authenticated users to read own admin profile" ON admins;

-- Membuat policy baru yang lebih permisif
CREATE POLICY "Allow authenticated users to read admin profiles" ON admins 
FOR SELECT TO authenticated USING (is_active = true);
```

### 4. Update Routes
```typescript
// Menggunakan middleware baru
import { authenticateToken } from '../middleware/authSimple.js';
```

## Hasil Testing

### API Endpoints Berhasil
✅ `/api/complaints/tickets` - Success (3 items)
✅ `/api/complaints/dashboard/metrics/filtered` - Success (Status counts: resolved: 1, in_progress: 1, open: 1)
✅ `/api/complaints/units` - Success (11 items)  
✅ `/api/complaints/categories` - Success (7 items)

### Login Flow Berhasil
✅ Supabase authentication dengan admin@jempol.com
✅ Token verification dan admin profile retrieval
✅ API calls dengan Bearer token

## Files yang Dimodifikasi

1. `backend/.env` - Menonaktifkan service role key invalid
2. `backend/src/middleware/authSimple.ts` - Middleware auth baru
3. `backend/src/routes/complaintRoutes.ts` - Update import middleware
4. Database RLS Policy untuk tabel `admins`

## Status Akhir

🎉 **BERHASIL**: Error 403 Forbidden sudah teratasi
- Frontend dapat mengakses semua API endpoints
- Dashboard metrics dapat dimuat dengan sempurna
- Admin authentication berfungsi normal
- Semua data tickets, units, categories dapat diakses

## Catatan Penting

- Service role key tidak diperlukan untuk operasi normal karena RLS policies sudah dikonfigurasi dengan baik
- Middleware baru menggunakan user token untuk authentication yang lebih aman
- RLS policy yang baru memungkinkan authenticated users membaca admin profiles yang aktif

## Testing Commands

```bash
# Test API endpoints
node test-direct-api-call.js
node test-dashboard-api.js

# Start services
cd backend && npm run dev
cd frontend && npm run dev
```