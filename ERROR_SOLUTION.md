# ❌ Error "Network Error" - SOLUSI LENGKAP

## 🔍 Error yang Anda Alami

```
❌ upload error: Error: Network Error
   at XMLHttpRequest.handleError
   
❌ Failed to load resource: net::ERR_CONNECTION_REFUSED
   localhost:5000/api/innovations
```

## 🎯 ROOT CAUSE

**Backend server TIDAK BERJALAN di port 5000!**

Error ini **BUKAN** masalah:
- ❌ Bukan masalah database
- ❌ Bukan masalah Supabase
- ❌ Bukan masalah kode
- ❌ Bukan masalah file upload

Error ini **ADALAH** masalah:
- ✅ Backend server belum dijalankan
- ✅ Port 5000 tidak ada yang listen

## 🚀 SOLUSI - 3 Cara

### Cara 1: Automatic Fix (RECOMMENDED)

**Double-click file ini:**
```
FIX_AND_START.bat
```

Script ini akan:
1. ✅ Cek dan clear port 5000 jika digunakan
2. ✅ Cek MongoDB running
3. ✅ Install dependencies jika perlu
4. ✅ Start backend server

### Cara 2: Manual Start

**Terminal 1 - Start MongoDB:**
```bash
mongod
```
Biarkan terminal ini tetap terbuka!

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run dev
```
Biarkan terminal ini tetap terbuka!

**Harus muncul:**
```
Server running on port 5000
MongoDB connected successfully
```

### Cara 3: Check & Fix

**1. Cek apakah MongoDB running:**
```bash
# Buka Command Prompt
mongosh
# atau
mongo
```

Jika error "connection refused", jalankan:
```bash
mongod
```

**2. Cek apakah port 5000 digunakan:**
```bash
netstat -ano | findstr :5000
```

Jika ada output, kill process:
```bash
taskkill /F /PID [PID_NUMBER]
```

**3. Start backend:**
```bash
cd backend
npm run dev
```

## ✅ Verifikasi Backend Running

### Test 1: Health Check
Buka browser: http://localhost:5000/api/health

**Harus muncul:**
```json
{"success":true,"message":"Server is running"}
```

### Test 2: Check Console
Di terminal backend, harus muncul:
```
Server running on port 5000
MongoDB connected successfully
```

### Test 3: Network Tab
1. Buka browser DevTools (F12)
2. Tab Network
3. Refresh halaman admin
4. Cari request ke localhost:5000
5. Status harus 200, bukan "failed"

## 🎯 Setelah Backend Running

1. **Refresh halaman admin:** http://localhost:3000/admin
2. **Test upload file:**
   - Isi judul dan deskripsi
   - Pilih file PowerPoint atau Video
   - Klik "Upload Konten"
3. **Tidak akan ada error lagi!** ✅

## 📋 Checklist Troubleshooting

Jika masih error, cek satu per satu:

- [ ] MongoDB running? (mongod di terminal)
- [ ] Backend running? (npm run dev di backend folder)
- [ ] Port 5000 available? (netstat -ano | findstr :5000)
- [ ] Health check OK? (http://localhost:5000/api/health)
- [ ] Console backend tidak ada error?
- [ ] Frontend bisa akses backend? (cek Network tab)

## 🔧 Common Issues

### Issue 1: "MongoDB connection failed"
**Solusi:**
```bash
# Terminal baru
mongod
```

### Issue 2: "Port 5000 already in use"
**Solusi:**
```bash
# Cari PID
netstat -ano | findstr :5000

# Kill process
taskkill /F /PID [PID_NUMBER]

# Start backend lagi
cd backend
npm run dev
```

### Issue 3: "Cannot find module"
**Solusi:**
```bash
cd backend
npm install
npm run dev
```

### Issue 4: Backend crashes immediately
**Cek:**
1. File .env ada? (backend/.env)
2. MongoDB running?
3. Port 5000 available?
4. Cek error di console

## 📊 Expected Terminal Output

### Terminal 1 (MongoDB):
```
[initandlisten] MongoDB starting
[initandlisten] waiting for connections on port 27017
```

### Terminal 2 (Backend):
```
Server running on port 5000
MongoDB connected successfully
```

### Terminal 3 (Frontend - Optional):
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:3000/
```

## 🎮 Quick Test After Fix

1. Backend health: http://localhost:5000/api/health ✅
2. Frontend: http://localhost:3000 ✅
3. Admin panel: http://localhost:3000/admin ✅
4. Upload file: Should work! ✅

## 💡 Pro Tips

1. **Always keep 2 terminals open:**
   - Terminal 1: MongoDB (mongod)
   - Terminal 2: Backend (npm run dev)

2. **Use batch files for easy start:**
   - FIX_AND_START.bat (backend)
   - START_FRONTEND.bat (frontend)

3. **Check status anytime:**
   - Double-click CHECK_STATUS.bat

4. **If stuck, restart everything:**
   - Close all terminals
   - Start MongoDB
   - Start Backend
   - Start Frontend

## 📞 Still Having Issues?

1. Read: STARTUP_GUIDE.md
2. Read: UPLOAD_TROUBLESHOOTING.md
3. Check: All terminals for error messages
4. Verify: MongoDB, Backend, Frontend all running

---

## 🎯 SUMMARY

**Your error is simple:**
- Backend server is NOT running
- Start it with: `FIX_AND_START.bat`
- Or manually: `cd backend && npm run dev`
- Then upload will work! ✅

**Remember:**
- Keep MongoDB running (mongod)
- Keep Backend running (npm run dev)
- Then everything works!

---

**RSUD Bendan Kota Pekalongan**
Mukhsin Hadi: +62 857 2611 2001
