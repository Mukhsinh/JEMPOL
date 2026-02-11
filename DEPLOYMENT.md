# Panduan Deploy ke Vercel

## Persiapan

### 1. Install Vercel CLI (Opsional)
```bash
npm install -g vercel
```

### 2. Pastikan Semua Dependencies Terinstall
```bash
npm install
cd frontend && npm install
```

### 3. Test Build Lokal
```bash
cd frontend
npm run build
```

## Deploy ke Vercel

### Opsi 1: Deploy via Vercel Dashboard (Recommended)

1. Login ke [Vercel Dashboard](https://vercel.com)
2. Klik "Add New Project"
3. Import repository Git Anda
4. Vercel akan otomatis detect konfigurasi dari `vercel.json`
5. Set Environment Variables (lihat bagian Environment Variables di bawah)
6. Klik "Deploy"

### Opsi 2: Deploy via CLI

```bash
# Login ke Vercel
vercel login

# Deploy ke production
vercel --prod
```

## Environment Variables di Vercel

Buka Vercel Dashboard > Project Settings > Environment Variables, lalu tambahkan:

### Frontend Variables (dengan prefix VITE_)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=/api
```

### Backend API Variables (tanpa prefix VITE_)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
```

**PENTING:** 
- Set semua variables untuk environment "Production"
- Jangan commit file `.env.production` dengan credentials asli ke Git
- Gunakan Supabase Service Role Key untuk backend API

## Struktur Deployment

```
Vercel Deployment
├── Frontend (React SPA)
│   └── Output: frontend/dist/
│   └── Routes: /, /login, /dashboard, dll
│
└── Backend (Serverless Functions)
    └── Location: api/public/*.ts
    └── Routes: /api/public/*
```

## Verifikasi Deployment

### 1. Test API Endpoints
```bash
# Health check
curl https://your-app.vercel.app/api/public/health

# Get units
curl https://your-app.vercel.app/api/public/units

# Get app settings
curl https://your-app.vercel.app/api/public/app-settings
```

### 2. Test Frontend
- Buka https://your-app.vercel.app
- Login dengan akun admin
- Test semua fitur utama

### 3. Test Public Forms
- https://your-app.vercel.app/form/internal
- https://your-app.vercel.app/form/eksternal
- https://your-app.vercel.app/form/survey

## Troubleshooting

### Error: "Missing Supabase credentials"
- Pastikan environment variables sudah di-set di Vercel Dashboard
- Gunakan prefix `VITE_` untuk frontend dan tanpa prefix untuk backend

### Error: "Cannot find module '@vercel/node'"
- Pastikan `@vercel/node` ada di `package.json` root
- Run `npm install` di root project

### Build Error
- Check logs di Vercel Dashboard
- Pastikan semua dependencies terinstall
- Test build lokal: `cd frontend && npm run build`

### API Not Working
- Check Vercel Function Logs
- Pastikan environment variables sudah benar
- Test dengan curl atau Postman

## Update Deployment

### Auto Deploy (Recommended)
- Push ke branch `main` atau `master`
- Vercel akan otomatis deploy

### Manual Deploy
```bash
vercel --prod
```

## Rollback

Jika ada masalah, rollback ke deployment sebelumnya:
1. Buka Vercel Dashboard
2. Pilih Deployments
3. Pilih deployment yang stabil
4. Klik "Promote to Production"

## Monitoring

- Logs: Vercel Dashboard > Deployments > View Function Logs
- Analytics: Vercel Dashboard > Analytics
- Performance: Vercel Dashboard > Speed Insights

## Security Checklist

- [ ] Environment variables tidak di-commit ke Git
- [ ] `.env.production` ada di `.gitignore`
- [ ] Supabase RLS (Row Level Security) sudah aktif
- [ ] CORS headers sudah di-set dengan benar
- [ ] Service Role Key hanya digunakan di backend
- [ ] Anon Key digunakan di frontend

## Support

Jika ada masalah:
1. Check Vercel Function Logs
2. Check Supabase Logs
3. Check browser console untuk error frontend
4. Hubungi tim development
