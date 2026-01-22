# Perbaikan Tiket dan Survey Unit Jlamprang

## Masalah yang Ditemukan

### 1. Tiket Eksternal
- ✅ Endpoint `/api/public/external-tickets` sudah ada
- ✅ Mapping `service_type` sudah benar:
  - `complaint` → `complaint`
  - `request` → `information`
  - `suggestion` → `suggestion`
  - `survey` → `satisfaction`
- ✅ Validasi unit_id sudah ada
- ✅ Integrasi dengan tabel `tickets` sudah benar

### 2. Survey Kepuasan
- ❌ **MASALAH**: Tidak ada endpoint untuk submit survey publik
- ✅ **DIPERBAIKI**: Ditambahkan endpoint `POST /api/public/surveys`

### 3. Unit Jlamprang
- ✅ Unit sudah ada di database dengan ID: `7bac7321-86e2-4dce-936d-2adde223c314`
- ✅ QR Code sudah ada dengan `redirect_type` = `external_ticket`
- ✅ Unit aktif dan siap digunakan

## Perbaikan yang Dilakukan

### 1. Endpoint Survey Publik Baru
**File**: `backend/src/routes/publicRoutes.ts`

Ditambahkan endpoint:
```
POST /api/public/surveys
```

Endpoint ini menerima:
- `unit_id` (wajib)
- `visitor_phone` (wajib)
- `visitor_name`, `visitor_email` (opsional, kecuali anonymous)
- `is_anonymous` (boolean)
- `service_type`, `age_range`, `gender`, dll
- `q1_score` sampai `q8_score` (skor 1-5)
- `u1_ind1_score` sampai `u9_ind3_score` (indikator detail)
- `overall_score`, `comments`

Data disimpan ke tabel `public_surveys`.

### 2. Validasi Unit
Endpoint survey sekarang memvalidasi:
- Unit ID harus ada
- Unit harus aktif (`is_active = true`)
- Unit harus valid di database

### 3. Update QR Code Usage
Jika survey dibuat via QR code, usage count akan otomatis bertambah.

## Cara Testing

### Manual Test via Browser/Postman

#### Test Tiket Eksternal:
```bash
POST http://localhost:5000/api/public/external-tickets
Content-Type: application/json

{
  "unit_id": "7bac7321-86e2-4dce-936d-2adde223c314",
  "reporter_identity_type": "personal",
  "reporter_name": "Test User",
  "reporter_email": "test@example.com",
  "reporter_phone": "081234567890",
  "service_type": "complaint",
  "title": "Test Tiket",
  "description": "Deskripsi test tiket",
  "source": "web"
}
```

#### Test Survey:
```bash
POST http://localhost:5000/api/public/surveys
Content-Type: application/json

{
  "unit_id": "7bac7321-86e2-4dce-936d-2adde223c314",
  "visitor_phone": "081234567890",
  "visitor_name": "Test Responden",
  "is_anonymous": false,
  "service_type": "rawat_jalan",
  "q1_score": 4,
  "q2_score": 5,
  "q3_score": 4,
  "q4_score": 5,
  "q5_score": 4,
  "q6_score": 5,
  "q7_score": 4,
  "q8_score": 5,
  "overall_score": 4,
  "comments": "Pelayanan baik",
  "source": "web"
}
```

### Automated Test
Jalankan script test otomatis:
```bash
# Pastikan backend berjalan di port 5000
npm run dev

# Di terminal lain, jalankan test
node test-jlamprang-tiket-survey.js

# Atau double-click file batch
TEST_JLAMPRANG_TIKET_SURVEY.bat
```

## Hasil yang Diharapkan

### Tiket Eksternal
- ✅ Tiket berhasil dibuat di tabel `tickets`
- ✅ Mendapat nomor tiket (format: `TKT-YYYY-XXXX`)
- ✅ Status awal: `open`
- ✅ Type sudah di-mapping dengan benar
- ✅ Unit ID tersimpan dengan benar

### Survey Kepuasan
- ✅ Survey berhasil dibuat di tabel `public_surveys`
- ✅ Mendapat ID survey
- ✅ Semua skor tersimpan dengan benar
- ✅ Unit ID tersimpan dengan benar
- ✅ Data responden tersimpan (jika tidak anonymous)

## Troubleshooting

### Error: "Unit tidak valid atau tidak aktif"
**Penyebab**: Unit ID salah atau unit tidak aktif
**Solusi**: 
```sql
-- Cek unit di database
SELECT id, name, is_active FROM units WHERE name ILIKE '%jlamprang%';

-- Aktifkan unit jika perlu
UPDATE units SET is_active = true WHERE id = '7bac7321-86e2-4dce-936d-2adde223c314';
```

### Error: "Tipe tiket tidak valid"
**Penyebab**: service_type tidak sesuai constraint database
**Solusi**: Gunakan salah satu dari:
- `complaint` (Pengaduan)
- `request` (Permintaan)
- `suggestion` (Saran)
- `survey` (Survey)

Backend akan otomatis mapping ke type yang valid di database.

### Error: "Nomor HP wajib diisi"
**Penyebab**: Field `visitor_phone` kosong pada survey
**Solusi**: Pastikan `visitor_phone` atau `reporter_phone` terisi

### Survey tidak muncul di dashboard
**Penyebab**: Filter unit atau tanggal tidak sesuai
**Solusi**: 
- Cek filter unit di dashboard
- Cek filter tanggal (pastikan mencakup hari ini)
- Refresh halaman dashboard

## Verifikasi Database

### Cek Tiket yang Dibuat:
```sql
SELECT 
  ticket_number, 
  title, 
  type, 
  status, 
  units.name as unit_name,
  created_at
FROM tickets
LEFT JOIN units ON tickets.unit_id = units.id
WHERE unit_id = '7bac7321-86e2-4dce-936d-2adde223c314'
ORDER BY created_at DESC
LIMIT 10;
```

### Cek Survey yang Dibuat:
```sql
SELECT 
  id,
  visitor_name,
  visitor_phone,
  service_type,
  overall_score,
  units.name as unit_name,
  created_at
FROM public_surveys
LEFT JOIN units ON public_surveys.unit_id = units.id
WHERE unit_id = '7bac7321-86e2-4dce-936d-2adde223c314'
ORDER BY created_at DESC
LIMIT 10;
```

## Status Perbaikan

- ✅ Endpoint tiket eksternal: **SUDAH ADA & BERFUNGSI**
- ✅ Endpoint survey publik: **DITAMBAHKAN & SIAP**
- ✅ Validasi unit: **DITAMBAHKAN**
- ✅ Mapping service_type: **SUDAH BENAR**
- ✅ Integrasi database: **LENGKAP**
- ✅ Script testing: **TERSEDIA**

## Catatan Penting

1. **Jangan ubah auth** - Perbaikan ini tidak mengubah sistem autentikasi
2. **Tidak ada duplikasi** - Menggunakan tabel yang sudah ada (`tickets`, `public_surveys`)
3. **Backend-Frontend terintegrasi** - Endpoint sudah sesuai dengan yang dipanggil frontend
4. **Unit Jlamprang siap digunakan** - Semua konfigurasi sudah benar

## Next Steps

1. Jalankan test untuk memastikan semua berfungsi
2. Cek di dashboard admin apakah tiket dan survey muncul
3. Test via QR code jika diperlukan
4. Monitor log backend untuk error
