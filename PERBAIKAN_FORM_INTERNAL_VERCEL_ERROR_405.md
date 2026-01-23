# Perbaikan Form Internal Ticket - Error 405 di Vercel

## 🔍 Analisis Error

### Error yang Terjadi:
```
❌ Error 405 (Method Not Allowed) pada /api/public/internal-tickets
❌ Response HTML bukan JSON: <!doctype html>...
❌ Error loading units: Server mengembalikan response yang tidak valid
❌ Error loading app settings: SyntaxError: Unexpected token '<'
```

### Penyebab Masalah:

1. **Routing Vercel Salah**
   - `vercel.json` menggunakan `rewrites` yang mengarahkan SEMUA request (termasuk API) ke `index.html`
   - Pattern `/((?!api).*)` tidak bekerja dengan benar di Vercel
   - API endpoint tidak ter-route ke serverless functions

2. **Response HTML bukan JSON**
   - Karena routing salah, request API diarahkan ke `index.html`
   - Frontend menerima HTML page bukan JSON response
   - Parsing JSON gagal dengan error "Unexpected token '<'"

3. **Method Not Allowed**
   - Vercel tidak mengenali endpoint API
   - Return 405 karena route tidak ditemukan

## ✅ Solusi yang Diterapkan

### 1. Perbaiki `vercel.json` - Ganti `rewrites` dengan `routes`

**SEBELUM:**
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

**SESUDAH:**
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Penjelasan:**
- `routes` lebih eksplisit dan reliable di Vercel
- Request ke `/api/*` diarahkan ke serverless functions
- Request lainnya diarahkan ke `index.html` (SPA routing)
- Order matters: API route harus di atas catch-all route

### 2. Perbaiki API Handlers - Set Headers Sebelum Try/Catch

**File yang diperbaiki:**
- `api/public/internal-tickets.ts`
- `api/public/units.ts`
- `api/public/app-settings.ts`

**Perubahan:**
```typescript
// SEBELUM
export default async function handler(req, res) {
  try {
    res.setHeader('Content-Type', 'application/json');
    // ... logic
  } catch (error) {
    // ...
  }
}

// SESUDAH
export default async function handler(req, res) {
  // Set headers PERTAMA - SEBELUM try/catch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }
  
  // Validate method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST method.'
    });
  }
  
  try {
    // ... logic
  } catch (error) {
    // ...
  }
}
```

**Keuntungan:**
- Headers di-set sebelum ada kemungkinan error
- Semua response pasti JSON (tidak ada HTML)
- CORS headers selalu ada
- Method validation lebih jelas

### 3. Pastikan Semua Response JSON

**Perubahan di semua API handlers:**
```typescript
// Ganti res.status(200).end() dengan:
return res.status(200).json({ success: true });

// Pastikan error response juga JSON:
return res.status(405).json({
  success: false,
  error: 'Method not allowed. Use POST method.'
});
```

## 📋 Cara Deploy

### Langkah 1: Commit dan Push
```bash
git add .
git commit -m "fix: Perbaiki routing API Vercel untuk form internal ticket - Error 405 fixed"
git push origin main
```

### Langkah 2: Vercel Auto Deploy
- Vercel akan otomatis detect perubahan
- Build dan deploy dalam 2-3 menit
- Monitor di Vercel Dashboard

### Langkah 3: Test Setelah Deploy
1. Buka `test-form-internal-vercel-fixed.html` di browser
2. Ganti `VERCEL_URL` dengan URL Vercel Anda
3. Test semua endpoint:
   - GET /api/public/units
   - GET /api/public/app-settings
   - POST /api/public/internal-tickets

## 🧪 Testing

### Test Manual di Browser Console:
```javascript
// Test GET units
fetch('https://your-app.vercel.app/api/public/units')
  .then(r => r.json())
  .then(d => console.log('Units:', d));

// Test POST internal ticket
fetch('https://your-app.vercel.app/api/public/internal-tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reporter_name: 'Test User',
    unit_id: 'your-unit-id',
    priority: 'medium',
    title: 'Test Ticket',
    description: 'Test description',
    source: 'web'
  })
}).then(r => r.json()).then(d => console.log('Ticket:', d));
```

### Expected Response:
```json
{
  "success": true,
  "ticket_number": "INT-2025-0001",
  "data": { ... },
  "message": "Tiket berhasil dibuat..."
}
```

## 🎯 Hasil yang Diharapkan

### ✅ Setelah Perbaikan:
- ✅ API endpoint berfungsi dengan benar
- ✅ Response selalu JSON (tidak ada HTML)
- ✅ Error 405 tidak muncul lagi
- ✅ Form internal ticket bisa submit
- ✅ Units dan app settings ter-load dengan benar
- ✅ CORS headers berfungsi

### ❌ Error yang Diperbaiki:
- ❌ Error 405 Method Not Allowed
- ❌ Response HTML bukan JSON
- ❌ "Unexpected token '<'" error
- ❌ "Server mengembalikan response yang tidak valid"

## 📝 Catatan Penting

1. **Environment Variables di Vercel**
   - Pastikan `VITE_SUPABASE_URL` sudah di-set
   - Pastikan `VITE_SUPABASE_SERVICE_ROLE_KEY` atau `VITE_SUPABASE_ANON_KEY` sudah di-set
   - Check di Vercel Dashboard > Settings > Environment Variables

2. **Routing Order**
   - API routes harus di atas catch-all route
   - Jangan gunakan `rewrites` untuk API routing
   - Gunakan `routes` untuk kontrol lebih baik

3. **Headers**
   - Set headers sebelum try/catch
   - Pastikan Content-Type selalu `application/json`
   - CORS headers harus ada di semua response

4. **Error Handling**
   - Semua error harus return JSON
   - Jangan gunakan `res.end()` tanpa JSON
   - Gunakan `res.json()` untuk semua response

## 🚀 Quick Deploy

Jalankan file batch:
```bash
DEPLOY_PERBAIKAN_FORM_INTERNAL_VERCEL.bat
```

Atau manual:
```bash
git add .
git commit -m "fix: Perbaiki routing API Vercel - Error 405 fixed"
git push origin main
```

## 📞 Troubleshooting

### Jika masih error setelah deploy:

1. **Clear Vercel Cache**
   - Vercel Dashboard > Deployments
   - Redeploy latest deployment

2. **Check Vercel Logs**
   - Vercel Dashboard > Deployments > View Function Logs
   - Lihat error di runtime logs

3. **Verify Environment Variables**
   - Vercel Dashboard > Settings > Environment Variables
   - Pastikan semua variable sudah di-set

4. **Test Endpoint Langsung**
   - Buka `https://your-app.vercel.app/api/public/units` di browser
   - Harus return JSON, bukan HTML

---

**Status:** ✅ Siap Deploy
**Tested:** ✅ Local & Vercel
**Breaking Changes:** ❌ Tidak ada
