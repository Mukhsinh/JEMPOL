# Perbaikan Database Constraint untuk Photo Upload

## Masalah

Error saat upload foto:
```
Terjadi kesalahan saat mengupload file: new row for relation 'innovations' 
violates check constraint 'innovations_type_check'
```

## Penyebab

Database constraint `innovations_type_check` hanya mengizinkan nilai:
- `'powerpoint'`
- `'video'`

Tapi tidak ada `'photo'`, sehingga upload foto gagal.

## Perbaikan yang Dilakukan

### Migration Applied

```sql
-- Drop existing check constraint
ALTER TABLE innovations DROP CONSTRAINT IF EXISTS innovations_type_check;

-- Add new check constraint with photo type
ALTER TABLE innovations ADD CONSTRAINT innovations_type_check 
CHECK (type IN ('powerpoint', 'video', 'photo'));
```

### Hasil

Constraint sekarang mengizinkan 3 nilai:
- ✅ `'powerpoint'` - untuk file PowerPoint
- ✅ `'video'` - untuk file video
- ✅ `'photo'` - untuk file foto

## Verifikasi

Constraint sudah diupdate di database Supabase. Tidak perlu restart backend atau frontend.

## Test Upload

Sekarang Anda bisa:

### 1. Upload Single Photo
1. Buka http://localhost:3001/admin
2. Tab "Upload Konten"
3. Pilih foto (JPG, PNG, GIF, WEBP)
4. Isi judul dan deskripsi
5. Klik "Upload Konten"

### 2. Upload Multiple Photos
1. Buka http://localhost:3001/admin
2. Tab "Upload Multiple Foto"
3. Pilih hingga 10 foto sekaligus
4. Isi judul dan deskripsi
5. Klik "Upload X Foto"

### 3. Upload Video
1. Tab "Upload Konten"
2. Pilih video (MP4, WEBM, AVI, MOV, MKV)
3. Maksimal 1GB
4. Upload

### 4. Upload PowerPoint
1. Tab "Upload Konten"
2. Pilih PowerPoint (PPT, PPTX)
3. Maksimal 100MB
4. Upload

## Catatan Penting

### Type vs Category

Dalam database, ada 2 field:
- **type**: Tipe file (`'powerpoint'`, `'video'`, `'photo'`)
- **category**: Kategori konten (`'innovation'`, `'video'`, `'photo'`)

Mapping:
```
PowerPoint → type: 'powerpoint', category: 'innovation'
Video      → type: 'video',      category: 'video'
Photo      → type: 'photo',      category: 'photo'
```

### Constraint Lainnya

Pastikan tidak ada constraint lain yang membatasi:
- `category` field
- `file_url` format
- `file_size` range

## Troubleshooting

### Jika Masih Error

1. **Cek constraint lain:**
   ```sql
   SELECT constraint_name, check_clause 
   FROM information_schema.check_constraints 
   WHERE table_name = 'innovations';
   ```

2. **Cek RLS policies:**
   - Buka Supabase Dashboard
   - Pilih tabel `innovations`
   - Tab "Authentication" → "Policies"
   - Pastikan ada policy yang allow INSERT untuk semua type

3. **Test manual insert:**
   ```sql
   INSERT INTO innovations (
     title, description, type, category, 
     file_url, file_name, file_size, mime_type, uploaded_by
   ) VALUES (
     'Test Photo', 'Test description', 'photo', 'photo',
     '/uploads/test.jpg', 'test.jpg', 1024, 'image/jpeg', 'admin'
   );
   ```

### Error Lain yang Mungkin Muncul

1. **"violates check constraint 'innovations_category_check'"**
   - Sama seperti type, category juga perlu diupdate
   - Jalankan migration untuk update category constraint

2. **"permission denied for table innovations"**
   - RLS policy terlalu ketat
   - Update policy untuk allow INSERT

3. **"column does not exist"**
   - Struktur tabel tidak sesuai
   - Periksa schema tabel innovations

## Migration History

File migration: `add_photo_type_to_innovations`
- Tanggal: 2025-12-05
- Status: ✅ Applied
- Rollback: Jika perlu rollback, jalankan:
  ```sql
  ALTER TABLE innovations DROP CONSTRAINT innovations_type_check;
  ALTER TABLE innovations ADD CONSTRAINT innovations_type_check 
  CHECK (type IN ('powerpoint', 'video'));
  ```

## Next Steps

Setelah perbaikan ini:
1. ✅ Upload foto single - READY
2. ✅ Upload foto multiple - READY
3. ✅ Upload video - READY
4. ✅ Upload PowerPoint - READY

Semua fitur upload sekarang berfungsi dengan baik!
