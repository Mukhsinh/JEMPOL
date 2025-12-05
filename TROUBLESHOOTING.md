# Panduan Troubleshooting Aplikasi JEMPOL

## Masalah Umum dan Solusinya

### 1. Aplikasi Tidak Bisa Dibuka / Blank Screen

**Gejala:**
- Browser menampilkan halaman kosong
- Error di console: "module does not provide an export named 'default'"
- Aplikasi tidak merespon

**Solusi:**

#### Opsi 1: Restart Cepat
```bash
# Jalankan file ini:
RESTART_APP.bat
```

#### Opsi 2: Clean Install
```bash
# Jalankan file ini:
CLEAN_AND_START.bat
```

#### Opsi 3: Manual
1. Hentikan semua proses Node.js:
   - Tekan `Ctrl+C` di terminal backend dan frontend
   - Atau jalankan: `taskkill /F /IM node.exe`

2. Hapus cache:
   ```bash
   rmdir /s /q frontend\node_modules\.vite
   rmdir /s /q frontend\dist
   ```

3. Install ulang dependencies:
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   cd backend
   npm install
   cd ..
   ```

4. Jalankan ulang:
   ```bash
   START_ALL.bat
   ```

### 2. Port Sudah Digunakan

**Gejala:**
- Error: "Port 3001 is already in use"
- Error: "Port 5000 is already in use"

**Solusi:**
```bash
# Hentikan semua proses Node.js
taskkill /F /IM node.exe

# Tunggu 3 detik, lalu jalankan ulang
START_ALL.bat
```

### 3. Backend Tidak Terhubung

**Gejala:**
- Error: "Network Error" atau "Failed to fetch"
- Data tidak muncul di halaman

**Solusi:**
1. Pastikan backend berjalan di http://localhost:5000
2. Cek file `backend/.env` sudah dikonfigurasi dengan benar
3. Cek MongoDB connection string di `backend/.env`

### 4. File Upload Tidak Berfungsi

**Gejala:**
- Error saat upload file
- File tidak tersimpan

**Solusi:**
1. Pastikan folder `backend/uploads` ada
2. Cek permission folder
3. Cek ukuran file (max 50MB untuk PowerPoint, 200MB untuk video)

### 5. Gambar/Video Tidak Muncul

**Gejala:**
- Placeholder muncul tapi gambar tidak load
- Error 404 untuk file

**Solusi:**
1. Pastikan backend berjalan
2. Cek file ada di folder `backend/uploads`
3. Cek URL di browser console
4. Pastikan `VITE_API_URL` di `frontend/.env` benar

## Cek Status Aplikasi

Jalankan file ini untuk cek status:
```bash
CHECK_STATUS.bat
```

## Reset Lengkap

Jika semua solusi di atas tidak berhasil:

1. Backup data penting (database, uploads)
2. Hapus semua node_modules:
   ```bash
   rmdir /s /q node_modules
   rmdir /s /q frontend\node_modules
   rmdir /s /q backend\node_modules
   ```
3. Jalankan:
   ```bash
   CLEAN_AND_START.bat
   ```

## Kontak Support

Jika masalah masih berlanjut, hubungi tim development dengan informasi:
- Screenshot error
- Isi console browser (F12 > Console)
- Log dari terminal backend dan frontend
