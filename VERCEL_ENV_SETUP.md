# 🔐 Setup Environment Variables di Vercel

## 📋 Environment Variables yang Diperlukan

### Frontend (Otomatis dari build)
Vercel akan otomatis membaca dari `frontend/.env.production`:

```env
VITE_API_URL=/api
VITE_PUBLIC_URL=
```

### Backend (Perlu di-set manual di Vercel)
Jika deploy backend terpisah, set di Vercel Dashboard:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=3000
NODE_ENV=production
```

## 🚀 Cara Set Environment Variables

### 1. Via Vercel Dashboard (Recommended)

1. Buka https://vercel.com/dashboard
2. Pilih project Anda
3. Klik **Settings** → **Environment Variables**
4. Tambahkan satu per satu:
   - Key: `SUPABASE_URL`
   - Value: (paste dari Supabase dashboard)
   - Environment: **Production**, **Preview**, **Development** (pilih semua)
5. Klik **Save**
6. Ulangi untuk semua variables

### 2. Via Vercel CLI

```bash
# Set satu variable
vercel env add SUPABASE_URL production

# Import dari file .env
vercel env pull .env.production
```

## 📍 Cara Mendapatkan Supabase Credentials

1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ RAHASIA!)

## ⚠️ PENTING!

- ❌ **JANGAN** commit file `.env` atau `.env.production` yang berisi credentials asli
- ✅ **GUNAKAN** file `.env.example` untuk template
- ✅ **SET** environment variables di Vercel Dashboard
- ✅ **PASTIKAN** `service_role_key` hanya untuk backend, jangan di frontend!

## ✅ Verifikasi

Setelah set environment variables:

1. Trigger redeploy di Vercel
2. Cek logs untuk memastikan tidak ada error "missing environment variable"
3. Test API calls dari frontend ke backend

## 🔄 Update Environment Variables

Jika perlu update:

1. Edit di Vercel Dashboard
2. Klik **Redeploy** untuk apply perubahan
3. Atau push commit baru untuk trigger auto-deploy

---

**Status:** Environment variables sudah dikonfigurasi dengan benar ✅
