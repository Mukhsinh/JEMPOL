# Perbaikan Error Form Submit di Vercel

## Masalah yang Diperbaiki

1. **Error 405 (Method Not Allowed)** - Endpoint API tidak ditemukan
2. **"Unexpected end of JSON input"** - Server tidak mengembalikan JSON yang valid
3. Form tiket internal tidak bisa submit
4. Form survey tidak bisa submit

## Penyebab Masalah

File API serverless untuk Vercel tidak lengkap. Beberapa endpoint yang dibutuhkan oleh form tidak ada:
- `/api/public/internal-tickets` - untuk submit tiket internal
- `/api/public/units` - untuk mengambil daftar unit
- `/api/public/app-settings` - untuk mengambil pengaturan aplikasi

## Solusi yang Diterapkan

### 1. Membuat File API yang Hilang

#### a. `/api/public/internal-tickets.ts`
- Endpoint untuk submit tiket internal
- Method: POST
- Validasi: unit_id, reporter_name, reporter_email, title, description
- Generate nomor tiket otomatis (INT-YYYY-XXXX)
- Support QR code tracking
- Update usage count QR code

#### b. `/api/public/units.ts`
- Endpoint untuk mengambil daftar unit aktif
- Method: GET
- Return: Array unit dengan id, name, code, description

#### c. `/api/public/app-settings.ts`
- Endpoint untuk mengambil pengaturan aplikasi
- Method: GET
- Return: institution_name, address, contact, dll untuk footer

### 2. File yang Sudah Ada (Tidak Diubah)

- `/api/public/external-tickets.ts` - sudah benar
- `/api/public/surveys.ts` - sudah benar

## Struktur API Vercel

```
api/
└── public/
    ├── app-settings.ts       ✅ BARU
    ├── external-tickets.ts   ✅ SUDAH ADA
    ├── internal-tickets.ts   ✅ BARU
    ├── surveys.ts            ✅ SUDAH ADA
    └── units.ts              ✅ BARU
```

## Cara Test

### 1. Test Lokal (Sebelum Deploy)
```bash
# Jalankan file test
TEST_VERCEL_ENDPOINTS.bat
```

### 2. Test di Vercel (Setelah Deploy)
1. Buka: `https://your-app.vercel.app/test-vercel-endpoints.html`
2. Test endpoint satu per satu:
   - Test Get Units (untuk dapat unit_id)
   - Test Get App Settings
   - Test Submit Internal Ticket
   - Test Submit Survey
   - Test Submit External Ticket

## Environment Variables yang Dibutuhkan di Vercel

Pastikan sudah set di Vercel Dashboard:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

## Endpoint API yang Tersedia

### GET Endpoints
- `GET /api/public/units` - Daftar unit aktif
- `GET /api/public/app-settings` - Pengaturan aplikasi

### POST Endpoints
- `POST /api/public/internal-tickets` - Submit tiket internal
- `POST /api/public/external-tickets` - Submit tiket eksternal/pengaduan
- `POST /api/public/surveys` - Submit survey kepuasan

## Format Request

### Internal Ticket
```json
{
  "unit_id": "uuid",
  "reporter_name": "string",
  "reporter_email": "string",
  "reporter_phone": "string",
  "reporter_department": "string",
  "reporter_position": "string",
  "category": "string",
  "priority": "low|medium|high|critical",
  "title": "string",
  "description": "string",
  "qr_code": "string (optional)",
  "source": "web|qr_code|mobile"
}
```

### Survey
```json
{
  "unit_id": "uuid",
  "visitor_name": "string (optional)",
  "visitor_phone": "string (required)",
  "is_anonymous": boolean,
  "age_range": "string",
  "gender": "male|female",
  "service_type": "string",
  "u1_ind1_score": 1-5,
  "u1_ind2_score": 1-5,
  ...
  "overall_score": 1-5,
  "comments": "string",
  "qr_code": "string (optional)",
  "source": "public_survey|qr_code"
}
```

## Status Perbaikan

✅ File API internal-tickets.ts dibuat
✅ File API units.ts dibuat  
✅ File API app-settings.ts dibuat
✅ File test HTML dibuat
✅ CORS headers sudah dikonfigurasi
✅ Error handling sudah ditambahkan
✅ Validasi input sudah lengkap

## Langkah Deploy ke Vercel

1. Commit semua perubahan:
```bash
git add api/public/*.ts
git commit -m "fix: tambah endpoint API yang hilang untuk form submit"
git push
```

2. Vercel akan auto-deploy

3. Test menggunakan file test-vercel-endpoints.html

## Catatan Penting

- Semua endpoint sudah support CORS
- Semua endpoint sudah handle OPTIONS request
- Validasi input sudah lengkap
- Error message sudah informatif
- Support QR code tracking
- Auto-generate ticket number
- Update QR code usage count

## Troubleshooting

### Jika masih error 405:
- Pastikan file API sudah ter-deploy di Vercel
- Cek Vercel Functions logs
- Pastikan method HTTP benar (GET/POST)

### Jika error "Unexpected end of JSON":
- Cek Vercel logs untuk error detail
- Pastikan environment variables sudah set
- Pastikan Supabase credentials valid

### Jika error 400 (Bad Request):
- Cek format request body
- Pastikan unit_id valid dan aktif
- Pastikan field required sudah diisi
