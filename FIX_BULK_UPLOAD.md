# Perbaikan Bulk Photo Upload

## Langkah-langkah Perbaikan

### 1. Restart Backend Server

Backend perlu di-restart untuk menerapkan perubahan kode:

```bash
# Stop semua proses Node.js yang berjalan
# Tekan Ctrl+C di terminal backend

# Atau gunakan script
STOP_ALL.bat

# Kemudian start ulang
START_ALL.bat
```

### 2. Test Koneksi Supabase (Opsional)

Untuk memastikan koneksi ke Supabase berfungsi:

```bash
cd backend
node test-bulk-upload.js
```

Jika ada error, periksa:
- File `.env` di folder backend
- SUPABASE_URL dan SUPABASE_ANON_KEY sudah benar
- Tabel `innovations` ada di Supabase

### 3. Coba Upload Lagi

1. Buka halaman Admin: http://localhost:3001/admin
2. Klik tab "Upload Multiple Foto"
3. Isi judul dan deskripsi
4. Pilih 2-3 foto untuk test (jangan terlalu banyak dulu)
5. Klik "Upload X Foto"

### 4. Periksa Console Log

Jika masih error, periksa:

**Browser Console (F12):**
- Lihat error message di tab Console
- Lihat request/response di tab Network

**Backend Terminal:**
- Akan muncul log detail seperti:
  ```
  === BULK PHOTO UPLOAD START ===
  Number of files: 3
  Starting to upload photos to database...
  Uploading photo 1/3: ...
  ```

## Troubleshooting

### Error: "Gagal mengupload semua foto"

**Kemungkinan penyebab:**

1. **Backend belum di-restart**
   - Solusi: Stop dan start ulang backend

2. **Koneksi Supabase bermasalah**
   - Solusi: Cek file `.env`, pastikan SUPABASE_URL dan SUPABASE_ANON_KEY benar
   - Test dengan: `node backend/test-bulk-upload.js`

3. **Tabel innovations tidak ada atau struktur salah**
   - Solusi: Periksa di Supabase Dashboard, pastikan tabel `innovations` ada
   - Kolom yang diperlukan: title, description, type, category, file_url, file_name, file_size, mime_type, uploaded_by

4. **RLS (Row Level Security) terlalu ketat**
   - Solusi: Di Supabase Dashboard, periksa RLS policies untuk tabel `innovations`
   - Pastikan ada policy yang mengizinkan INSERT

### Error: "File terlalu besar"

- Maksimal 50MB per foto
- Maksimal 10 foto sekaligus
- Kompres foto jika terlalu besar

### Error: "Tipe file tidak valid"

- Hanya foto yang diperbolehkan: JPG, PNG, GIF, WEBP
- Pastikan file yang dipilih adalah foto, bukan video atau dokumen

## Perubahan yang Sudah Dilakukan

1. ✅ Menambahkan endpoint `/api/innovations/bulk-photos`
2. ✅ Fungsi `handleBulkPhotoUpload` untuk proses multiple files
3. ✅ Komponen `BulkPhotoUpload` di frontend
4. ✅ Tab "Upload Multiple Foto" di Admin Panel
5. ✅ Logging detail untuk debugging
6. ✅ Validasi file type dan size
7. ✅ Preview foto sebelum upload
8. ✅ Progress tracking

## Jika Masih Bermasalah

Kirim screenshot dari:
1. Browser Console (F12 → Console tab)
2. Backend Terminal (log output)
3. Error message yang muncul

Atau coba upload single foto dulu di tab "Upload Konten" untuk memastikan koneksi Supabase berfungsi.
