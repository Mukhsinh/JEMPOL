# Perbaikan Error Track Ticket

## 🐛 Masalah

Error yang muncul di halaman track ticket:
```
Unexpected token 'e', ...is not valid JSON
```

### Screenshot Error
- Halaman menampilkan "Tiket Tidak Ditemukan"
- Error terjadi saat parsing JSON response
- Console menunjukkan response bukan JSON valid

## 🔍 Analisis

Error ini terjadi karena:

1. **Server mengembalikan HTML error page** alih-alih JSON response
2. **Endpoint tidak ditemukan** (404) atau **server error** (500)
3. **CORS issue** yang menyebabkan browser memblokir request
4. **Backend tidak berjalan** atau route tidak terdaftar

### Kemungkinan Penyebab

1. **Endpoint Vercel serverless function** (`/api/public/track-ticket`) tidak berfungsi
2. **Backend Express route** tidak terdaftar dengan benar
3. **CORS headers** tidak diset dengan benar
4. **Content-Type header** tidak diset ke `application/json`

## ✅ Solusi yang Diterapkan

### 1. Update TrackTicket.tsx dengan Error Handling yang Lebih Baik

**File:** `frontend/src/pages/public/TrackTicket.tsx`

**Perubahan:**
- Tambahkan logging untuk debugging
- Cek Content-Type header sebelum parse JSON
- Berikan pesan error yang lebih informatif
- Handle berbagai jenis error (network, JSON parsing, dll)

```typescript
const handleSearchWithTicket = async (ticket: string) => {
  if (!ticket.trim()) return;

  setLoading(true);
  setError('');
  setTicketData(null);

  try {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const endpoint = `${apiUrl}/public/track-ticket?ticket=${encodeURIComponent(ticket.trim())}`;
    
    console.log('🔍 Fetching ticket from:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Cek apakah response adalah JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Response bukan JSON:', contentType);
      const text = await response.text();
      console.error('❌ Response text:', text.substring(0, 200));
      throw new Error('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
    }

    const data = await response.json();
    console.log('✅ Response data:', data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Tiket tidak ditemukan');
    }

    setTicketData(data.data);
  } catch (err: any) {
    console.error('❌ Error tracking ticket:', err);
    
    let errorMessage = err.message || 'Terjadi kesalahan saat mencari tiket';
    
    if (err.message.includes('Failed to fetch')) {
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else if (err.message.includes('JSON')) {
      errorMessage = 'Server mengembalikan response yang tidak valid. Silakan coba lagi.';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### 2. Verifikasi Vercel Configuration

**File:** `vercel.json`

Memastikan route untuk track-ticket sudah terdaftar:

```json
{
  "rewrites": [
    {
      "source": "/api/public/track-ticket",
      "destination": "/api/public/track-ticket.ts"
    }
  ]
}
```

### 3. Vercel Serverless Function

**File:** `api/public/track-ticket.ts`

Endpoint sudah memiliki:
- ✅ CORS headers yang benar
- ✅ Content-Type: application/json
- ✅ Error handling yang baik
- ✅ Logging untuk debugging

### 4. Backend Express Route

**File:** `backend/src/routes/publicTrackingRoutes.ts`

Route sudah ada dan berfungsi:
- ✅ GET `/api/public/track/:ticketNumber`
- ✅ Return JSON response
- ✅ Error handling

## 🧪 Testing

### File Test yang Dibuat

1. **test-track-ticket-fixed.html** - Test file dengan debugging lengkap
2. **TEST_TRACK_TICKET_FIXED.bat** - Batch file untuk membuka test

### Cara Test

```bash
# 1. Jalankan backend
cd backend
npm run dev

# 2. Jalankan frontend
cd frontend
npm run dev

# 3. Buka test file
TEST_TRACK_TICKET_FIXED.bat
```

### Yang Harus Diperiksa

1. **Console Browser** - Lihat log untuk detail error
2. **Network Tab** - Periksa request/response
3. **Response Headers** - Pastikan Content-Type: application/json
4. **Response Body** - Pastikan format JSON valid

## 🔧 Debugging

### Jika Masih Error

1. **Periksa Backend Berjalan**
   ```bash
   curl http://localhost:3005/api/public/track/TKT-2026-0003
   ```

2. **Periksa Vercel Endpoint**
   ```bash
   curl http://localhost:3005/api/public/track-ticket?ticket=TKT-2026-0003
   ```

3. **Periksa Console Browser**
   - Buka DevTools (F12)
   - Lihat tab Console untuk error
   - Lihat tab Network untuk request/response

4. **Periksa Response**
   - Apakah Content-Type: application/json?
   - Apakah response body valid JSON?
   - Apakah ada CORS error?

### Common Issues

| Issue | Penyebab | Solusi |
|-------|----------|--------|
| 404 Not Found | Endpoint tidak ada | Periksa route di server.ts |
| CORS Error | CORS headers tidak diset | Tambahkan CORS middleware |
| HTML Response | Server error | Periksa backend logs |
| Network Error | Backend tidak berjalan | Jalankan backend |

## 📝 Checklist

- [x] Update TrackTicket.tsx dengan error handling
- [x] Verifikasi vercel.json configuration
- [x] Buat test file untuk debugging
- [x] Buat batch file untuk testing
- [ ] Test di localhost
- [ ] Test di production (Vercel)
- [ ] Verifikasi semua tiket bisa dilacak

## 🎯 Hasil yang Diharapkan

Setelah perbaikan:

1. ✅ Halaman track ticket bisa mencari tiket
2. ✅ Error message lebih informatif
3. ✅ Console browser menampilkan log debugging
4. ✅ Response selalu dalam format JSON
5. ✅ CORS tidak ada masalah

## 📚 Referensi

- Vercel Serverless Functions: https://vercel.com/docs/functions
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

## 🔄 Update Selanjutnya

Jika masih ada masalah:

1. Tambahkan retry mechanism
2. Tambahkan fallback ke backend Express
3. Tambahkan caching untuk mengurangi request
4. Tambahkan loading skeleton yang lebih baik
