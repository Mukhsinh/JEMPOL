# Perbaikan Create Internal Ticket - Bahasa Indonesia & Integrasi Master Data

## Ringkasan Perbaikan

Halaman `/tickets/create/internal` telah diperbarui dengan:

1. **Bahasa Indonesia** - Semua teks UI diubah ke bahasa Indonesia
2. **Integrasi Master Data** - Dropdown form terintegrasi dengan tabel database master
3. **Validasi Form** - Validasi yang lebih baik dengan pesan error dalam bahasa Indonesia
4. **Endpoint Public** - Menambahkan endpoint public untuk akses master data

## Perubahan Detail

### 1. Frontend - CreateInternalTicket.tsx

#### Perubahan Bahasa
- **Breadcrumbs**: "Tickets" → "Tiket", "Create Internal Ticket" → "Buat Tiket Internal"
- **Judul**: "Create New Ticket" → "Buat Tiket Baru"
- **Deskripsi**: "Log a new issue..." → "Catat masalah atau permintaan baru..."
- **Form Labels**:
  - "Title" → "Judul"
  - "Type" → "Tipe"
  - "Category" → "Kategori"
  - "Priority" → "Prioritas"
  - "Unit" → "Unit"
  - "Description" → "Deskripsi"
  - "Attachments" → "Lampiran"
- **Buttons**: "Cancel" → "Batal", "Create Ticket" → "Buat Tiket"
- **Placeholders**: Semua placeholder dalam bahasa Indonesia

#### Integrasi Master Data
```typescript
// Import services yang diperlukan
import { masterDataService, TicketType, ServiceCategory } from '../../services/masterDataService';
import unitService, { Unit } from '../../services/unitService';

// State untuk master data
const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
const [categories, setCategories] = useState<ServiceCategory[]>([]);
const [units, setUnits] = useState<Unit[]>([]);

// Fetch master data
const fetchMasterData = async () => {
    const unitsData = await unitService.getUnits();
    const categoriesData = await masterDataService.getServiceCategories();
    const ticketTypesData = await masterDataService.getTicketTypes();
    
    setUnits(unitsData || []);
    setCategories(categoriesData || []);
    setTicketTypes(ticketTypesData || []);
};
```

#### Dropdown Terintegrasi
- **Tipe Tiket**: Mengambil dari tabel `ticket_types`
- **Kategori**: Mengambil dari tabel `service_categories`
- **Unit**: Mengambil dari tabel `units`
- **Prioritas**: Opsi dalam bahasa Indonesia (Rendah, Sedang, Tinggi, Kritis)

### 2. Backend - Public Routes

Menambahkan endpoint public untuk master data:

```typescript
// GET /api/public/units
router.get('/units', async (req: Request, res: Response) => {
  const { data: units, error } = await supabase
    .from('units')
    .select('id, name, code, description')
    .eq('is_active', true)
    .order('name');
  
  res.json(units);
});

// GET /api/public/service-categories
router.get('/service-categories', async (req: Request, res: Response) => {
  const { data: categories, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  res.json(categories);
});

// GET /api/public/ticket-types
router.get('/ticket-types', async (req: Request, res: Response) => {
  const { data: ticketTypes, error } = await supabase
    .from('ticket_types')
    .select('id, name, code, description, default_priority')
    .eq('is_active', true)
    .order('name');
  
  res.json(ticketTypes);
});
```

### 3. Struktur Database Master

#### Tabel `ticket_types`
- `id`: UUID primary key
- `name`: Nama tipe (Keluhan, Informasi, Saran, Kepuasan)
- `code`: Kode tipe (COMPLAINT, INFO, SUGGESTION, SATISFACTION)
- `default_priority`: Prioritas default
- `is_active`: Status aktif

#### Tabel `service_categories`
- `id`: UUID primary key
- `name`: Nama kategori layanan
- `code`: Kode kategori
- `description`: Deskripsi
- `default_sla_hours`: SLA default dalam jam
- `is_active`: Status aktif

