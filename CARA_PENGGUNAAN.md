# Cara Penggunaan JEMPOL Landing Page

## 🏠 Untuk Pengunjung (Tanpa Login)

### 1. Akses Landing Page
- Buka browser dan akses: `http://localhost:3001`
- Tidak perlu login untuk melihat konten

### 2. Daftar Sebagai Pengunjung
- Scroll ke section "Pendaftaran"
- Isi form:
  - Nama Lengkap
  - Instansi/Organisasi
  - Jabatan
  - Nomor Handphone
- Klik "Daftar Sekarang"

### 3. Lihat Materi JEMPOL
- Scroll ke section "Materi JEMPOL"
- Klik pada card materi yang ingin dilihat
- PowerPoint akan ditampilkan langsung di modal
- Tidak perlu download untuk melihat

### 4. Tonton Video JEMPOL
- Scroll ke section "Video JEMPOL"
- Klik pada card video yang ingin ditonton
- Video akan diputar langsung di modal

### 5. Lihat Galeri Foto
- Scroll ke section "Galeri Foto"
- Klik pada foto untuk melihat ukuran penuh
- Klik X atau area gelap untuk menutup

### 6. Main Game
- Klik menu "Game" di header atau tombol di homepage
- Pilih mode:
  - **Single Player**: Bermain sendiri
  - **Multiplayer**: Bermain bersama teman
- Klik "Mulai Bermain"
- Kontrol:
  - Desktop: Gerakkan mouse
  - Mobile: Touch dan drag
- Tangkap item hijau (+10 poin)
- Hindari item merah (-5 poin)
- Tangkap item emas (+50 poin)

## 👨‍💼 Untuk Admin

### 1. Akses Halaman Admin
- Buka: `http://localhost:3001/admin`
- (Untuk production, tambahkan sistem login)

### 2. Upload Materi PowerPoint
- Klik tab "Upload Konten"
- Isi form:
  - **Judul**: Nama materi (contoh: "JEMPOL - Inovasi Pembayaran Online")
  - **Deskripsi**: Penjelasan lengkap (gunakan Enter untuk paragraf baru)
  - **File**: Pilih file .ppt atau .pptx (max 50MB)
- Klik "Upload Konten"
- Tunggu hingga upload selesai

### 3. Upload Video JEMPOL
- Klik tab "Upload Konten"
- Isi form:
  - **Judul**: Judul video (contoh: "Tutorial JEMPOL")
  - **Deskripsi**: Penjelasan video (gunakan Enter untuk paragraf baru)
  - **File**: Pilih file .mp4, .webm, atau .avi (max 50MB)
- Klik "Upload Konten"

### 4. Upload Foto
- Klik tab "Upload Konten"
- Isi form:
  - **Judul**: Judul foto (contoh: "Sosialisasi JEMPOL 2025")
  - **Deskripsi**: Keterangan foto
  - **File**: Pilih file .jpg, .png, .gif, atau .webp (max 50MB)
- Klik "Upload Konten"
- Ulangi untuk upload foto lainnya

### 5. Kelola Data Pengunjung
- Klik tab "Pengunjung"
- Lihat daftar pengunjung yang telah mendaftar
- Statistik:
  - Total pengunjung
  - Pengunjung hari ini
  - Pengunjung minggu ini
  - Pengunjung bulan ini
- Hapus data jika diperlukan

### 6. Kelola Konten
- Klik tab "Galeri Inovasi"
- Lihat semua konten yang telah diupload
- Filter berdasarkan tipe:
  - Semua
  - PowerPoint
  - Video
- Hapus konten jika diperlukan

## 💡 Tips

### Untuk Deskripsi yang Rapi
Saat mengisi deskripsi, gunakan Enter untuk membuat paragraf baru:

```
JEMPOL (Jembatan Pembayaran Online) adalah terobosan layanan publik dari RSUD Bunda Kota Pekalongan.

Dengan teknologi QRIS dinamis yang terintegrasi langsung dengan sistem informasi rumah sakit, JEMPOL mengubah cara masyarakat membayar layanan kesehatan.

Tidak lagi perlu menuju loket kasir, tidak perlu menunggu lama, dan tidak ada lagi risiko salah input.
```

Hasilnya akan ditampilkan sebagai 3 paragraf terpisah dengan rata kanan-kiri.

### Untuk Upload File Besar
- Pastikan koneksi internet stabil
- Tunggu hingga progress bar mencapai 100%
- Jangan tutup browser saat upload

### Untuk PowerPoint
- File PowerPoint akan ditampilkan menggunakan Office Online Viewer
- Pastikan file tidak corrupt
- Format yang didukung: .ppt, .pptx

### Untuk Video
- Format yang direkomendasikan: .mp4
- Resolusi maksimal: 1080p untuk performa optimal
- Gunakan codec H.264 untuk kompatibilitas terbaik

### Untuk Foto
- Resolusi yang direkomendasikan: 1920x1080 atau lebih kecil
- Format yang direkomendasikan: .jpg atau .webp
- Compress foto terlebih dahulu jika ukuran > 5MB

## 🔧 Troubleshooting

### Upload Gagal
1. Cek ukuran file (max 50MB)
2. Cek format file
3. Cek koneksi internet
4. Refresh halaman dan coba lagi

### PowerPoint Tidak Tampil
1. Pastikan file tidak corrupt
2. Coba buka file di komputer terlebih dahulu
3. Pastikan format .ppt atau .pptx

### Video Tidak Bisa Diputar
1. Cek format video (.mp4 paling kompatibel)
2. Cek codec video (H.264 recommended)
3. Coba convert video ke .mp4 terlebih dahulu

### Game Tidak Berjalan
1. Refresh halaman
2. Cek console browser untuk error
3. Pastikan JavaScript enabled

## 📞 Support

Jika mengalami masalah, silakan hubungi tim IT RSUD Bunda Kota Pekalongan.
