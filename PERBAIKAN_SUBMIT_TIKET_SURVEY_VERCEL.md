# Perbaikan Submit Tiket Internal dan Survey di Vercel

## Masalah yang Ditemukan

Dari screenshot error yang dilampirkan, ditemukan beberapa masalah:

1. **Error "Server mengembalikan response yang tidak valid"**
   - API tidak selalu mengembalikan JSON yang valid
   - Content-Type header tidak konsisten

2. **Error 405 (Method Not Allowed)**
   - Terjadi saat submit tiket internal
   - Response error tidak dalam format JSON

3. **Error "SyntaxError: Unexpected token"**
   - Terjadi saat load app settings
   - Server mengembalikan HTML atau text bukan JSON

4. **Type tiket salah**
   - Menggunakan 'complaint' seharusnya 'internal'
   - Menyebabkan constraint error di database

## Perbaikan yang Dilakukan

### 1. File: `api/public/internal-tickets.ts`
- ✅ Ubah type dari 'complaint' menjadi 'internal'
- ✅ Pastikan semua response return JSON yang valid
- ✅ Set Content-Type header di awal handler
- ✅ Improved error handling dengan JSON response

### 2. File: `api/public/surveys.ts`
- ✅ Pastikan semua response return JSON yang valid
- ✅ Set Content-Type header di awal handler
- ✅ Improved error handling

### 3. File: `api/public/app-settings.ts`
- ✅ Return default settings jika error
- ✅ Pastikan selalu return JSON yang valid
- ✅ Improved error handling

## Testing

Setelah deploy ke Vercel, test dengan:

1. **Submit Tiket Internal**
   ```
   URL: https://your-app.vercel.app/form/internal?unit_id=xxx
   Expected: Tiket berhasil dibuat dengan type='internal'
   ```

2. **Submit Survey**
   ```
   URL: https://your-app.vercel.app/form/survey?unit_id=xxx
   Expected: Survey berhasil dikirim
   ```

3. **Load App Settings**
   ```
   URL: https://your-app.vercel.app/api/public/app-settings
   Expected: Return JSON dengan settings atau default values
   ```

## Catatan Penting

- Semua API endpoint sekarang SELALU return JSON
- Error handling lebih robust
- Type tiket sudah diperbaiki ke 'internal'
- Content-Type header sudah di-set dengan benar

## Deploy ke Vercel

```bash
# Commit perubahan
git add .
git commit -m "fix: perbaiki submit tiket internal dan survey di Vercel"

# Push ke repository
git push origin main

# Vercel akan auto-deploy
```
