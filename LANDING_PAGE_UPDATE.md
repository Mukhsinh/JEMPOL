# Update Landing Page - Sistem Pembayaran Rumah Sakit

## Perubahan yang Dilakukan

### 1. Desain Baru dengan Circular Menu Layout
- Tampilan hero section dengan layout menu melingkar seperti referensi ASN Digital
- Menu utama tersusun dalam lingkaran dengan logo JEMPOL di tengah
- 8 menu utama: Login, Pembayaran Klinik, Laboratorium, Radiologi, Registrasi Pasien, Riwayat Transaksi, Keamanan Data, dan Pembayaran Cepat

### 2. Tema Warna Hijau Dominan
- Background gradient: emerald-400 → teal-500 → cyan-600
- Warna primary diubah ke emerald/green tones
- Warna secondary diubah ke teal tones
- Semua elemen UI menggunakan palet warna hijau yang konsisten

### 3. Ikon Lucide React
Menggunakan ikon dari lucide-react untuk berbagai fitur:
- `Building2` - Logo rumah sakit/klinik
- `Heart` - Pembayaran klinik
- `Activity` - Laboratorium
- `FileText` - Radiologi
- `Users` - Registrasi pasien
- `Shield` - Keamanan data
- `Zap` - Pembayaran cepat
- `Clock` - Riwayat transaksi
- `Globe` - Login
- `CreditCard` - Pembayaran
- `Smartphone` - Akses mobile
- `CheckCircle` - Konfirmasi

### 4. Logo Custom JEMPOL
Dibuat komponen `JempolHospitalLogo.tsx` dengan:
- Medical cross di tengah
- Icon kartu kredit
- Pulse line (detak jantung)
- Gradient hijau-teal-cyan
- Animasi hover scale

### 5. Section Baru

#### Features Section
4 keunggulan utama:
- Pembayaran Mudah
- Akses Mobile
- Keamanan Terjamin
- Konfirmasi Instan

#### Services Section
3 layanan utama dengan detail:
- Pembayaran Klinik (Konsultasi, Pemeriksaan, Rawat Jalan/Inap)
- Laboratorium (Tes Darah, Urine, MCU, COVID-19)
- Radiologi (Rontgen, CT Scan, MRI, USG)

#### CTA Section
Call-to-action dengan 2 tombol:
- Daftar Sekarang
- Login

### 6. Pola Background
- Dotted pattern untuk efek visual
- Decorative circles dengan opacity rendah
- Gradient overlays untuk depth

## File yang Diubah

1. `frontend/src/pages/HomePage.tsx` - Redesign lengkap
2. `frontend/tailwind.config.js` - Update color palette
3. `frontend/src/components/ui/JempolHospitalLogo.tsx` - Logo baru (created)

## Teknologi yang Digunakan

- React + TypeScript
- Tailwind CSS
- Lucide React Icons
- SVG untuk logo custom

## Cara Melihat Perubahan

1. Jalankan frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Buka browser: `http://localhost:5173`

## Fitur Responsif

- Mobile-first design
- Breakpoints: sm, md, lg
- Circular menu menyesuaikan ukuran layar
- Touch-friendly untuk mobile devices

## Warna Palette

### Primary (Emerald/Green)
- 50: #f0fdf4
- 500: #10b981
- 600: #059669
- 700: #047857

### Secondary (Teal)
- 50: #f0fdfa
- 500: #14b8a6
- 600: #0d9488
- 700: #0f766e

### Accent Colors
- Blue: #3b82f6
- Purple: #a855f7
- Orange: #f97316
- Pink: #ec4899
- Yellow: #eab308

## Catatan

Desain ini mengadaptasi konsep dari ASN Digital BKN dengan fokus pada sistem pembayaran rumah sakit (klinik, laboratorium, radiologi) dengan dominan warna hijau yang memberikan kesan kesehatan, kepercayaan, dan profesional.
