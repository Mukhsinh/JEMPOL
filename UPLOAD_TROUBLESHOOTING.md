# Upload Troubleshooting Guide

## Perbaikan yang Dilakukan

### 1. ✅ Backend Improvements

#### Server Configuration (backend/src/server.ts)
- **CORS Configuration**: Ditambahkan konfigurasi CORS yang lebih spesifik dengan credentials
- **Body Parser Limits**: Ditingkatkan limit menjadi 60MB untuk mendukung file besar
- **Uploads Directory**: Otomatis membuat folder uploads jika belum ada
- **Global Error Handler**: Menangani error multer dan error umum lainnya

#### Multer Configuration (backend/src/config/multer.ts)
- **Directory Check**: Memastikan folder uploads ada sebelum upload
- **Filename Sanitization**: Membersihkan nama file dari karakter tidak valid
- **Better Path Handling**: Menggunakan path absolut untuk uploads directory
- **Error Messages**: Pesan error yang lebih jelas dan informatif

#### Controller (backend/src/controllers/innovationController.ts)
- **Detailed Logging**: Menambahkan console.log untuk debugging
- **Better Error Handling**: Menangani berbagai jenis error dengan spesifik
- **File Cleanup**: Menghapus file jika terjadi error
- **Validation**: Validasi yang lebih ketat untuk title, description, dan file type

#### Routes (backend/src/routes/innovationRoutes.ts)
- **Multer Error Handling**: Menangkap error dari multer sebelum masuk controller
- **File Size Error**: Pesan khusus untuk error ukuran file
- **Custom Error Messages**: Error message yang user-friendly

### 2. ✅ Frontend Improvements

#### Upload Form (frontend/src/components/admin/UploadForm.tsx)
- **File Extension Validation**: Validasi berdasarkan ekstensi file (.ppt, .pptx, .mp4, dll)
- **File Size Display**: Menampilkan ukuran file yang diupload
- **Empty File Check**: Mencegah upload file kosong
- **Progress Bar**: Menampilkan progress upload real-time
- **Better Error Messages**: Pesan error yang lebih deskriptif
- **Console Logging**: Logging untuk debugging

#### Innovation Service (frontend/src/services/innovationService.ts)
- **Upload Progress**: Callback untuk tracking progress upload
- **Timeout Configuration**: Timeout 2 menit untuk file besar
- **Better Logging**: Console log untuk debugging

## Cara Menggunakan

### 1. Pastikan Backend Berjalan
```bash
cd backend
npm run dev
```

### 2. Pastikan Frontend Berjalan
```bash
cd frontend
npm run dev
```

### 3. Test Upload
1. Buka http://localhost:3000/admin
2. Isi form upload:
   - Judul: Nama inovasi
   - Deskripsi: Penjelasan singkat
   - File: Pilih file PowerPoint atau Video
3. Klik "Upload Konten"
4. Lihat progress bar
5. Tunggu notifikasi sukses

## Troubleshooting

### Error: "File harus diupload"
**Penyebab**: File tidak terpilih atau tidak valid
**Solusi**: 
- Pastikan file sudah dipilih
- Cek ekstensi file (.ppt, .pptx, .mp4, .webm, .avi)
- Cek ukuran file (max 50MB)

### Error: "Ukuran file terlalu besar"
**Penyebab**: File lebih dari 50MB
**Solusi**:
- Kompres file video menggunakan tools seperti HandBrake
- Untuk PowerPoint, hapus gambar/video yang tidak perlu
- Atau tingkatkan limit di backend/.env: `MAX_FILE_SIZE_MB=100`

### Error: "Tipe file tidak valid"
**Penyebab**: File bukan PowerPoint atau Video
**Solusi**:
- Pastikan file adalah .ppt, .pptx, .mp4, .webm, atau .avi
- Jangan rename file dengan ekstensi palsu
- Gunakan file asli dari aplikasi yang benar

### Error: "Terjadi kesalahan saat mengupload"
**Penyebab**: Berbagai kemungkinan (network, server, database)
**Solusi**:
1. Cek console browser (F12) untuk error detail
2. Cek console backend untuk error log
3. Pastikan MongoDB berjalan
4. Pastikan folder uploads ada dan writable
5. Cek koneksi internet

### Upload Stuck/Tidak Ada Progress
**Penyebab**: Network issue atau file terlalu besar
**Solusi**:
- Refresh halaman dan coba lagi
- Cek koneksi internet
- Gunakan file yang lebih kecil untuk test
- Cek apakah backend masih berjalan

### File Terupload tapi Tidak Muncul di Galeri
**Penyebab**: Database save gagal atau frontend tidak refresh
**Solusi**:
- Refresh halaman galeri
- Cek database MongoDB untuk data innovation
- Cek folder uploads apakah file ada
- Cek console untuk error

## Validasi File

### PowerPoint
- **Ekstensi**: .ppt, .pptx
- **MIME Type**: 
  - application/vnd.ms-powerpoint
  - application/vnd.openxmlformats-officedocument.presentationml.presentation
- **Max Size**: 50MB

### Video
- **Ekstensi**: .mp4, .webm, .avi
- **MIME Type**:
  - video/mp4
  - video/webm
  - video/x-msvideo
- **Max Size**: 50MB

## Monitoring Upload

### Browser Console (F12)
```javascript
// Akan muncul log seperti:
File selected: { name: "...", type: "...", size: ... }
File validation passed
Starting upload...
Upload progress: 25%
Upload progress: 50%
Upload progress: 75%
Upload progress: 100%
Upload successful: { success: true, data: {...} }
```

### Backend Console
```
Upload request received
Body: { title: '...', description: '...' }
File: { filename: '...', mimetype: '...', size: ... }
Creating innovation document...
Innovation saved successfully: 507f1f77bcf86cd799439011
```

## Testing Checklist

- [ ] Upload PowerPoint (.ppt) - Success
- [ ] Upload PowerPoint (.pptx) - Success
- [ ] Upload Video (.mp4) - Success
- [ ] Upload Video (.webm) - Success
- [ ] Upload Video (.avi) - Success
- [ ] Upload file > 50MB - Error dengan pesan jelas
- [ ] Upload file dengan tipe salah - Error dengan pesan jelas
- [ ] Upload tanpa title - Error dengan pesan jelas
- [ ] Upload tanpa description - Error dengan pesan jelas
- [ ] Upload tanpa file - Error dengan pesan jelas
- [ ] Progress bar muncul dan update
- [ ] Notifikasi sukses muncul
- [ ] File muncul di galeri
- [ ] File bisa didownload
- [ ] Video bisa diputar

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/innovation-landing-page
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE_MB=50
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Production Deployment

### Checklist
1. [ ] Set MAX_FILE_SIZE_MB sesuai kebutuhan
2. [ ] Pastikan folder uploads writable
3. [ ] Set CORS origin ke domain production
4. [ ] Gunakan cloud storage (S3, Cloudinary) untuk production
5. [ ] Enable HTTPS
6. [ ] Set proper timeout untuk reverse proxy (Nginx, etc)
7. [ ] Monitor disk space untuk uploads
8. [ ] Backup uploads folder secara berkala

### Nginx Configuration (jika menggunakan)
```nginx
client_max_body_size 60M;
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

## Support

Jika masih ada masalah:
1. Cek semua console log (browser & backend)
2. Cek file permissions pada folder uploads
3. Cek MongoDB connection
4. Cek network tab di browser DevTools
5. Test dengan file yang lebih kecil dulu
6. Restart backend dan frontend

---

**Status**: ✅ Upload system fully functional
**Last Updated**: December 5, 2025
**Version**: 2.0.0
