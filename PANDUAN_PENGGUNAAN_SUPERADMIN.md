# Panduan Penggunaan Superadmin - Sistem Complaint Management

## Informasi Login Superadmin

### Kredensial Superadmin
- **Email**: mukhsin9@gmail.com
- **Password**: Jlamprang233!!
- **Role**: superadmin
- **Status**: Aktif

## Cara Mengakses Sistem

### 1. Login ke Dashboard Admin
```
URL: http://localhost:3001/login
Email: mukhsin9@gmail.com
Password: Jlamprang233!!
```

### 2. Verifikasi Login via API
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mukhsin9","password":"Jlamprang233!!"}'
```

## Hak Akses Superadmin

### Akses Penuh ke Semua Fitur:
- ✅ **Dashboard Analytics** - Lihat semua metrics dan KPI
- ✅ **Manajemen Tiket** - CRUD semua tiket
- ✅ **Manajemen Unit** - Kelola struktur organisasi
- ✅ **Manajemen User** - Tambah/edit/hapus user
- ✅ **QR Code Management** - Generate dan kelola QR codes
- ✅ **Settings & Configuration** - Ubah pengaturan sistem
- ✅ **Reports & Analytics** - Export data dan laporan
- ✅ **Master Data** - Kelola kategori, SLA, dll

## Fitur Utama yang Dapat Diakses

### 1. Dashboard Complaint Management
```
Endpoint: GET /api/complaints/dashboard/metrics
Fitur:
- Status tiket real-time
- Grafik distribusi kategori
- Tiket terbaru
- KPI performance
```

### 2. Manajemen Tiket
```
Endpoints:
- GET /api/complaints/tickets (List semua tiket)
- POST /api/complaints/tickets (Buat tiket baru)
- PUT /api/complaints/tickets/:id (Update tiket)
- POST /api/complaints/tickets/:id/responses (Tambah respon)
```

### 3. Master Data Management
```
Endpoints:
- GET /api/complaints/units (Kelola unit/departemen)
- GET /api/complaints/categories (Kelola kategori layanan)
- POST /api/complaints/units (Tambah unit baru)
- PUT /api/complaints/units/:id (Update unit)
```

### 4. QR Code System
```
Fitur:
- Generate QR code per unit
- Monitor penggunaan QR code
- Kelola akses publik
- Tracking submission via QR
```

## Contoh Penggunaan API

### 1. Login dan Dapatkan Token
```javascript
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'mukhsin9',
    password: 'Jlamprang233!!'
  })
});

const { data } = await loginResponse.json();
const token = data.token;
```

### 2. Akses Dashboard Metrics
```javascript
const metricsResponse = await fetch('http://localhost:5000/api/complaints/dashboard/metrics', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const metrics = await metricsResponse.json();
console.log(metrics.data); // Status counts, recent tickets, dll
```

### 3. Buat Tiket Baru
```javascript
const newTicket = await fetch('http://localhost:5000/api/complaints/tickets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'complaint',
    title: 'Contoh Keluhan',
    description: 'Deskripsi keluhan...',
    unit_id: 'unit-id-here',
    priority: 'medium'
  })
});
```

### 4. Lihat Semua Unit
```javascript
const unitsResponse = await fetch('http://localhost:5000/api/complaints/units', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const units = await unitsResponse.json();
console.log(units.data); // List semua unit
```

## Struktur Data yang Dapat Dikelola

### 1. Tiket (Tickets)
```json
{
  "id": "uuid",
  "ticket_number": "TKT-2025-0001",
  "type": "complaint|information|suggestion|satisfaction",
  "title": "Judul tiket",
  "description": "Deskripsi lengkap",
  "status": "open|in_progress|escalated|resolved|closed",
  "priority": "low|medium|high|critical",
  "unit_id": "uuid",
  "category_id": "uuid",
  "created_at": "timestamp"
}
```

### 2. Unit/Departemen
```json
{
  "id": "uuid",
  "name": "Nama Unit",
  "code": "UNIT001",
  "parent_unit_id": "uuid|null",
  "description": "Deskripsi unit",
  "contact_email": "email@domain.com",
  "contact_phone": "08123456789",
  "sla_hours": 24,
  "is_active": true
}
```

### 3. Kategori Layanan
```json
{
  "id": "uuid",
  "name": "Nama Kategori",
  "code": "CAT001",
  "description": "Deskripsi kategori",
  "default_sla_hours": 24,
  "requires_attachment": false,
  "is_active": true
}
```

## Monitoring dan Analytics

### Metrics yang Dapat Dipantau:
- **Total Tiket**: Jumlah tiket per status
- **Response Time**: Waktu respon rata-rata
- **SLA Compliance**: Persentase tiket yang memenuhi SLA
- **Unit Performance**: Performa per unit/departemen
- **Satisfaction Scores**: Skor kepuasan pelanggan
- **Trend Analysis**: Tren tiket bulanan/mingguan

### Export dan Reporting:
- Export data ke Excel/PDF
- Laporan berkala otomatis
- Custom date range reports
- Unit-specific reports

## Troubleshooting

### Jika Login Gagal:
1. Pastikan server backend berjalan di port 5000
2. Cek kredensial: mukhsin9@gmail.com / Jlamprang233!!
3. Verifikasi koneksi database Supabase
4. Clear browser cache jika perlu

### Jika API Error:
1. Cek token JWT masih valid
2. Pastikan header Authorization benar
3. Verifikasi endpoint URL
4. Cek log server untuk detail error

### Jika Data Tidak Muncul:
1. Cek RLS policies di Supabase (saat ini disabled)
2. Verifikasi foreign key relationships
3. Pastikan data ada di database
4. Cek filter dan pagination

## Best Practices

### Keamanan:
- Selalu logout setelah selesai
- Jangan share kredensial superadmin
- Monitor aktivitas login
- Update password secara berkala

### Performance:
- Gunakan pagination untuk data besar
- Filter data sesuai kebutuhan
- Monitor response time API
- Optimize query database

### Data Management:
- Backup data secara berkala
- Validasi input sebelum submit
- Maintain data consistency
- Archive old tickets

## Support dan Bantuan

Jika mengalami kendala dalam penggunaan sistem:

1. **Cek dokumentasi** ini terlebih dahulu
2. **Verifikasi konfigurasi** environment
3. **Test API endpoints** secara manual
4. **Monitor logs** untuk error details
5. **Hubungi tim development** jika diperlukan

**Status Sistem**: ✅ AKTIF DAN SIAP DIGUNAKAN