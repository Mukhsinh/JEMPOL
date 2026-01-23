# Perbaikan Submit Tiket Internal - Analigkap

## Masalah yang Ditemukan

Dari console browser, terlihat error:
```
❌ Non JSON response: <!doctype html>
Error loading app settings: Server mengembalikan response yang tidak valid
```

### Akar Masalah

1. **Response HTML bukan JSON** - Server mengembalikan HTML page (kemungkinan 404 atau error page)
2. **Endpoint tidak terhubung** - Request tidak sampai ke `/api/public/internal-tickets`
3. **Routing issue** - Ada kemungkinan routing ditar dengan benar

## Solusi Perbaikan

### 1. Pastikan Backend Route Terdaftar

File: `backend/src/server.ts`
- Pastikan `publicRoutes` sudah di-register
- Pastikan path prefix `/api/public` benar

### 2. Perbaiki Endpoint Handler

File: `backend/src/routes/publicRoutes.ts`
- Tambahkan error handling yang lebih baik
- Pastikan SELALU return JSON, bukan HTML
- Tambahkan logging yang lebih detail

### 3. Perbaiki Frontend Request

File: `frontend//public/DirectInternalTicketForm.tsx`
- Tambahkan retry logic
- Tambahkan fallback ke Vercel serverless function
- Perbaiki error handling

## Implementasi Perbaikan

### Backend - publicRoutes.ts

```typescript
// Submit internal ticket - PERBAIKAN LENGKAP
router.post('/internal-tickets', async (req: Request, res: Response) => {
  // CRITICAL: Set headers PERTAMA
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🎯 POST /api/public/internal-tickets received');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_department,
      reporter_position,
      category,
      category_id,
      priority,
      title,
      description,
      qr_code,
      unit_id,
      source = 'web'
    } = req.body;

    // Validasi
    if (!unit_id) {
      return res.status(400).json({
        success: false,
        error: 'Unit ID harus diisi'
      });
    }

    if (!reporter_name || !reporter_email || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Nama, email, judul, dan '
      });
    }

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();
    
    // Calculate SLA
    const slaDeadline = new Date();
    switch (priority) {
      case 'critical': slaDeadline.setHours(slaDeadline.getHours() + 4); break;
      case 'high': slaDeadline.setHours(slaDeadline.getHours() + 24); break;
      case 'medium': slaDeadline.setHours(slaDeadline.getHours() + 48); break;
      default: slaDeadline.setHours(slaDeadline.getHours() + 72);
    }

    // Prepare ticket data
    const ticketData: any = {
      ticket_number: ticketNumber,
      type: 'complaint', // Internal ticket = complaint
      title: title,
      description: description,
      unit_id: unit_id,
      priority: priority || 'medium',
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: source,
      is_anonymous: false,
      submitter_name: reporter_name,
      submitter_email: reporter_email,
      submitter_phone: reporter_phone || null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    // Add category if provided
    if (categ_id) {
      ticketData.category_id = category_id;
    }

    console.log('📤 Inserting ticket:', ticketData);

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select('*, units:unit_id(name, code)')
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat tiket: ' + error.message
      });
    }

    console.log('✅ Ticket_number);

    return res.status(201).json({
      success: true,
      ticket_number: ticket.ticket_number,
      data: ticket,
      message: 'Tiket berhasil dibuat'
    });

  } catch (error: any) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
});
```

### Frontend - DirectInternalTicketForm.tsx

```typescript
const handleSubmit = async (e: React.FormEvent) => {
 lt();
  setSubmitting(true);
  setError('');

  try {
    const payload = {
      reporter_name: formData.reporter_name,
      reporter_email: formData.reporter_email,
      reporter_phone: formData.reporter_phone,
      reporter_department: formData.reporter_department,
      reporter_position: formData.reporter_position,
      category: formData.category,
      priority: formData.priority,
      title: formData.title,
      description: formData.description,
      qr_code: qrCode,
      unit_id: formData.unit_id || unitId,
      source: qrCode ? 'qr_code' : 'web'
    };

    console.log('📤 Submitting ticket:', payload);

    // Try backend first, fallback to Vercel
    let response;
    let apiEndpoint = '/api/public/internal-tickets';
    
    try {
      response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (fetchError) {
      console.log('⚠️ Backend failed, trying Vercel...');
      // Fallback to Vercel serverless
      response = await fetch('/api/public/internal-tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }
    
    console.log('📥 Response status:', response.status);
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if ype || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text.substring(0, 200));
      throw new Error('Server mengembalikan response yang tidak valid');
    }
    
    const result = await response.json();
    console.log('📥 Response data:', result);

    if (response.ok && result.success) {
      setTicketNumber(result.ticket_number);
      setSubmitted(true);
    } else {
      setError(result.error || 'Gagal men;
    }
  } catch (err: any) {
    console.error('❌ Submit error:', err);
    setError(err.message || 'Terjadi kesalahan saat mengirim tiket');
  } finally {
    setSubmitting(false);
  }
};
```

## Checklist Perbaikan

- [ ] Pastikan backend server berjalan di port 5000
- [ ] Pastikan route `/api/public/internal-tickets` terdaftar
- [ ] Pastikan CORS enabled untuk frontend
- [ ] Test endpoint dengan curl/Postman
- [ ] Pastikan Supabase credentials valid
- [ ] Pastikan tabel `tickets` memiliki struktur yang benar
- [ ] Test submit dari browser

## Testing

### 1. Test Backend Endpoint
```bash
curl -X POST http://localhost:5000/api/public/internal-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_name": "Test User",
    "reporter_email": "test@example.com",
    "title": "Test Ticket",
    "description": "Test description",
    "unit_id": "YOUR_UNIT_ID",
    "priority": "medium"
  }'
```

### 2. Check Backend Logs
- Lihat console backend untuk error
- Pastikan tidak ada error koneksi Supabase
Pastikan ticket number ter-generate

### 3. Check Browser Console
- Lihat network tab untuk request/response
- Pastikan request method POST
- Pastikan response adalah JSON

## Status
- ❌ Masalah: Response HTML bukan JSON
- 🔄 Solusi: Perbaiki routing dan error handling
- ⏳ Testing: Perlu ditest setelah implementasi
