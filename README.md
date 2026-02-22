# KISS - Keluhan Informasi Saran Sistem

Sistem Manajemen Keluhan dan Survei Kepuasan Pelanggan

## Quick Start

### Development
```bash
# Install dependencies
npm run install:all

# Run development server
npm run dev
```

### Build Production
```bash
npm run build
```

### Deploy ke Vercel

#### Persiapan
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`

#### Deploy
```bash
# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy
```

## Environment Variables

Set di Vercel Dashboard → Settings → Environment Variables:

### Frontend (VITE_*)
```
VITE_SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=/api
```

### Backend (API)
```
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
```

## Struktur Proyek

```
/
├── api/              # Vercel Serverless Functions
│   ├── lib/          # Handlers, middleware, utils
│   └── index.ts      # Unified API handler
├── kiss/             # React Frontend
│   ├── src/          # Source code
│   └── dist/         # Build output
├── vercel.json       # Vercel configuration
└── package.json      # Root package.json
```

## Teknologi

- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: Supabase + Vercel Serverless Functions
- Deployment: Vercel
