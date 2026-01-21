# Perbaikan External Ticket - Unit ID Error

## Masalah
Form tiket eksternal menampilkan error "Unit ID tidak ditemukan" ketika diakses tanpa parameter `unit_id` di URL.

## Penyebab
1. Form eksternal memerlukan `unit_id` sebagai parameter wajib di URL
2. Ketika user mengakses `/form/eksternal` tanpa parameter, form langsung error
3. Tidak ada fallback untuk memilih unit secara manual

## Solusi yang Diterapkan

### 1. Tambah State untuk Units
```typescript
const [units, setUnits] = useState<any[]>([]);
const [loadingUnits, setLoadingUnits] = useState(false);
```

### 2. Load Units dari API
Jika `unit_id` tidak ada di URL, form akan:
- Memanggil API `/api/public/units` untuk mendapatkan daftar unit
- Menampilkan dropdown unit di Step 1
- User bisa memilih unit secara manual

```typescript
React.useEffect(() => {
  const loadUnits = async () => {
    if (!unitId) {
      setLoadingUnits(true);
      try {
        const response = await fetch('/api/public/units');
        const result = await response.json();
        if (result.success && result.data) {
          setUnits(result.data);
        }
      } catch (err) {
        setError('Gagal memuat daftar unit');
      } finally {
        setLoadingUnits(false);
      }
    }
  };
  
  loadUnits();
}, [unitId]);
```

### 3. Tampilkan Dropdown Unit
Di Step 1, jika tidak ada `unit_id` dari URL:
```tsx
{!unitId && (
  <div>
    <label>Pilih Unit *</label>
    <select
      name="unit_id"
      value={formData.unit_id}
      onChange={handleInputChange}
      required
    >
      <option value="">-- Pilih Unit --</option>
      {units.map((unit) => (
        <option key={unit.id} value={unit.id}>
          {unit.name}
        </option>
      ))}
    </select>
  </div>
)}
```

### 4. Validasi Unit ID
Validasi diperbaiki untuk menggunakan `unit_id` dari form data atau URL:
```typescript
const finalUnitId = formData.unit_id || unitId;
if (!finalUnitId) {
  setError('Unit harus dipilih');
  return;
}
```

### 5. Update Interface FormData
```typescript
interface FormData {
  // ... field lainnya
  unit_id: string; // Tambahkan unit_id
}
```

## Cara Kerja

### Skenario 1: Akses dengan QR Code (ada unit_id)
```
URL: /form/eksternal?unit_id=xxx&unit_name=Unit%20Test
```
- Form langsung menggunakan `unit_id` dari URL
- Tidak menampilkan dropdown unit
- Unit name ditampilkan di header

### Skenario 2: Akses Langsung (tanpa unit_id)
```
URL: /form/eksternal
```
- Form memanggil API untuk load daftar unit
- Menampilkan dropdown "Pilih Unit" di Step 1
- User memilih unit secara manual
- Validasi memastikan unit dipilih sebelum lanjut

## Testing

### Test 1: Akses Tanpa Unit ID
```bash
# Buka browser
http://localhost:3002/form/eksternal

# Expected:
✅ Form terbuka tanpa error
✅ Dropdown "Pilih Unit" muncul di Step 1
✅ Bisa pilih unit dan submit tiket
```

### Test 2: Akses Dengan Unit ID
```bash
# Buka browser
http://localhost:3002/form/eksternal?unit_id=xxx&unit_name=Unit%20Test

# Expected:
✅ Form terbuka dengan unit sudah terisi
✅ Tidak ada dropdown unit
✅ Unit name tampil di header
✅ Bisa langsung isi form dan submit
```

### Test 3: Submit Tiket
```bash
# Isi form lengkap dan submit

# Expected:
✅ Tiket berhasil dibuat
✅ Dapat nomor tiket
✅ Tidak ada error "Unit ID tidak ditemukan"
```

## File yang Diubah
- `frontend/src/pages/public/DirectExternalTicketForm.tsx`
  - Tambah state untuk units dan loadingUnits
  - Tambah useEffect untuk load units
  - Tambah dropdown unit di Step 1
  - Update validasi unit_id
  - Update interface FormData

## Keuntungan
1. ✅ Form lebih fleksibel - bisa diakses dengan atau tanpa unit_id
2. ✅ User experience lebih baik - tidak langsung error
3. ✅ Tetap support QR code dengan auto-fill unit
4. ✅ Validasi lebih robust
5. ✅ Error handling lebih baik

## Catatan
- API `/api/public/units` sudah ada dan berfungsi dengan baik
- Backend tidak perlu diubah
- Perbaikan hanya di frontend
- Backward compatible dengan QR code yang sudah ada
