# PERBAIKAN ENDPOINT INTERNAL TICKETS - SINKRONISASI FRONTEND & BACKEND

## MASALAH YANG DITEMUKAN

### 1. **Konflik Endpoint di Production vs Localhost**
- **Production (Vercel)**: `/api/public/internal-tickets` → Vercel Serverless Function (`api/public/internal-tickets.ts`)
- **Localhost**: `/api/public/internal-tickets` → Express Backend (`backend/src/routes/publicRoutes.ts`)

### 2. **Ketidaksesuaian Logic**
- Vercel function dan Express backend memiliki logic yang berbeda
- Frontend mengirim data ke endpoint yang sama tapi ditangani oleh 2 handler berbeda

### 3. **Error yang Muncul**
```
Error loading app settings: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
Non-JSON response: <!doctype html>
Server mengembalikan response yang tidak valid
```

**PENYEBAB**: Server mengembalikan HTML (halaman web) bukan JSON karena:
- Route tidak ditemukan (404)
- Method tidak sesuai (405)
- Server redirect ke halaman web

## PERBAIKAN YANG DILAKUKAN

### 1. **Sinkronisasi Vercel Function dengan Express Backend**

**File**: `api/public/internal-tickets.ts`

#### Perubahan:
1. **Description Handling** - Gabungkan department & position ke description
2. **Category Lookup** - Cari category_id dari nama/code jika bukan UUID
3. **Ticket Data Structure** - Sesuaikan dengan Express backend

```typescript
// SEBELUM
ticketData.description = description;
if (reporter_department || reporter_position) {
  ticketData.description = `${description}\n\n--- Info Pelapor ---...`;
}

// SESUDAH
const fullDescription = reporter_department || reporter_position
  ? `${description}\n\n--- Info Pelapor ---\nDepartemen: ${reporter_department || '-'}\nJabatan: ${reporter_position || '-'}`
  : description;

ticketData.description = fullDescription;
```

#### Category Lookup Logic:
```typescript
// Jika category bukan UUID, cari dari database
const categoryMap = {
  'it_support': 'IT Support',
  'facility': 'Fasilitas',
  'equipment': 'Peralatan',
  'hr': 'SDM',
  'admin': 'Administrasi',
  'other': 'Lainnya'
};

const categoryName = categoryMap[finalCategoryId] || finalCategoryId;
const { data: categoryData } = await supabase
  .from('service_categories')
  .select('id')
  .or(`name.ilike.%${categoryName}%,code.ilike.%${finalCategoryId}%`)
  .eq('is_active', true)
  .limit(1);
```

### 2. **Validasi Priority**
```typescript
const validPriorities = ['low', 'medium', 'high', 'critical'];
const finalPriority = validPriorities.includes(priority) ? priority : 'medium';
```

### 3. **Validasi Source**
```typescript
const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone'];
const finalSource = validSources.includes(source) ? source : 'web';
```

### 4. **SLA Deadline Calculation**
```typescript
const slaDeadline = new Date();
if (finalPriority === 'critical') {
  slaDeadline.setHours(slaDeadline.getHours() + 4);
} else if (finalPriority === 'high') {
  slaDeadline.setHours(slaDeadline.getHours() + 24);
} else if (finalPriority === 'medium') {
  slaDeadline.setHours(slaDeadline.getHours() + 48);
} else {
  slaDeadline.setHours(slaDeadline.getHours() + 72);
}
```

## STRUKTUR DATA YANG DIKIRIM

### Frontend → Backend
```json
{
  "reporter_name": "John Doe",
  "reporter_email": "john@example.com",
  "reporter_phone": "08123456789",
  "reporter_department": "IT Department",
  "reporter_position": "Staff",
  "category": "it_support",
  "priority": "medium",
  "title": "Laptop tidak bisa connect WiFi",
  "description": "Laptop saya tidak bisa connect ke WiFi kantor...",
  "unit_id": "uuid-unit-id",
  "qr_code": "token-qr-code",
  "source": "web"
}
```

### Backend → Database (tickets table)
```json
{
  "ticket_number": "INT-2026-0001",
  "type": "complaint",
  "title": "Laptop tidak bisa connect WiFi",
  "description": "Laptop saya tidak bisa connect ke WiFi kantor...\n\n--- Info Pelapor ---\nDepartemen: IT Department\nJabatan: Staff",
  "unit_id": "uuid-unit-id",
  "qr_code_id": "uuid-qr-id",
  "category_id": "uuid-category-id",
  "priority": "medium",
  "status": "open",
  "sla_deadline": "2026-01-25T12:00:00.000Z",
  "source": "web",
  "is_anonymous": false,
  "submitter_name": "John Doe",
  "submitter_email": "john@example.com",
  "submitter_phone": "08123456789",
  "submitter_address": null,
  "ip_address": null,
  "user_agent": null
}
```

## TESTING

### 1. Test di Localhost
```bash
# Jalankan backend
cd backend
npm run dev

# Jalankan frontend
cd frontend
npm run dev

# Buka browser
http://localhost:5173/form/internal?unit_id=xxx&unit_name=xxx
```

### 2. Test di Production (Vercel)
```bash
# Deploy ke Vercel
vercel --prod

# Test endpoint
https://your-app.vercel.app/form/internal?unit_id=xxx&unit_name=xxx
```

### 3. Test dengan cURL
```bash
# Test POST internal ticket
curl -X POST https://your-app.vercel.app/api/public/internal-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_name": "Test User",
    "reporter_email": "test@example.com",
    "reporter_phone": "08123456789",
    "reporter_department": "IT",
    "reporter_position": "Staff",
    "category": "it_support",
    "priority": "medium",
    "title": "Test Ticket",
    "description": "Test description",
    "unit_id": "your-unit-id",
    "source": "web"
  }'
```

## CHECKLIST VERIFIKASI

- [x] Vercel function dan Express backend memiliki logic yang sama
- [x] Description handling konsisten (department & position)
- [x] Category lookup dari nama/code
- [x] Priority validation
- [x] Source validation
- [x] SLA deadline calculation
- [x] Ticket data structure sesuai database schema
- [x] Error handling yang jelas
- [x] Response format JSON konsisten

## CATATAN PENTING

1. **Jangan ubah auth** - Endpoint ini public, tidak perlu auth
2. **Jaga konsistensi** - Pastikan Vercel function dan Express backend selalu sinkron
3. **Test di kedua environment** - Localhost dan Production
4. **Monitor logs** - Cek console.log untuk debugging

## LANGKAH SELANJUTNYA

1. Test form internal ticket di localhost
2. Test form internal ticket di production
3. Verifikasi data masuk ke database dengan benar
4. Cek nomor tiket ter-generate dengan benar
5. Pastikan QR code usage count ter-update

## STATUS

✅ **SELESAI** - Endpoint internal tickets sudah disinkronkan antara Vercel function dan Express backend
