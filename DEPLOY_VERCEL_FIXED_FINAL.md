# Deploy Vercel - Masalah Output Directory Diperbaiki

## Masalah yang Diperbaiki

Error yang muncul:
```
Error: No Output Directory named "dist" found after the Build completed.
```

## Penyebab Masalah

1. **Build Command Salah**: `npm run vercel-build` berjalan dari root directory tetapi mencari output di `frontend/dist`
2. **Chunk Size Warning**: Bundle JavaScript terlalu besar (1MB+)
3. **Output Directory Mismatch**: Vercel mencari di path yang salah

## Solusi yang Diterapkan

### 1. Perbaikan vercel.json
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

### 2. Optimasi Vite Config
- Menambahkan `chunkSizeWarningLimit: 1000`
- Implementasi manual chunks untuk memecah bundle:
  - vendor (React, React DOM)
  - router (React Router)
  - ui (Lucide React)
  - game (Phaser)
  - http (Axios)
  - supabase (Supabase client)
  - socket (Socket.io)

## Cara Deploy Sekarang

1. **Commit perubahan**:
```bash
git add .
git commit -m "fix: perbaiki konfigurasi deploy vercel dan optimasi bundle"
git push origin main
```

2. **Deploy otomatis** akan berjalan di Vercel

## Verifikasi Deploy

Setelah deploy berhasil, cek:
- ✅ Build berhasil tanpa error
- ✅ Chunk size dalam batas wajar
- ✅ Aplikasi dapat diakses
- ✅ API endpoints berfungsi

## File yang Diubah

1. `vercel.json` - Perbaikan build command dan output directory
2. `frontend/vite.config.ts` - Optimasi bundle splitting

Deploy sekarang sudah siap dan masalah output directory sudah teratasi!