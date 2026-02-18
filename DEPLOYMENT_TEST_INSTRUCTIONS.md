# Instruksi Testing Deployment Vercel

## Perubahan yang Sudah Dilakukan

✅ **Task 1**: Backup dan analisis konfigurasi
✅ **Task 2**: Update vercel.json dengan rewrite rules yang benar
✅ **Task 3**: Verifikasi konfigurasi Vite
✅ **Task 4**: Build dan verifikasi output structure
✅ **Task 5**: Create route test helpers
✅ **Task 6.1**: Push changes ke GitHub (Vercel auto-deploy triggered)

## Perubahan Konfigurasi

### vercel.json
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ]
}
```

**Perubahan utama:**
1. ❌ Hapus `cleanUrls: true` (menyebabkan konflik)
2. ✅ Ganti regex pattern dengan explicit rules
3. ✅ API routes mendapat prioritas pertama
4. ✅ Semua route lain diarahkan ke index.html

## Langkah Testing Manual

### 1. Tunggu Deployment Selesai

Cek status deployment di Vercel Dashboard:
- https://vercel.com/dashboard
- Tunggu sampai status "Ready"
- Copy URL deployment (contoh: https://jempol-xxx.vercel.app)

### 2. Test Manual di Browser

#### Test Public Routes (Task 6.2)
Buka dan refresh setiap route ini:
- [ ] `/login` - Direct access ✓ Refresh ✓
- [ ] `/lacak-tiket` - Direct access ✓ Refresh ✓
- [ ] `/form/internal` - Direct access ✓ Refresh ✓
- [ ] `/form/eksternal` - Direct access ✓ Refresh ✓
- [ ] `/form/survey` - Direct access ✓ Refresh ✓

**Expected:** Tidak ada error 404, halaman muncul dengan benar

#### Test Protected Routes (Task 6.3)
Login dulu, kemudian test:
- [ ] `/dashboard` - Direct access ✓ Refresh ✓
- [ ] `/tickets` - Direct access ✓ Refresh ✓
- [ ] `/users` - Direct access ✓ Refresh ✓
- [ ] `/settings` - Direct access ✓ Refresh ✓

**Expected:** Tidak ada error 404, halaman muncul dengan benar

#### Test Routes dengan Parameters (Task 6.4)
- [ ] `/tickets/123` - Direct access ✓ Refresh ✓
- [ ] `/m/test-code` - Direct access ✓ Refresh ✓

**Expected:** Tidak ada error 404, halaman muncul (meskipun data tidak ada)

#### Test API Endpoints (Task 6.5)
Buka DevTools Console dan jalankan:

```javascript
// Test API endpoint
fetch('/api/public/tickets')
  .then(r => r.json())
  .then(d => console.log('API OK:', d))
  .catch(e => console.error('API Error:', e));
```

**Expected:** Response JSON, bukan HTML

### 3. Test Otomatis (Optional)

Jika ingin test otomatis, jalankan:

```bash
# Update URL di file test
# Edit: kiss/src/test/manual/vercelDeploymentTest.ts
# Ganti: const VERCEL_URL = 'https://your-actual-url.vercel.app'

# Install tsx jika belum ada
npm install -g tsx

# Run test
VERCEL_URL=https://your-actual-url.vercel.app npx tsx kiss/src/test/manual/vercelDeploymentTest.ts
```

## Checklist Verifikasi

### ✅ Harus Berhasil
- [ ] Semua public routes dapat diakses langsung
- [ ] Semua public routes dapat di-refresh tanpa 404
- [ ] Semua protected routes dapat diakses (dengan auth)
- [ ] Semua protected routes dapat di-refresh tanpa 404
- [ ] Routes dengan parameter dapat diakses dan di-refresh
- [ ] API endpoints mengembalikan JSON, bukan HTML
- [ ] Static assets (CSS, JS) dapat dimuat

### ❌ Harus Tidak Terjadi
- [ ] Error 404 saat refresh halaman
- [ ] API endpoints mengembalikan HTML
- [ ] Static assets mengembalikan HTML
- [ ] Infinite redirect loop

## Troubleshooting

### Jika masih ada 404 saat refresh:
1. Cek Vercel logs untuk error
2. Verify vercel.json sudah ter-deploy (cek di Vercel dashboard)
3. Cek apakah build output ada index.html di root
4. Clear browser cache dan coba lagi

### Jika API mengembalikan HTML:
1. Cek rewrite rules order di vercel.json
2. API rules harus di atas SPA rules
3. Redeploy jika perlu

### Jika static assets tidak muncul:
1. Cek path assets di build output
2. Verify base path di vite.config.ts adalah '/'
3. Cek browser DevTools Network tab untuk path yang diminta

## Next Steps

Setelah semua test berhasil:
- [ ] Mark Task 6.2 - 6.5 sebagai complete
- [ ] Lanjut ke Task 7: Checkpoint - Verify preview deployment
- [ ] Jika ada issue, fix dan redeploy
- [ ] Jika semua OK, lanjut ke Task 9: Deploy ke production

## Rollback Plan

Jika ada masalah serius:
```bash
# Restore backup
cp vercel.json.backup vercel.json
git add vercel.json
git commit -m "rollback: Restore previous vercel.json"
git push origin main
```
