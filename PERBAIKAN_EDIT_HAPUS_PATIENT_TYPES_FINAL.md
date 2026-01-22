# Perbaikan Edit dan Hapus Jenis Pasien - SELESAI

## Masalah yang Ditemukan

Dari screenshot error yang Anda berikan, masalahnya adalah:

```
Gagal menghapus data. Gagal hapus patient type: update or delete on table "patient_types" violates foreign key constraint "sla_settings_patient_type_id_fkey" on table "sla_settings"
```

### Penyebab Error

Tabel `patient_types` memiliki **foreign key constraint** dari tabel lain:
1. **sla_settings** → `patient_type_id` (Pengaturan SLA)
2. **tickets** → `patient_type_id` (Tiket Internal)
3. **external_tickets** → `patient_type_id` (Tiket Eksternal)

Ketika Anda mencoba menghapus data jenis pasien yang masih digunakan di tabel `sla_settings`, database akan menolak operasi tersebut untuk menjaga integritas data.

## Solusi yang Diterapkan

### 1. Backend - Validasi Sebelum Hapus

File: `backend/src/controllers/masterDataController.ts`

**Fungsi `deletePatientType` yang diperbaiki:**

```typescript
export const deletePatientType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Cek apakah patient type digunakan di tabel lain
    const { data: slaUsage, error: slaError } = await supabaseAdmin
      .from('sla_settings')
      .select('id')
      .eq('patient_type_id', id)
      .limit(1);

    if (slaError) throw slaError;

    if (slaUsage && slaUsage.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus data. Jenis pasien ini masih digunakan di Pengaturan SLA. Hapus atau ubah pengaturan SLA terkait terlebih dahulu.' 
      });
    }

    // Cek apakah digunakan di tickets
    const { data: ticketUsage, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('id')
      .eq('patient_type_id', id)
      .limit(1);

    if (ticketError) throw ticketError;

    if (ticketUsage && ticketUsage.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus data. Jenis pasien ini masih digunakan di tiket. Tidak dapat menghapus data yang sudah digunakan.' 
      });
    }

    // Cek apakah digunakan di external_tickets
    const { data: externalUsage, error: externalError } = await supabaseAdmin
      .from('external_tickets')
      .select('id')
      .eq('patient_type_id', id)
      .limit(1);

    if (externalError) throw externalError;

    if (externalUsage && externalUsage.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus data. Jenis pasien ini masih digunakan di tiket eksternal. Tidak dapat menghapus data yang sudah digunakan.' 
      });
    }

    // Jika tidak digunakan, hapus data
    const { error } = await supabaseAdmin
      .from('patient_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting patient type:', error);
    res.status(500).json({ 
      error: 'Gagal menghapus data jenis pasien',
      details: error.message 
    });
  }
};
```

**Fungsi `updatePatientType` yang diperbaiki:**

```typescript
export const updatePatientType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validasi data yang dikirim
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Pastikan priority_level dalam range yang benar
    if (updateData.priority_level && (updateData.priority_level < 1 || updateData.priority_level > 5)) {
      return res.status(400).json({ 
        error: 'Level prioritas harus antara 1 sampai 5' 
      });
    }

    // Pastikan default_sla_hours positif
    if (updateData.default_sla_hours && updateData.default_sla_hours < 1) {
      return res.status(400).json({ 
        error: 'SLA default harus minimal 1 jam' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('patient_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Patient type updated successfully:', id);
    res.json(data);
  } catch (error: any) {
    console.error('❌ Error updating patient type:', error);
    res.status(500).json({ 
      error: 'Gagal memperbarui data jenis pasien',
      details: error.message 
    });
  }
};
```

### 2. Frontend - Pesan Error yang Lebih Jelas

File: `frontend/src/pages/settings/PatientTypes.tsx`

**Fungsi `handleDelete` yang diperbaiki:**

```typescript
const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jenis pasien ini?')) {
        try {
            console.log('🗑️ Deleting patient type:', id);
            await masterDataService.deletePatientType(id);
            console.log('✅ Delete berhasil');
            await fetchPatientTypes();
            alert('Data berhasil dihapus!');
        } catch (error: any) {
            console.error('❌ Error deleting patient type:', error);
            
            // Tampilkan pesan error yang lebih informatif
            let errorMessage = 'Gagal menghapus data';
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        }
    }
};
```

