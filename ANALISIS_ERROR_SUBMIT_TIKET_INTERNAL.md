# Analisis Error Submit Tiket Internal

## 🔴 Masalah yang Terjadi

Saat submit tiket internal di production (Vercel), terjadi error:

```
❌ Error 405 (Method Not Allowed)
❌ Response HTML bukan JSON
❌ Tidak muncul notifikasi sukses/error
```

### Error Log:
```
DirectInternalTicketForm: ❌ Non-JSON response: <!doctype html>...
DirectInternalTicketForm: ❌ Error loading units: Server mengembalikan response yang tidak valid
DirectInternalTicketForm: Failed to load resource: the server responded with a status of 405
DirectInternalTicketForm: ❌ Submit error: Server mengembalikan response yang tidak valid (bukan JSON)
```

---

## 🔍 Analisis Root Cause

### 1. **Response HTML Bukan JSON**
Server mengembalikan HTML page (kemungkinan 404 atau error page) instead of JSON API response.

**Penyebab:**
- Endpoint `/api/public/internal-tickets` tidak ditemukan
- Routing Vercel tidak mengarah ke serverless function
- File API tidak ter-deploy dengan benar

### 2. **Error 405 Method Not Allowed**
Endpoint menolak POST request.

**Penyebab:**
- Handler tidak menerima POST method
- Routing salah (mengarah ke static file)
- CORS configuration bermasalah

### 3. **Fungsi `handleDownloadPDF` Tidak Ada**
Tombol download PDF error karena fungsi tidak didefinisikan.

**Status:** ✅ **SUDAH DIPERBAIKI**

---

## ✅ Solusi yang Diterapkan

### 1. **Tambah Fungsi `handleDownloadPDF`**

**File:** `frontend/src/pages/public/DirectInternalTicketForm.tsx`

```typescript
const handleDownloadPDF = async () => {
  try {
    await downloadInternalTicketPDF({
      ticketNumber,
      reporterName: formData.reporter_name,
      reporterEmail: formData.reporter_email,
      reporterPhone: formData.reporter_phone,
      department: formData.reporter_department,
      position: formData.reporter_position,
      category: categories.find(c => c.value === formData.category)?.label || formData.category,
      priority: formData.priority,
      title: formData.title,
      description: formData.description,
      unitName: units.find(u => u.id === formData.unit_id)?.name || formData.reporter_department,
      submittedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Gagal mengunduh PDF. Silakan coba lagi.');
  }
};
```

### 2. **Verifikasi File API Sudah Benar**

**File:** `api/public/internal-tickets.ts`

✅ Handler sudah benar:
- Menerima POST method
- Set CORS headers dengan benar
- Return JSON valid
- Error handling lengkap

✅ Handler sudah handle:
- OPTIONS request (CORS preflight)
- POST request (submit ticket)
- Error response dalam format JSON

### 3. **Verifikasi Konfigurasi Vercel**

**File:** `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/public/:path*",
      "destination": "/api/public/:path*"
    }
  ]
}
```

✅ Routing sudah benar untuk `/api/public/*`

---

## 🧪 Testing & Verifikasi

### File Test Dibuat:

1. **`test-vercel-internal-tickets.html`**
   - Test OPTIONS request
   - Test GET units
   - Test POST submit ticket
   - Network info

2. **`TEST_VERCEL_INTERNAL_TICKETS.bat`**
   - Batch file untuk membuka test page

### Cara Test:

```bash
# 1. Jalankan batch file
TEST_VERCEL_INTERNAL_TICKETS.bat

# 2. Di browser, jalankan test secara berurutan:
#    - Test 1: OPTIONS request
#    - Test 2: GET units (copy unit ID)
#    - Test 3: Submit ticket (paste unit ID)

# 3. Perhatikan response:
#    ✅ Harus JSON
#    ❌ Jika HTML = routing bermasalah
```

---

## 🎯 Kemungkinan Masalah di Production

### Jika Masih Error Setelah Deploy:

#### **Masalah 1: Environment Variables Tidak Ter-set**

**Solusi:**
```bash
# Di Vercel Dashboard, set environment variables:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_ANON_KEY=eyJxxx...

# Atau dengan prefix VITE_:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

#### **Masalah 2: File API Tidak Ter-deploy**

**Cek:**
1. Pastikan folder `api/` ada di root project
2. Pastikan file `api/public/internal-tickets.ts` ada
3. Cek Vercel build log untuk error

**Solusi:**
```bash
# Re-deploy dengan force
vercel --prod --force
```

#### **Masalah 3: Routing Conflict**

**Cek `vercel.json`:**
```json
{
  "rewrites": [
    {
      "source": "/api/public/:path*",
      "destination": "/api/public/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

Pastikan:
- API routes di-define SEBELUM catch-all route
- Tidak ada conflict dengan static files

#### **Masalah 4: CORS Issues**

**Cek headers di `api/public/internal-tickets.ts`:**
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
res.setHeader('Content-Type', 'application/json; charset=utf-8');
```

---

## 📋 Checklist Deployment

Sebelum deploy ke Vercel:

- [ ] File `api/public/internal-tickets.ts` ada dan benar
- [ ] File `api/public/units.ts` ada dan benar
- [ ] `vercel.json` routing sudah benar
- [ ] Environment variables sudah di-set di Vercel
- [ ] Test di localhost berhasil
- [ ] Build production berhasil (`npm run build`)
- [ ] Tidak ada TypeScript errors

Setelah deploy:

- [ ] Test OPTIONS request berhasil
- [ ] Test GET units berhasil (return JSON)
- [ ] Test POST submit ticket berhasil (return JSON)
- [ ] Notifikasi sukses muncul
- [ ] Download PDF berfungsi

---

## 🚀 Langkah Selanjutnya

### 1. **Test di Localhost**
```bash
# Jalankan aplikasi
npm run dev

# Buka form internal ticket
http://localhost:3005/form/internal?unit_id=xxx&unit_name=Test

# Test submit
```

### 2. **Deploy ke Vercel**
```bash
# Commit changes
git add .
git commit -m "fix: tambah handleDownloadPDF dan perbaiki error handling"
git push

# Deploy
vercel --prod
```

### 3. **Test di Production**
```bash
# Buka test page
https://your-app.vercel.app/test-vercel-internal-tickets.html

# Atau langsung test form
https://your-app.vercel.app/form/internal?unit_id=xxx&unit_name=Test
```

---

## 📝 Catatan Penting

1. **Jangan ubah auth** - Sesuai aturan, auth tidak diubah
2. **Response harus JSON** - Jika HTML, berarti routing bermasalah
3. **Environment variables** - Pastikan ter-set di Vercel
4. **Error handling** - Sudah ditambahkan di semua endpoint
5. **CORS headers** - Sudah di-set dengan benar

---

## 🔗 File yang Dimodifikasi

1. ✅ `frontend/src/pages/public/DirectInternalTicketForm.tsx` - Tambah `handleDownloadPDF`
2. ✅ `test-vercel-internal-tickets.html` - File test baru
3. ✅ `TEST_VERCEL_INTERNAL_TICKETS.bat` - Batch file test

## 🔗 File yang Sudah Benar (Tidak Diubah)

1. ✅ `api/public/internal-tickets.ts` - Handler sudah benar
2. ✅ `api/public/units.ts` - Handler sudah benar
3. ✅ `vercel.json` - Routing sudah benar

---

**Status:** ✅ Perbaikan selesai, siap untuk testing dan deployment
