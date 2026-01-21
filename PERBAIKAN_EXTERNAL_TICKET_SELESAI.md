# Perbaikan External Ticket - Selesai

## Masalah yang Ditemukan

Dari screenshot error yang ditampilkan:
- Error 500 (Internal Server Error) saat submit tiket eksternal
- Endpoint `/api/public/external-tickets` mencoba insert ke tabel `tickets` 
- Seharusnya insert ke tabel `external_tickets`

## Perbaikan yang Dilakukan

### 1. Backend - publicRoutes.ts
**File:** `backend/src/routes/publicRoutes.ts`

**Perubahan:**
- ✅ Endpoint POST `/external-tickets` sekarang menggunakan tabel `external_tickets`
- ✅ Generate nomor tiket dengan format `EXT-YYYY-NNNN`
- ✅ Validasi service_type: complaint, request, suggestion, survey
- ✅ Support identitas personal dan anonim
- ✅ Mapping priority berdasarkan service_type
- ✅ SLA deadline disesuaikan dengan jenis layanan
- ✅ Update QR code usage count jika ada
- ✅ Error handling yang lebih detail

**Struktur Data External Ticket:**
```typescript
{
  ticket_number: "EXT-2026-0001",
  qr_code_id: uuid | null,
  unit_id: uuid (required),
  reporter_identity_type: "personal" | "anonymous",
  reporter_name: string | null,
  reporter_email: string | null,
  reporter_phone: string | null,
  reporter_address: string | null,
  age_range: string | null,
  service_type: "complaint" | "request" | "suggestion" | "survey",
  category: string | null,
  title: string (required),
  description: string (required),
  status: "open",
  priority: "low" | "medium" | "high" | "critical",
  urgency_level: 1-5,
  sentiment_score: number,
  confidence_score: number,
  sla_deadline: timestamp,
  source: "web" | "qr_code" | "mobile",
  ip_address: inet,
  user_agent: string
}
```

### 2. File Test
**File:** `test-external-ticket-fixed.html`

Halaman test lengkap dengan:
- Form input semua field external ticket
- Toggle identitas personal/anonim
- Auto-fill unit_id dari database
- Sample data untuk testing
- Display hasil success/error

### 3. Script Batch
**File:** `TEST_EXTERNAL_TICKET_FIXED.bat`
- Membuka halaman test di browser

**File:** `RESTART_DAN_TEST_EXTERNAL_TICKET.bat`
- Restart backend dan frontend
- Membuka halaman test otomatis

## Cara Testing

### Opsi 1: Test Langsung
```bash
# Jalankan file batch
TEST_EXTERNAL_TICKET_FIXED.bat
```

### Opsi 2: Restart dan Test
```bash
# Restart aplikasi dan test
RESTART_DAN_TEST_EXTERNAL_TICKET.bat
```

### Opsi 3: Manual
1. Buka browser: `http://localhost:3002/test-external-ticket-fixed.html`
2. Unit ID akan terisi otomatis
3. Pilih identitas: Personal atau Anonim
4. Isi form
5. Klik "Kirim External Ticket"
6. Periksa hasil

## Validasi

### Field Wajib:
- ✅ unit_id (UUID)
- ✅ service_type (complaint/request/suggestion/survey)
- ✅ title
- ✅ description

### Field Opsional:
- reporter_name (wajib jika personal)
- reporter_email
- reporter_phone
- reporter_address
- age_range
- category
- qr_code (token)

## Hasil yang Diharapkan

### Success Response:
```json
{
  "success": true,
  "ticket_number": "EXT-2026-0001",
  "data": {
    "id": "uuid",
    "ticket_number": "EXT-2026-0001",
    "service_type": "complaint",
    "title": "...",
    "status": "open",
    "priority": "high",
    ...
  },
  "message": "Tiket berhasil dibuat. Nomor tiket Anda: EXT-2026-0001"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Pesan error yang jelas",
  "details": "Detail tambahan jika ada"
}
```

## Integrasi dengan Frontend

Form external ticket di frontend (`DirectExternalTicketForm.tsx`) sudah kompatibel dengan endpoint yang diperbaiki:

```typescript
// Data yang dikirim dari frontend
const submitData = {
  reporter_identity_type: 'personal' | 'anonymous',
  reporter_name: string,
  reporter_email: string,
  reporter_phone: string,
  service_type: 'complaint' | 'request' | 'suggestion',
  title: string,
  description: string,
  qr_code: string,
  unit_id: string,
  source: 'web' | 'qr_code'
};

// POST ke endpoint
fetch('/api/public/external-tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submitData)
});
```

## Perbedaan dengan Internal Ticket

| Aspek | External Ticket | Internal Ticket |
|-------|----------------|-----------------|
| Tabel | `external_tickets` | `tickets` |
| Nomor | EXT-YYYY-NNNN | TKT-YYYY-NNNN |
| Identitas | Personal/Anonim | Wajib (staff) |
| Service Type | complaint/request/suggestion/survey | complaint |
| Auth | Tidak perlu | Tidak perlu (public) |
| QR Support | Ya | Ya |

## Catatan Penting

1. **Tabel Terpisah**: External ticket menggunakan tabel `external_tickets`, bukan `tickets`
2. **Nomor Tiket**: Format berbeda (EXT vs TKT)
3. **Validasi**: Service type harus sesuai dengan constraint database
4. **Anonim**: Support untuk pelapor anonim
5. **QR Code**: Otomatis update usage count jika dari QR

## Status

✅ **SELESAI** - External ticket sudah bisa dibuat dengan benar

## Testing Checklist

- [ ] Test dengan identitas personal
- [ ] Test dengan identitas anonim
- [ ] Test semua service_type (complaint, request, suggestion, survey)
- [ ] Test dengan QR code token
- [ ] Test tanpa QR code
- [ ] Verifikasi nomor tiket format EXT-YYYY-NNNN
- [ ] Verifikasi data tersimpan di tabel external_tickets
- [ ] Test dari form frontend DirectExternalTicketForm
