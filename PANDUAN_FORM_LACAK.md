# 🎯 Panduan Form Lacak Tiket

## Deskripsi
Form Lacak adalah halaman publik yang memungkinkan pengguna melacak status tiket pengaduan mereka tanpa perlu login. Halaman ini dirancang dengan tampilan mobile-first yang user-friendly dan modern.

## Fitur Utama

### ✅ Pelacakan Tiket
- Pencarian berdasarkan nomor tiket
- Tampilan status real-time
- Timeline progres penanganan
- AI Status Insight

### 📱 Notifikasi WhatsApp (Coming Soon)
- Pendaftaran nomor WhatsApp
- Notifikasi otomatis saat ada update
- AI insight via WhatsApp

### 📊 Informasi Lengkap
- Detail tiket (kategori, prioritas, lokasi, tanggal)
- Riwayat pembaruan
- Respon dari petugas
- Kontak call center & WhatsApp

## Cara Menggunakan

### 1. Akses Halaman
```
URL: http://localhost:5173/form-lacak
Short URL: http://localhost:5173/lacak
```

### 2. Dari Dashboard Admin
- Login ke dashboard
- Buka menu "Tickets" di sidebar
- Klik submenu "Form Lacak"

### 3. Via QR Code
- Scan QR code yang tersedia
- Langsung diarahkan ke Form Lacak

## Cara Test

### Jalankan Aplikasi
```bash
# Jalankan dengan batch file
TEST_FORM_LACAK.bat

# Atau manual
cd backend && npm run dev
cd frontend && npm run dev
```

### Test Pelacakan
1. Buka http://localhost:5173/form-lacak
2. Masukkan nomor tiket (contoh: TKT-2024-0001)
3. Klik tombol "Lacak"
4. Verifikasi data yang ditampilkan

### Generate QR Code
```bash
cd scripts
node generate-form-lacak-qr.js
```

QR Code akan tersimpan di: `public/qr-codes/`

## Integrasi

### Frontend
- **File**: `frontend/src/pages/public/FormLacak.tsx`
- **Route**: `/form-lacak`, `/lacak`
- **Menu**: Sidebar > Tickets > Form Lacak

### Backend
- **Endpoint**: `GET /api/public/track/:ticketNumber`
- **File**: `backend/src/routes/publicTrackingRoutes.ts`
- **Auth**: Tidak diperlukan (public access)

### Database
- **Tabel**: `tickets`
- **Relasi**: `units`, `service_categories`, `ticket_responses`
- **Query**: Supabase direct query

## Tampilan

### Desktop
- Layout centered dengan max-width
- Card-based design
- Smooth animations

### Mobile
- Mobile-first responsive
- Touch-friendly buttons
- Optimized spacing

### Dark Mode
- Full dark mode support
- Auto-detect system preference
- Smooth transitions

## QR Code

### Lokasi Pemasangan
- Loket pendaftaran
- Ruang tunggu pasien
- Area informasi
- Brosur & pamflet
- Website & media sosial

### Format Tersedia
- PNG (untuk cetak)
- SVG (untuk digital)
- Preview HTML

## Troubleshooting

### Tiket Tidak Ditemukan
- Pastikan nomor tiket benar
- Cek format: TKT-YYYY-XXXX
- Verifikasi data di database

### Data Tidak Muncul
- Cek koneksi backend
- Verifikasi Supabase connection
- Lihat console untuk error

### QR Code Tidak Generate
- Install dependencies: `npm install qrcode`
- Jalankan script: `node scripts/generate-form-lacak-qr.js`
- Cek folder output: `public/qr-codes/`

## Keamanan

### Public Access
- Tidak perlu autentikasi
- Hanya data publik yang ditampilkan
- Respon internal tidak ditampilkan

### Data Privacy
- Hanya nomor tiket yang diperlukan
- Tidak ada data sensitif
- WhatsApp number optional

## Pengembangan Selanjutnya

### Phase 1 (Current)
- ✅ Pelacakan tiket dasar
- ✅ Timeline progres
- ✅ QR Code generation
- ✅ Responsive design

### Phase 2 (Coming Soon)
- 🔄 Notifikasi WhatsApp real
- 🔄 AI insight enhancement
- 🔄 Multi-language support
- 🔄 Print ticket feature

### Phase 3 (Future)
- 📋 Rating & feedback
- 📋 Attachment preview
- 📋 Live chat support
- 📋 Push notifications

## Support

Untuk bantuan atau pertanyaan:
- Call Center: 112
- WhatsApp: (akan diupdate)
- Email: support@domain.com