## Urutan Penggunaan Fitur Edit/Hapus

### A. Untuk EDIT Jenis Pasien

1. **Buka halaman Jenis Pasien**
   - Navigasi: Master Data → Jenis Pasien
   - URL: `http://localhost:3002/master-data/patient-types`

2. **Klik tombol Edit (ikon pensil)** pada data yang ingin diubah

3. **Ubah data di modal yang muncul:**
   - Nama
   - Kode
   - Deskripsi
   - Level Prioritas (1-5)
   - SLA Default (minimal 1 jam)
   - Status Aktif/Tidak Aktif

4. **Klik tombol "Perbarui"**

5. **Sistem akan:**
   - Validasi data (prioritas 1-5, SLA minimal 1 jam)
   - Simpan perubahan ke database
   - Refresh tabel otomatis
   - Tampilkan pesan sukses

### B. Untuk HAPUS Jenis Pasien

#### Langkah 1: Cek Penggunaan Data

Sebelum menghapus, pastikan jenis pasien **TIDAK** digunakan di:
- ✅ Pengaturan SLA
- ✅ Tiket Internal
- ✅ Tiket Eksternal

#### Langkah 2: Hapus Data Terkait (Jika Ada)

**Jika jenis pasien digunakan di Pengaturan SLA:**

1. Buka halaman **Pengaturan SLA**
   - Navigasi: Master Data → Pengaturan SLA
   - URL: `http://localhost:3002/master-data/sla-settings`

2. Cari pengaturan SLA yang menggunakan jenis pasien tersebut

3. **Pilih salah satu:**
   - **Opsi A:** Hapus pengaturan SLA tersebut
   - **Opsi B:** Edit pengaturan SLA dan ubah jenis pasien ke yang lain

**Jika jenis pasien digunakan di Tiket:**

⚠️ **TIDAK BISA DIHAPUS** - Data yang sudah digunakan di tiket tidak dapat dihapus untuk menjaga integritas data historis.

**Solusi alternatif:**
- Nonaktifkan jenis pasien (ubah status menjadi "Tidak Aktif")
- Jenis pasien yang tidak aktif tidak akan muncul di form baru, tapi data lama tetap terjaga

#### Langkah 3: Hapus Jenis Pasien

1. **Klik tombol Hapus (ikon tempat sampah)** pada data yang ingin dihapus

2. **Konfirmasi penghapusan** di dialog yang muncul

3. **Sistem akan:**
   - Cek apakah data digunakan di tabel lain
   - Jika digunakan: Tampilkan pesan error yang jelas
   - Jika tidak digunakan: Hapus data dan refresh tabel

## Pesan Error yang Mungkin Muncul

### 1. Error: Digunakan di Pengaturan SLA

```
Gagal menghapus data. Jenis pasien ini masih digunakan di Pengaturan SLA. 
Hapus atau ubah pengaturan SLA terkait terlebih dahulu.
```

**Solusi:**
- Buka halaman Pengaturan SLA
- Hapus atau edit pengaturan SLA yang menggunakan jenis pasien ini
- Coba hapus lagi

### 2. Error: Digunakan di Tiket

```
Gagal menghapus data. Jenis pasien ini masih digunakan di tiket. 
Tidak dapat menghapus data yang sudah digunakan.
```

**Solusi:**
- Jangan hapus, gunakan fitur **Nonaktifkan** saja
- Edit jenis pasien dan ubah status menjadi "Tidak Aktif"

### 3. Error: Digunakan di Tiket Eksternal

```
Gagal menghapus data. Jenis pasien ini masih digunakan di tiket eksternal. 
Tidak dapat menghapus data yang sudah digunakan.
```

**Solusi:**
- Sama seperti error tiket, gunakan fitur **Nonaktifkan**

## Contoh Skenario Lengkap

### Skenario 1: Hapus Jenis Pasien yang Tidak Digunakan

