# KISS - Keluhan Informasi Saran Sistem

Sistem Manajemen Keluhan dan Survei Kepuasan Pelanggan

## Quick Start

### Development
```bash
cd kiss
npm install --legacy-peer-deps
npm run dev
```

### Build Production
```bash
cd kiss
npm run build
```

### Deploy ke Vercel
```bash
vercel --prod
```

## Environment Variables (Vercel Dashboard)

Set di Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_API_URL=/api
NODE_ENV=production
```

## Struktur Proyek

```
/
├── api/              # Vercel Serverless Functions
│   └── public/       # Public API endpoints
├── kiss/             # React Frontend
│   ├── src/          # Source code
│   └── dist/         # Build output (auto-generated)
├── vercel.json       # Vercel configuration
└── package.json      # Root package.json
```

## Teknologi

- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: Supabase + Vercel Serverless Functions
- Deployment: Vercel
