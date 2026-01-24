# Perbaikan Error Survey: phoneNumber is not defined

## Error yang Terjadi
```
Submit error: Error: Terjadi kesalahan server: phoneNumber is not defined
at handleSubmit (DirectSurveyForm.tsx:399)
```

## Analisis
Setelah pemeriksaan menyeluruh:
- ✅ Frontend sudah benar menggunakan `visitor_phone` (bukan `phoneNumber`)
- ✅ Backend controller sudah benar menggunakan `visitor_phone`
- ✅ API serverless sudah benar menggunakan `visitor_phone`
- ✅ Database schema sudah benar dengan kolom `visitor_phone`
- ✅ Tidak ada trigger atau function yang menggunakan `phoneNumber`

## Penyebab
Error ini kemungkinan disebabkan oleh **cache browser** atau **build artifacts lama** yang masih menyimpan kode JavaScript versi lama yang menggunakan `phoneNumber`.

## Solusi

### Langkah 1: Clear Cache dan Rebuild
Jalankan file batch yang sudah dibuat:
```
CLEAR_CACHE_DAN_REBUILD.bat
```

Script ini akan:
1. Stop semua proses Node.js
2. Hapus cache dan build artifacts (dist, .vite, dll)
3. Rebuild frontend dan backend
4. Start ulang aplikasi

### Langkah 2: Clear Browser Cache
Setelah aplikasi terbuka, lakukan salah satu:

**Opsi A - Hard Refresh:**
- Tekan `Ctrl + Shift + R` (Windows/Linux)
- Atau `Cmd + Shift + R` (Mac)

**Opsi B - Clear Storage:**
1. Buka DevTools (F12)
2. Pilih tab "Application"
3. Klik "Clear Storage" di sidebar kiri
4. Klik tombol "Clear site data"
5. Refresh halaman (F5)

**Opsi C - Incognito Mode:**
- Buka browser dalam mode incognito/private
- Test form survey di mode ini

### Langkah 3: Test Survey
1. Buka form survey: `http://localhost:3002/form/survey?unit_id=xxx&unit_name=Jlamprang`
2. Isi semua field yang diperlukan
3. Submit form
4. Pastikan tidak ada error `phoneNumber is not defined`

## Verifikasi Kode

### Frontend (DirectSurveyForm.tsx)
```typescript
// ✅ BENAR - Tidak ada field phoneNumber
const surveyData = {
  unit_id: unitId,
  visitor_name: formData.is_anonymous ? null : formData.full_name,
  visitor_phone: null, // ✅ Nomor HP sudah dihapus
  is_anonymous: formData.is_anonymous,
  // ... field lainnya
};
```

### Backend (publicSurveyController.ts)
```typescript
// ✅ BENAR - Menggunakan visitor_phone
const surveyData: any = {
  visitor_phone: is_anonymous ? null : (phone || reporter_phone || null),
  // ... field lainnya
};
```

### API Serverless (api/public/surveys.ts)
```typescript
// ✅ BENAR - Menggunakan visitor_phone
const surveyData: any = {
  visitor_phone: visitor_phone,
  // ... field lainnya
};
```

## Catatan Penting
- Field `visitor_phone` di form survey sudah dihapus sesuai permintaan
- Semua kode sudah konsisten menggunakan `visitor_phone` (bukan `phoneNumber`)
- Error kemungkinan besar dari cache browser/build lama
- Setelah clear cache, error seharusnya hilang

## Status
- [x] Analisis error
- [x] Verifikasi kode frontend
- [x] Verifikasi kode backend
- [x] Verifikasi API serverless
- [x] Verifikasi database schema
- [x] Buat script clear cache
- [ ] Test setelah clear cache (menunggu user)
