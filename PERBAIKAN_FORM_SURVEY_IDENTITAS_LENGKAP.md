# Perbaikan Form Survey - Identitas Lengkap

## Perubahan yang Dilakukan

Menambahkan field identitas lengkap pada form survey:

### Field Baru di Step 1 (Identitas Diri):
1. **Usia** - Radio button dengan pilihan: < 20 Th, 20-40 Th, 41-60 Th, > 60 Th
2. **Jenis Kelamin** - Radio button: Laki-laki / Perempuan  
3. **Pendidikan Terakhir** - Dropdown: SD, SMP, SMA/SMK, D1/D2/D3, D4/S1, S2, S3
4. **Pekerjaan** - Text input: PNS, Swasta, Wiraswasta, dll
5. **Alamat Domisili** - 4 dropdown:
   - Provinsi
   - Kota/Kabupaten
   - Kecamatan
   - Kelurahan/Desa

## File yang Diupdate

1. ✅ `frontend/src/pages/survey/PublicSurveyForm.tsx` - Sudah ada field lengkap
2. 🔄 `frontend/src/pages/public/DirectSurveyForm.tsx` - Perlu update Step 1

## Status

Field identitas sudah ada di PublicSurveyForm.tsx. DirectSurveyForm.tsx perlu diupdate untuk menambahkan field yang sama di Step 1.

## Cara Test

1. Jalankan aplikasi: `npm run dev`
2. Buka form survey: `http://localhost:3002/form/survey?unit_id=xxx&unit_name=xxx`
3. Isi Step 1 dengan data identitas lengkap
4. Lanjutkan ke Step 2 untuk penilaian layanan
5. Submit form

## Catatan

- Field usia, jenis kelamin, pendidikan, pekerjaan, dan alamat bersifat opsional
- Hanya nomor HP yang wajib diisi (required)
- Data alamat menggunakan dropdown bertingkat (provinsi → kota → kecamatan → kelurahan)
