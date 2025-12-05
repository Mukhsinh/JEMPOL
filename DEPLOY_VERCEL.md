# 🚀 Deploy ke Vercel - JEMPOL

## 📋 Persiapan Sebelum Deploy

### 1. ✅ Responsive Mobile - DONE
- Modal viewer responsive (padding, font size)
- PDF iframe height disesuaikan untuk mobile (60vh min 400px)
- Video dan photo max-height disesuaikan
- No horizontal overflow
- Touch-friendly spacing

### 2. ✅ Files Konfigurasi - DONE
- `vercel.json` - Konfigurasi routing dan build
- `.vercelignore` - Files yang diabaikan saat deploy
- `frontend/.env.production` - Environment variables production

### 3. ✅ Build Scripts - DONE
- Frontend: `vercel-build` script added
- Backend: Ready untuk serverless functions

## 🔧 Cara Deploy ke Vercel

### Opsi 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login ke Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# Deploy ke preview
vercel

# Deploy ke production
vercel --prod
```

### Opsi 2: Deploy via Vercel Dashboard

#### Step 1: Push ke GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### Step 2: Import di Vercel
1. Buka https://vercel.com/new
2. Import repository GitHub
3. Pilih repository JEMPOL
4. Klik "Import"

#### Step 3: Configure Project
**Framework Preset**: Other

**Root Directory**: `./`

**Build Command**: 
```bash
cd frontend && npm install && npm run build
```

**Output Directory**: 
```
frontend/dist
```

**Install Command**:
```bash
npm install
```

#### Step 4: Environment Variables
Tambahkan di Vercel Dashboard → Settings → Environment Variables:

**Frontend Variables**:
```
VITE_API_URL=https://your-project.vercel.app/api
VITE_PUBLIC_URL=https://your-project.vercel.app
```

**Backend Variables**:
```
NODE_ENV=production
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://your-project.vercel.app
```

#### Step 5: Deploy
Klik "Deploy" dan tunggu proses selesai.

## 📱 Mobile Responsive Checklist

### ✅ Layout
- [x] No horizontal scroll
- [x] Proper padding (p-2 sm:p-4)
- [x] Responsive font sizes (text-sm sm:text-base)
- [x] Touch-friendly buttons (min 44x44px)
- [x] Proper spacing (gap-2 sm:gap-4)

### ✅ Components
- [x] Header - Responsive menu
- [x] Hero Section - Responsive text & buttons
- [x] Registration Form - Mobile-friendly inputs
- [x] Innovation Cards - Grid responsive
- [x] Innovation Viewer - Modal responsive
- [x] PDF Viewer - Height adjusted for mobile
- [x] Video Player - Responsive controls
- [x] Photo Gallery - Grid responsive
- [x] Game Canvas - Responsive sizing
- [x] Footer - Stacked on mobile

### ✅ PDF Viewer Mobile
```tsx
// Desktop: 80vh, min 700px
// Mobile: 60vh, min 400px
style={{ height: '60vh', minHeight: '400px' }}
```

### ✅ Modal Mobile
```tsx
// Padding: p-2 sm:p-4
// Margin: my-4 sm:my-8
// Rounded: rounded-xl sm:rounded-2xl
// Font: text-lg sm:text-2xl
```

## 🔍 Testing Sebelum Deploy

### 1. Test Build Lokal
```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
npm run build
npm start
```

### 2. Test Responsive
```bash
# Buka di browser
http://localhost:4173

# Test di DevTools
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- Desktop (1920x1080)
```

### 3. Test Features
- [ ] Registration form submit
- [ ] PDF viewer open & close
- [ ] Video player
- [ ] Photo gallery
- [ ] Game play
- [ ] Admin login
- [ ] File upload

## 📊 Vercel Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.ts"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "/backend/uploads/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

## 🗄️ Database (Supabase)

### Already Configured
- ✅ Tables: admins, visitors, innovations, game_scores
- ✅ RLS policies enabled
- ✅ Storage for uploads (if needed)
- ✅ API keys configured

### No Changes Needed
Database sudah di Supabase, tidak perlu migrasi.

## 📁 File Structure untuk Deploy

```
JEMPOL/
├── frontend/
│   ├── dist/              # Build output (generated)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.production
├── backend/
│   ├── src/
│   ├── uploads/           # Will use Vercel Blob Storage
│   └── package.json
├── vercel.json            # Vercel config
├── .vercelignore          # Ignore files
└── package.json           # Root package.json
```

## ⚠️ Important Notes

### 1. File Uploads
Vercel serverless functions are stateless. For file uploads:
- **Option A**: Use Supabase Storage
- **Option B**: Use Vercel Blob Storage
- **Option C**: Use AWS S3 / Cloudinary

### 2. Environment Variables
Update `.env.production` dengan URL production setelah deploy:
```
VITE_API_URL=https://jempol-production.vercel.app/api
```

### 3. CORS
Backend sudah configured untuk allow CORS dari frontend URL.

### 4. Database
Supabase sudah production-ready, tidak perlu perubahan.

## 🎯 Post-Deploy Checklist

- [ ] Vercel deploy success
- [ ] Frontend accessible
- [ ] API endpoints working
- [ ] Database connection OK
- [ ] File uploads working
- [ ] PDF viewer working
- [ ] Video player working
- [ ] Mobile responsive
- [ ] No console errors
- [ ] SSL certificate active

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Supabase Dashboard: https://supabase.com/dashboard
- Project Repo: [Your GitHub URL]

## 📞 Support

Jika ada masalah saat deploy:
1. Check Vercel deployment logs
2. Check browser console errors
3. Check Supabase logs
4. Verify environment variables

---

**Status**: ✅ READY TO DEPLOY
**Date**: 2025-12-05
**Mobile**: ✅ Responsive & No Overflow
