# KISS - Keluhan Informasi Saran Sistem

Sistem Manajemen Keluhan dan Survei Kepuasan Pelanggan

## Struktur Proyek

```
JEMPOL/
├── kiss/             # Aplikasi React utama
├── api/              # Vercel Serverless Functions
│   └── public/       # API endpoints publik
│       ├── track-ticket.ts
│       ├── app-settings.ts
│       ├── surveys.ts
│       ├── external-tickets.ts
│       ├── internal-tickets.ts
│       └── units.ts
├── .git/             # Version control
├── .kiro/            # Konfigurasi Kiro
├── vercel.json       # Konfigurasi Vercel
├── package.json      # Dependencies root
└── .env.production   # Environment variables
```

## Teknologi

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (Database + Auth)
- **Deployment**: Vercel (Serverless Functions)
- **State Management**: React Context API

## Instalasi

1. Install dependencies root:
```bash
npm install
```

2. Install dependencies kiss:
```bash
cd kiss
npm install
```

3. Setup environment variables di `.env.production`

## Development

```bash
cd kiss
npm run dev
```

## Build

```bash
cd kiss
npm run build
```

## Deploy ke Vercel

```bash
vercel --prod
```

## Fitur Utama

- Dashboard Admin
- Manajemen Tiket Internal & Eksternal
- QR Code untuk Form Publik
- Survei Kepuasan (IKM)
- Tracking Tiket Real-time
- Manajemen User & Roles
- Laporan & Export PDF/Excel
- Notifikasi Real-time
- SLA Management
- Eskalasi Otomatis

## Database

Menggunakan Supabase dengan tabel:
- users
- tickets (internal & external)
- surveys
- units
- patient_types
- ticket_classifications
- service_categories
- sla_settings
- response_templates
- escalation_rules
- qr_codes

## API Endpoints

Semua API ada di folder `api/public/`:
- `/api/public/track-ticket` - Tracking tiket publik
- `/api/public/app-settings` - Pengaturan aplikasi
- `/api/public/surveys` - Submit survei
- `/api/public/external-tickets` - Tiket eksternal
- `/api/public/internal-tickets` - Tiket internal
- `/api/public/units` - Data unit kerja
