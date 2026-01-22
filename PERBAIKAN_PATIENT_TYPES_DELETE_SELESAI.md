# ✅ Perbaikan Fitur Hapus Patient Types - SELESAI

## 📋 Masalah yang Ditemukan

Saat mencoba menghapus data Jenis Pasien (Patient Types), muncul error:

```
Gagal menghapus data: Gagal hapus patient type: update or delete on table "patient_types" 
violates foreign key constraint "sla_settings_patient_type_id_fkey" on table "sla_settings"
```

### Penyebab Masalah

Patient Types memiliki relasi foreign key dengan 3 tabel:
1. **sla_settings** - Pengaturan SLA berdasarkan jenis pasien
2. **external_tickets** - Tiket eksternal yang mencatat jenis pasien
3. **tickets** - Tiket internal yang mencatat jenis pasien

Constraint lama menggunakan default behavior (RESTRICT), yang mencegah penghapusan jika ada data terkait.

### Data yang Terpengaruh

| Patient Type | SLA Settings | External Tickets | Tickets |
|-------------|--------------|------------------|---------|
| Pasien BPJS | 1 | 0 | 0 |
| Pasien Darurat | 2 | 0 | 0 |
| Pasien Umum | 1 | 0 | 0 |
| Pasien VIP | 2 | 0 | 0 |

## 🔧 Solusi yang Diterapkan

### 1. Ubah Foreign Key Constraint

Mengubah constraint dari `RESTRICT` (default) menjadi `ON DELETE SET NULL`:

```sql
-- Drop constraint lama
ALTER TABLE sla_settings DROP CONSTRAINT sla_settings_patient_type_id_fkey;
ALTER TABLE external_tickets DROP CONSTRAINT external_tickets_patient_type_id_fkey;
ALTER TABLE tickets DROP CONSTRAINT tickets_patient_type_id_fkey;

-- Tambah constraint baru dengan ON DELETE SET NULL
ALTER TABLE sla_settings 
ADD CONSTRAINT sla_settings_patient_type_id_fkey 
FOREIGN KEY (patient_type_id) REFERENCES patient_types(id) ON DELETE SET NULL;

ALTER TABLE external_tickets 
ADD CONSTRAINT external_tickets_patient_type_id_fkey 
FOREIGN KEY (patient_type_id) REFERENCES patient_types(id) ON DELETE SET NULL;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_patient_type_id_fkey 
FOREIGN KEY (patient_type_id) REFERENCES patient_types(id) ON DELETE SET NULL;
```

### 2. Keuntungan Solusi Ini

✅ **Aman**: Data di tabel terkait (SLA, tickets) TIDAK DIHAPUS
✅ **Fleksibel**: Patient type bisa dihapus kapan saja
✅ **Traceable**: Field `patient_type_id` di-set NULL, bukan dihapus
✅ **Reversible**: Bisa di-assign patient type baru jika diperlukan

### 3. Alternatif yang TIDAK Dipilih

❌ **ON DELETE CASCADE**: Akan menghapus semua SLA settings dan tickets terkait (terlalu berbahaya)
❌ **Hapus manual**: Harus hapus SLA settings dulu sebelum hapus patient type (tidak praktis)

## 📊 Hasil Verifikasi

Constraint berhasil diubah:

| Table | Constraint Name | Delete Rule |
|-------|----------------|-------------|
| sla_settings | sla_settings_patient_type_id_fkey | **SET NULL** ✅ |
| external_tickets | external_tickets_patient_type_id_fkey | **SET NULL** ✅ |
| tickets | tickets_patient_type_id_fkey | **SET NULL** ✅ |

## 🎯 Cara Penggunaan

### Untuk EDIT Patient Type
Tidak ada perubahan, bisa langsung edit seperti biasa:
1. Klik tombol Edit (✏️) pada patient type yang ingin diubah
2. Ubah data yang diperlukan
3. Klik Simpan

### Untuk HAPUS Patient Type
Sekarang bisa langsung hapus tanpa error:
1. Klik tombol Hapus (🗑️) pada patient type yang ingin dihapus
2. Konfirmasi penghapusan
3. Patient type akan dihapus
4. Data terkait (SLA settings, tickets) tetap ada, tapi `patient_type_id` nya menjadi NULL

### Contoh Skenario

**Sebelum Hapus:**
```
SLA Setting: "SLA Pasien VIP" → patient_type_id = "cd563463-000f-4526-bcc0-cb9d6adc37e3"
```

**Setelah Hapus Patient Type "Pasien VIP":**
```
SLA Setting: "SLA Pasien VIP" → patient_type_id = NULL
```

SLA setting masih ada dan bisa di-assign ke patient type lain jika diperlukan.

## 🔄 Urutan Perbaikan yang Dilakukan

1. ✅ Analisis struktur database dan foreign key constraints
2. ✅ Identifikasi tabel yang terpengaruh (sla_settings, external_tickets, tickets)
3. ✅ Cek data yang menggunakan patient_types
4. ✅ Buat migration untuk ubah constraint
5. ✅ Apply migration ke database
6. ✅ Verifikasi constraint baru
7. ✅ Dokumentasi lengkap

## 📝 File yang Dibuat

1. `fix-patient-types-delete-constraint.js` - Script untuk fix constraint (backup)
2. Migration Supabase: `fix_patient_types_delete_constraints`
3. `PERBAIKAN_PATIENT_TYPES_DELETE_SELESAI.md` - Dokumentasi ini

## ✅ Status

**SELESAI DAN SIAP DIGUNAKAN!**

Sekarang Anda bisa:
- ✅ Edit patient types tanpa masalah
- ✅ Hapus patient types tanpa error
- ✅ Data terkait tetap aman (tidak terhapus)

## 🧪 Testing

Silakan test dengan:
1. Buka halaman Master Data → Jenis Pasien
2. Coba edit salah satu patient type → Harus berhasil
3. Coba hapus salah satu patient type → Harus berhasil tanpa error
4. Cek SLA Settings → Data masih ada, patient_type_id menjadi NULL

---

**Tanggal Perbaikan**: 22 Januari 2026
**Status**: ✅ SELESAI
