# Panduan Upload Video Besar

## Perubahan Terbaru

Aplikasi JEMPOL sekarang mendukung upload video hingga **1GB** (1024MB).

## Limit Ukuran File

- **Video** (MP4, WEBM, AVI, MOV, MKV): Maksimal **1GB**
- **PowerPoint** (PPT, PPTX): Maksimal **100MB**
- **Foto** (JPG, PNG, GIF, WEBP): Maksimal **50MB**

## Format Video yang Didukung

- MP4 (Recommended)
- WEBM
- AVI
- MOV (QuickTime)
- MKV
- MPEG

## Cara Upload Video

1. Login ke halaman Admin
2. Klik tab "Upload Konten"
3. Isi judul dan deskripsi
4. Pilih file video (maksimal 1GB)
5. Klik "Upload Konten"
6. Tunggu proses upload selesai (untuk video besar mungkin memerlukan waktu beberapa menit)

## Cara Upload Multiple Foto

1. Login ke halaman Admin
2. Klik tab "Upload Multiple Foto"
3. Isi judul dasar (akan ditambahkan nomor urut otomatis untuk setiap foto)
4. Isi deskripsi (akan digunakan untuk semua foto)
5. Pilih hingga 10 foto sekaligus
6. Preview foto akan muncul, Anda bisa menghapus foto yang tidak diinginkan
7. Klik "Upload X Foto"
8. Tunggu proses upload selesai

## Pemutaran Video

Video akan diputar langsung di halaman aplikasi dengan fitur:
- Kontrol play/pause
- Volume control
- Fullscreen mode
- Progress bar
- Opsi download video

## Tips untuk Video Besar

1. **Gunakan format MP4** untuk kompatibilitas terbaik
2. **Kompres video** jika memungkinkan untuk mempercepat upload
3. **Pastikan koneksi internet stabil** saat upload video besar
4. **Tunggu hingga progress bar mencapai 100%** sebelum menutup halaman

## Troubleshooting

### Upload Gagal
- Pastikan ukuran file tidak melebihi 1GB
- Cek koneksi internet
- Coba refresh halaman dan upload ulang

### Video Tidak Bisa Diputar
- Pastikan format video didukung (MP4 recommended)
- Coba buka video di tab baru
- Download video dan putar dengan media player lokal

### Upload Lambat
- Normal untuk video besar (>500MB)
- Pastikan koneksi internet stabil
- Jangan tutup browser selama proses upload

## Konfigurasi Server

Jika Anda adalah administrator dan ingin mengubah limit ukuran file, edit file `backend/.env`:

```env
MAX_FILE_SIZE_MB=100
MAX_VIDEO_SIZE_MB=1024
```

Restart server setelah mengubah konfigurasi.