1. Jenis Pasien: "Pasien Test" (baru dibuat, belum digunakan)
2. Klik tombol Hapus
3. Konfirmasi
4. ✅ **Berhasil dihapus**

### Skenario 2: Hapus Jenis Pasien yang Digunakan di SLA

1. Jenis Pasien: "Pasien BPJS" (digunakan di 2 pengaturan SLA)
2. Klik tombol Hapus
3. ❌ **Error:** "Jenis pasien ini masih digunakan di Pengaturan SLA"
4. Buka halaman Pengaturan SLA
5. Hapus atau edit 2 pengaturan SLA tersebut
6. Kembali ke halaman Jenis Pasien
7. Klik tombol Hapus lagi
8. ✅ **Berhasil dihapus**

### Skenario 3: Hapus Jenis Pasien yang Digunakan di Tiket

1. Jenis Pasien: "Pasien Umum" (digunakan di 50 tiket)
2. Klik tombol Hapus
3. ❌ **Error:** "Jenis pasien ini masih digunakan di tiket"
4. **Solusi:** Nonaktifkan saja
5. Klik tombol Edit
6. Ubah status menjadi "Tidak Aktif"
7. Klik "Perbarui"
8. ✅ **Jenis pasien dinonaktifkan** (tidak muncul di form baru, tapi data lama tetap ada)

## Testing

### Test 1: Edit Jenis Pasien

```bash
# Jalankan aplikasi
cd backend && npm run dev
cd frontend && npm run dev

# Buka browser
http://localhost:3002/master-data/patient-types

# Test edit:
1. Klik tombol Edit pada salah satu data
2. Ubah nama menjadi "Pasien Test Edit"
3. Ubah prioritas menjadi 5
4. Klik "Perbarui"
5. Verifikasi data berubah di tabel
```

### Test 2: Hapus Jenis Pasien (Tidak Digunakan)

```bash
# Buat data baru terlebih dahulu
1. Klik "Tambah Jenis Pasien"
2. Isi:
   - Nama: "Pasien Test Hapus"
   - Kode: "TEST_HAPUS"
   - Prioritas: 3
   - SLA: 24 jam
3. Klik "Simpan"

# Test hapus:
1. Klik tombol Hapus pada "Pasien Test Hapus"
2. Konfirmasi
3. Verifikasi data terhapus dari tabel
```

### Test 3: Hapus Jenis Pasien (Digunakan di SLA)

```bash
# Cek data yang digunakan di SLA
1. Buka halaman Pengaturan SLA
2. Lihat jenis pasien mana yang digunakan
3. Kembali ke halaman Jenis Pasien
4. Coba hapus jenis pasien yang digunakan di SLA
5. Verifikasi muncul error yang jelas
6. Hapus pengaturan SLA terkait
7. Coba hapus lagi
8. Verifikasi berhasil dihapus
```

## Kesimpulan

✅ **Perbaikan Selesai:**

1. **Backend:** Validasi sebelum hapus untuk cek foreign key constraint
2. **Frontend:** Pesan error yang lebih informatif dan jelas
3. **Dokumentasi:** Urutan lengkap cara edit dan hapus

✅ **Fitur yang Berfungsi:**

1. **Edit:** Bisa edit semua field dengan validasi yang baik
2. **Hapus:** Bisa hapus jika tidak digunakan, dengan pesan error yang jelas jika digunakan
3. **Validasi:** Cek penggunaan di 3 tabel (sla_settings, tickets, external_tickets)

✅ **User Experience:**

1. Pesan error yang jelas dan actionable
2. Panduan solusi langsung di pesan error
3. Alternatif nonaktifkan untuk data yang tidak bisa dihapus

## File yang Diubah

1. `backend/src/controllers/masterDataController.ts` - Fungsi deletePatientType dan updatePatientType
2. `frontend/src/pages/settings/PatientTypes.tsx` - Fungsi handleDelete
3. `PERBAIKAN_EDIT_HAPUS_PATIENT_TYPES_FINAL.md` - Dokumentasi ini

---

**Catatan:** Restart backend setelah perubahan untuk memastikan kode baru berjalan.