#### Tabel `units`
- `id`: UUID primary key
- `name`: Nama unit
- `code`: Kode unit
- `description`: Deskripsi unit
- `sla_hours`: SLA dalam jam
- `is_active`: Status aktif

### 4. Validasi Form

```typescript
const handleSubmit = async () => {
    if (!title || !categoryId || !priority || !unitId || !type || !description) {
        setError('Harap isi semua field yang diperlukan.');
        return;
    }
    
    // Submit logic...
};
```

### 5. Prioritas dalam Bahasa Indonesia

```typescript
const priorityOptions = [
    { value: 'low', label: 'Rendah', color: '#10B981' },
    { value: 'medium', label: 'Sedang', color: '#F59E0B' },
    { value: 'high', label: 'Tinggi', color: '#EF4444' },
    { value: 'critical', label: 'Kritis', color: '#DC2626' }
];
```

## Testing

### File Test yang Dibuat

1. **test-create-internal-ticket-integration.html**
   - Test integrasi lengkap form create ticket
   - Verifikasi koneksi API
   - Test loading master data
   - Simulasi submit form

2. **test-master-data-endpoints.html**
   - Test semua endpoint master data
   - Verifikasi public dan protected endpoints
   - Preview data yang dimuat

### Cara Menjalankan Test

```bash
# Buka file test di browser
start test-create-internal-ticket-integration.html
start test-master-data-endpoints.html
```

## Endpoint API

### Public Endpoints (Tanpa Auth)
- `GET /api/public/units` - Daftar unit aktif
- `GET /api/public/service-categories` - Daftar kategori layanan aktif
- `GET /api/public/ticket-types` - Daftar tipe tiket aktif

### Protected Endpoints (Dengan Auth)
- `GET /api/master-data/units` - CRUD unit lengkap
- `GET /api/master-data/service-categories` - CRUD kategori lengkap
- `GET /api/master-data/ticket-types` - CRUD tipe tiket lengkap

## Fitur Utama

### ✅ Bahasa Indonesia
- Semua teks UI dalam bahasa Indonesia
- Pesan error dan validasi dalam bahasa Indonesia
- Placeholder dan label yang sesuai

### ✅ Integrasi Master Data
- Dropdown tipe tiket dari database
- Dropdown kategori dari database
- Dropdown unit dari database
- Prioritas dengan label Indonesia

### ✅ Validasi Form
- Validasi field wajib
- Pesan error yang jelas
- Loading state saat submit

### ✅ Fallback Handling
- Fallback ke endpoint public jika protected gagal
- Error handling yang baik
- Loading state yang informatif

## Struktur File

```
frontend/src/pages/tickets/
├── CreateInternalTicket.tsx (✅ Updated)

backend/src/
├── routes/
│   ├── publicRoutes.ts (✅ Updated)
│   └── masterDataRoutes.ts (✅ Existing)
└── controllers/
    └── masterDataController.ts (✅ Existing)

test files/
├── test-create-internal-ticket-integration.html (✅ New)
└── test-master-data-endpoints.html (✅ New)
```

## Status Implementasi

- ✅ Bahasa Indonesia lengkap
- ✅ Integrasi dengan tabel master data
- ✅ Dropdown tipe, kategori, prioritas, unit
- ✅ Validasi form dalam bahasa Indonesia
- ✅ Endpoint public untuk master data
- ✅ Error handling dan fallback
- ✅ File test untuk verifikasi

## Cara Penggunaan

1. **Akses halaman**: `/tickets/create/internal`
2. **Isi form**:
   - Judul: Ringkasan masalah
   - Tipe: Pilih dari dropdown (Keluhan, Informasi, Saran, Kepuasan)
   - Kategori: Pilih dari dropdown kategori layanan
   - Prioritas: Pilih prioritas (Rendah, Sedang, Tinggi, Kritis)
   - Unit: Pilih unit tujuan
   - Deskripsi: Detail masalah
   - Lampiran: Upload file (opsional)
3. **Submit**: Klik "Buat Tiket"

Form akan memvalidasi semua field wajib dan menampilkan pesan error dalam bahasa Indonesia jika ada yang kosong.