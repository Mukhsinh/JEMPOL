# Perbaikan Submit Tiket Internal - Error App Settings

## 🔍 Analisa Masalah

### Error yang Terjadi
```
DirectInternalTicketForm-CLIzsNaz.js:1 ❌ Error loading app settings: 
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON

❌ Non-JSON response: <!doctype html><html lang="id"><head><meta charset="UTF-8" />
```

### Penyebab
1. **Endpoint `/api/public/app-settings` mengembalikan HTML alih-alih JSON**
   - Kemungkinan routing Vercel tidak mengenali endpoint
   - Atau ada masalah dengan build/deployment
   - Atau cache browser mengembalikan HTML page

2. **Error terjadi saat loading app settings, bukan saat submit**
   - Form mencoba load app settings untuk footer
   - Jika gagal, error muncul di console
   - Tidak menghalangi submit, tapi mengganggu UX

## ✅ Solusi yang Diterapkan

### 1. Improved Error Handling dengan Retry Logic
**File**: `frontend/src/pages/public/DirectInternalTicketForm.tsx`

```typescript
// Load app settings untuk footer dengan retry logic
useEffect(() => {
  const fetchAppSettings = async (retryCount = 0) => {
    try {
      console.log(`🔄 Fetching app settings (attempt ${retryCount + 1})...`);
      
      // Tambahkan cache busting parameter
      const timestamp = Date.now();
      const response = await fetch(`/api/public/app-settings?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache' // Disable caching
      });
      
      // Validasi content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        
        // Retry jika masih ada kesempatan
        if (retryCount < 2) {
          console.log(`🔄 Retrying in ${(retryCount + 1) * 1000}ms...`);
          setTimeout(() => fetchAppSettings(retryCount + 1), (retryCount + 1) * 1000);
          return;
        }
        
        throw new Error('Server mengembalikan response yang tidak valid');
      }
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAppSettings(result.data);
          console.log('✅ App settings loaded:', result.data);
        }
      }
    } catch (err: any) {
      console.error('❌ Error loading app settings:', err);
      
      // Retry jika masih ada kesempatan
      if (retryCount < 2) {
        setTimeout(() => fetchAppSettings(retryCount + 1), (retryCount + 1) * 1000);
        return;
      }
      
      // Set default settings jika gagal load setelah retry
      console.log('⚠️ Using default app settings');
      setAppSettings({
        institution_name: 'Rumah Sakit',
        institution_address: '',
        contact_phone: '',
        contact_email: '',
        website: '',
        app_footer: ''
      });
    }
  };
  
  fetchAppSettings();
}, []);
```

### 2. Fitur Perbaikan

#### a. Cache Busting
- Menambahkan timestamp parameter `?t=${Date.now()}`
- Mencegah browser cache mengembalikan HTML page
- Memastikan request selalu fresh

#### b. Retry Logic
- Maksimal 3 percobaan (initial + 2 retry)
- Delay bertambah: 1s, 2s
- Jika semua gagal, gunakan default settings

#### c. Content-Type Validation
- Validasi response adalah JSON sebelum parse
- Log error jika response HTML
- Mencegah SyntaxError saat JSON.parse()

#### d. Fallback ke Default Settings
- Jika semua retry gagal, gunakan default
- Form tetap bisa digunakan tanpa app settings
- Tidak menghalangi submit tiket

### 3. File Test untuk Debugging
**File**: `test-app-settings-endpoint.html`

File HTML untuk test endpoint secara manual:
- Test endpoint langsung
- Test dengan retry logic
- Lihat response headers dan content-type
- Auto-test saat halaman dimuat

## 🧪 Cara Testing

### 1. Test Manual dengan Browser
```bash
# Buka file test
start test-app-settings-endpoint.html
```

### 2. Test di Aplikasi
```bash
# Jalankan aplikasi
npm run dev

# Buka form internal
http://localhost:5173/form/internal?unit_id=xxx&unit_name=Test

# Lihat console untuk log:
# - 🔄 Fetching app settings (attempt 1)...
# - ✅ App settings loaded: {...}
# atau
# - ⚠️ Using default app settings
```

### 3. Test di Production (Vercel)
```bash
# Deploy ke Vercel
vercel --prod

# Test endpoint langsung
curl https://your-app.vercel.app/api/public/app-settings

# Harus return JSON:
# {"success":true,"data":{...}}
```

## 📋 Checklist Verifikasi

- [x] Error handling untuk non-JSON response
- [x] Retry logic dengan delay
- [x] Cache busting dengan timestamp
- [x] Fallback ke default settings
- [x] Logging untuk debugging
- [x] File test untuk manual testing
- [ ] Test di production Vercel
- [ ] Verifikasi endpoint mengembalikan JSON
- [ ] Verifikasi form bisa submit tanpa app settings

## 🔧 Troubleshooting

### Jika Masih Error di Production

1. **Cek Vercel Logs**
   ```bash
   vercel logs
   ```

2. **Cek Endpoint Langsung**
   ```bash
   curl -H "Accept: application/json" https://your-app.vercel.app/api/public/app-settings
   ```

3. **Cek vercel.json Routing**
   - Pastikan ada rewrite untuk `/api/public/app-settings`
   - Pastikan headers Content-Type sudah benar

4. **Rebuild dan Redeploy**
   ```bash
   vercel --prod --force
   ```

5. **Clear Vercel Cache**
   - Di Vercel Dashboard > Settings > Clear Cache
   - Atau gunakan `?t=${timestamp}` di URL

## 📝 Catatan Penting

1. **App Settings Bersifat Optional**
   - Form tetap bisa digunakan tanpa app settings
   - Default settings akan digunakan jika gagal load
   - Tidak menghalangi submit tiket

2. **Retry Logic Tidak Blocking**
   - Retry dilakukan di background
   - User bisa langsung mengisi form
   - Tidak mengganggu UX

3. **Cache Busting Penting**
   - Browser cache bisa menyebabkan masalah
   - Timestamp parameter memastikan fresh request
   - Disable cache dengan `cache: 'no-cache'`

## 🎯 Hasil yang Diharapkan

1. ✅ Form bisa load tanpa error
2. ✅ App settings berhasil dimuat (atau fallback ke default)
3. ✅ Submit tiket berhasil
4. ✅ Tidak ada error di console
5. ✅ Footer menampilkan informasi institusi

## 📚 File yang Diubah

1. `frontend/src/pages/public/DirectInternalTicketForm.tsx`
   - Improved error handling
   - Retry logic
   - Cache busting
   - Fallback settings

2. `test-app-settings-endpoint.html` (NEW)
   - File test untuk debugging
   - Manual testing endpoint

## 🚀 Next Steps

1. Test di localhost
2. Deploy ke Vercel
3. Test di production
4. Verifikasi endpoint mengembalikan JSON
5. Monitor Vercel logs untuk error
