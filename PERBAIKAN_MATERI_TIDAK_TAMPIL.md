# Perbaikan: Materi Tidak Tampil

## 🔍 Diagnosis

Dari screenshot dan log, masalahnya adalah:
- ❌ Frontend menampilkan "Network Error"
- ❌ "Failed to load resources: ERR_CONNECTION_REFUSED"
- ✅ Backend berjalan di port 5000
- ✅ Data ada di database (2 PDF, 1 video, 3 foto)
- ✅ API endpoint berfungsi (test dengan curl berhasil)

**Kesimpulan**: Frontend tidak bisa connect ke backend, kemungkinan karena:
1. Frontend menggunakan cache lama
2. Browser cache
3. Service worker lama
4. Port conflict

## ✅ Solusi

### Langkah 1: Stop Semua Process

```bash
# Stop backend jika berjalan
# Tekan Ctrl+C di terminal backend

# Stop frontend jika berjalan  
# Tekan Ctrl+C di terminal frontend
```

### Langkah 2: Clear Cache

```bash
# Di folder frontend
cd frontend
rm -rf node_modules/.vite
rm -rf dist
```

Atau di Windows:
```cmd
cd frontend
rmdir /s /q node_modules\.vite
rmdir /s /q dist
```

### Langkah 3: Clear Browser Cache

1. Buka browser
2. Tekan `Ctrl+Shift+Delete`
3. Pilih "Cached images and files"
4. Clear cache
5. Atau buka DevTools (F12) → Application → Clear storage → Clear site data

### Langkah 4: Restart Backend

```bash
cd backend
npm run dev
```

Tunggu sampai muncul:
```
Server running on port 5000
Supabase connected successfully
```

### Langkah 5: Restart Frontend

```bash
cd frontend
npm run dev
```

### Langkah 6: Test Connection

1. Buka file `test-connection.html` di browser
2. Atau akses: http://localhost:5000/api/health
3. Harus muncul: `{"success":true,"message":"Server is running"}`

### Langkah 7: Buka Aplikasi

1. Buka: http://localhost:3001
2. Refresh dengan `Ctrl+F5` (hard refresh)
3. Materi harus tampil

## 🔧 Alternatif: Gunakan Batch File

Saya sudah membuat batch file untuk memudahkan:

### Windows:
```cmd
# Stop semua
STOP_ALL.bat

# Clean dan start
CLEAN_AND_START.bat
```

### Manual:
```cmd
# Start backend
START_BACKEND.bat

# Start frontend (di terminal lain)
START_FRONTEND.bat
```

## 🐛 Troubleshooting

### Masih "Network Error"?

**Cek 1: Backend berjalan?**
```bash
curl http://localhost:5000/api/health
```
Harus return JSON dengan success:true

**Cek 2: Port 5000 digunakan?**
```bash
netstat -ano | findstr :5000
```
Harus ada process listening di port 5000

**Cek 3: Frontend URL benar?**
File `frontend/.env` harus berisi:
```
VITE_API_URL=http://localhost:5000/api
```

**Cek 4: CORS?**
Buka DevTools (F12) → Console
Lihat apakah ada error CORS

### Port 5000 sudah digunakan?

Ganti port di `backend/.env`:
```
PORT=5001
```

Dan di `frontend/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

### Masih tidak bisa?

1. **Restart komputer** - kadang port stuck
2. **Disable antivirus** - mungkin block connection
3. **Check firewall** - allow port 5000 dan 3001
4. **Gunakan browser lain** - test di Chrome/Firefox/Edge

## 📊 Verifikasi Data

Untuk memastikan data ada di database:

```bash
cd backend
node check-data.js
```

Output harus menampilkan:
```
Total innovations: 6

1. Inovasi JEMPOL (PDF)
2. Inovasi JEMPOL (PDF)
3. Visitasi inovasi JEMPOL (Photo)
4. Visitasi inovasi JEMPOL (Photo)
5. Visitasi inovasi JEMPOL (Photo)
6. Video Inovasi JEMPOL (Video)
```

## 🎯 Checklist

Sebelum melaporkan masih error, pastikan:

- [ ] Backend berjalan di port 5000
- [ ] Frontend berjalan di port 3001
- [ ] `curl http://localhost:5000/api/health` berhasil
- [ ] `curl http://localhost:5000/api/innovations` return data
- [ ] Browser cache sudah di-clear
- [ ] Hard refresh (Ctrl+F5) sudah dilakukan
- [ ] File `.env` sudah benar
- [ ] Tidak ada error di console browser
- [ ] Tidak ada error di terminal backend
- [ ] Data ada di database (check dengan check-data.js)

## 🚀 Quick Fix

Jika masih tidak bisa, coba ini:

```bash
# 1. Stop semua
# Ctrl+C di semua terminal

# 2. Kill port 5000 dan 3001
npx kill-port 5000 3001

# 3. Clear cache
cd frontend
rm -rf node_modules/.vite dist

# 4. Start backend
cd ../backend
npm run dev

# 5. Start frontend (terminal baru)
cd ../frontend
npm run dev

# 6. Hard refresh browser
# Ctrl+F5
```

## 📝 Catatan

- Backend HARUS berjalan sebelum frontend
- Tunggu backend selesai start (lihat "Server running on port 5000")
- Jangan lupa hard refresh browser (Ctrl+F5)
- Jika masih error, screenshot console browser dan terminal backend

## ✅ Status Sekarang

- ✅ Backend berjalan di port 5000
- ✅ Data ada di database (6 items)
- ✅ API endpoint berfungsi
- ⏳ Frontend perlu di-restart dengan cache clear
- ⏳ Browser perlu hard refresh

**Next**: Clear cache → Restart → Hard refresh
