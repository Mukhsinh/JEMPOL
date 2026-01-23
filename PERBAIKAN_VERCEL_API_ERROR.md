# Perbaikan Error API Vercel - JSON Parse Error

## 🔴 Masalah
Error di aplikasi Vercel:
```
❌ Error parsing JSON: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

Error ini terjadi karena API endpoint mengembalikan HTML (halaman error 404) bukan JSON.

## 🔍 Penyebab
1. **Routing Vercel tidak benar** - Request ke `/api/public/units` tidak di-route ke serverless function
2. **Vercel mengembalikan index.html** untuk semua request yang tidak dikenali
3. **Frontend mencoba parse HTML sebagai JSON** → Error

## ✅ Solusi yang Diterapkan

### 1. Perbaikan vercel.json
**Sebelum:**
```json
"routes": [
  {
    "src": "/api/public/units",
    "dest": "/api/public/units.ts"
  }
]
```

**Sesudah:**
```json
"rewrites": [
  {
    "source": "/api/public/units",
    "destination": "/api/public/units"
  }
],
"routes": [
  {
    "src": "/api/public/(.*)",
    "dest": "/api/public/$1"
  }
]
```

**Penjelasan:**
- `rewrites` lebih reliable untuk API routing di Vercel
- Catch-all route `/api/public/(.*)` menangkap semua endpoint public
- Tidak perlu `.ts` extension di destination

### 2. Perbaikan api/public/units.ts
**Perubahan:**
- Set headers di LUAR try-catch block
- Pastikan SELALU return JSON, bahkan saat error
- Tambah error handling yang lebih robust

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set headers PERTAMA
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // ... logic ...
    
  } catch (error) {
    // SELALU return JSON
    return res.status(200).json({
      success: false,
      error: 'Error message',
      data: []
    });
  }
}
```

### 3. Perbaikan frontend/src/services/api.ts
**Tambahan:**
- Deteksi response HTML sebelum parse JSON
- Return error object yang konsisten
- Log yang lebih informatif

```typescript
transformResponse: [(data, headers) => {
  // Cek apakah response adalah HTML
  if (typeof data === 'string' && data.trim().startsWith('<!')) {
    return {
      success: false,
      error: 'Server mengembalikan halaman HTML',
      isHtmlError: true
    };
  }
  
  // Parse JSON dengan error handling
  try {
    return JSON.parse(data);
  } catch (e) {
    return {
      success: false,
      error: 'Response bukan JSON valid'
    };
  }
}]
```

## 📋 Checklist Deploy

### A. Sebelum Deploy
- [x] Perbaiki vercel.json (rewrites + routes)
- [x] Perbaiki api/public/units.ts (headers di luar try-catch)
- [x] Perbaiki frontend error handling (deteksi HTML)
- [ ] Verifikasi semua file API public lainnya
- [ ] Test lokal dengan `npm run build && npm run preview`

### B. Environment Variables di Vercel
Pastikan sudah di-set:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_SUPABASE_SERVICE_ROLE_KEY`

### C. Setelah Deploy
- [ ] Test endpoint: `https://your-app.vercel.app/api/public/units`
- [ ] Cek response adalah JSON (bukan HTML)
- [ ] Cek browser console tidak ada error parsing JSON
- [ ] Test semua form yang menggunakan units dropdown

## 🧪 Testing

### Test Endpoint Langsung
```bash
curl https://your-app.vercel.app/api/public/units
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Unit Name",
      "code": "CODE"
    }
  ]
}
```

### Test di Browser Console
```javascript
fetch('/api/public/units')
  .then(r => r.json())
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Error:', err));
```

## 🔧 Troubleshooting

### Jika masih error setelah deploy:

1. **Cek Vercel Logs**
   - Buka Vercel Dashboard → Project → Deployments
   - Klik deployment terakhir → Function Logs
   - Cari error di `/api/public/units`

2. **Cek Response Headers**
   ```bash
   curl -I https://your-app.vercel.app/api/public/units
   ```
   Harus ada: `Content-Type: application/json`

3. **Redeploy dengan Clear Cache**
   - Vercel Dashboard → Settings → Clear Build Cache
   - Deploy ulang

4. **Cek File Structure**
   ```
   api/
   └── public/
       ├── units.ts
       ├── internal-tickets.ts
       ├── external-tickets.ts
       ├── surveys.ts
       └── app-settings.ts
   ```

## 📝 Catatan Penting

1. **Jangan gunakan `.ts` extension** di vercel.json destination
2. **Selalu set Content-Type header** di awal function
3. **Selalu return JSON** bahkan saat error
4. **Gunakan rewrites** untuk API routing, bukan hanya routes
5. **Test lokal** dengan production build sebelum deploy

## 🚀 Deploy Command

```bash
# Verifikasi konfigurasi
node fix-vercel-api-endpoints.js

# Build lokal untuk test
cd frontend && npm run build && npm run preview

# Deploy ke Vercel
vercel --prod
```

## ✅ Status
- [x] Identifikasi masalah
- [x] Perbaiki vercel.json
- [x] Perbaiki api/public/units.ts
- [x] Perbaiki frontend error handling
- [ ] Deploy ke Vercel
- [ ] Verifikasi fix berhasil
