# 🧪 Panduan Testing Aplikasi JEMPOL

## ✅ Checklist Testing

### 1. Game Testing
- [x] Game dapat dimainkan tanpa error
- [x] Touch control berfungsi di mobile
- [x] Mouse control berfungsi di desktop
- [x] Score tersimpan ke database
- [x] Leaderboard tampil dengan benar
- [x] Game over handling sempurna
- [x] Pause/resume berfungsi
- [x] Level progression berjalan

### 2. Materi Testing
- [x] PowerPoint dapat ditampilkan
- [x] PDF dapat ditampilkan
- [x] Video dapat diputar
- [x] Foto dapat ditampilkan
- [x] Download file berfungsi
- [x] View count terupdate
- [x] Error handling untuk network issues

### 3. Data Pengunjung Testing
- [x] Form validasi berfungsi
- [x] Data tersimpan ke database
- [x] Success message tampil
- [x] Error handling sempurna
- [x] Admin dapat melihat data
- [x] Export data berfungsi

## 🚀 Cara Testing

### Testing Otomatis (Recommended)

```bash
# Jalankan semua test sekaligus
TEST_SEMUA_FITUR.bat
```

Script ini akan:
1. Test koneksi backend
2. Test database operations
3. Test semua API endpoints
4. Build frontend
5. Test production build

### Testing Manual

#### 1. Test Backend Connection
```bash
cd backend
npm run test:connection
```

#### 2. Test Database
```bash
cd backend
npm run test:database
```

#### 3. Test API Endpoints
```bash
cd backend
npm run test:all
```

#### 4. Test Frontend Build
```bash
cd frontend
npm run build
```

#### 5. Test Production Preview
```bash
cd frontend
npm run preview
```

## 🎮 Testing Game

### Desktop Testing
1. Buka http://localhost:3001/game
2. Pilih mode Single Player atau Multiplayer
3. Gunakan mouse untuk menggerakkan basket
4. Tangkap item hijau (good) dan emas (bonus)
5. Hindari item merah (bad)
6. Cek score tersimpan setelah game over

### Mobile Testing
1. Buka aplikasi di mobile browser
2. Pilih mode game
3. Gunakan touch untuk menggerakkan basket
4. Pastikan touch control responsif
5. Cek orientasi landscape dan portrait

### Expected Results
- ✅ Game berjalan smooth 60 FPS
- ✅ Tidak ada lag atau freeze
- ✅ Score tersimpan ke database
- ✅ Leaderboard update real-time
- ✅ Tidak ada error di console

## 📚 Testing Materi

### PowerPoint Testing
1. Upload file .pptx atau .ppt
2. Buka dari gallery
3. Cek viewer Office Online
4. Cek viewer Google Docs
5. Test download file

### PDF Testing
1. Upload file .pdf
2. Buka dari gallery
3. Cek PDF viewer inline
4. Test zoom dan navigation
5. Test download file

### Video Testing
1. Upload file video (.mp4, .webm, .mov)
2. Buka dari gallery
3. Test play/pause
4. Test volume control
5. Test fullscreen
6. Cek loading indicator

### Photo Testing
1. Upload foto (.jpg, .png, .gif, .webp)
2. Buka dari gallery
3. Cek image loading
4. Test zoom (jika ada)
5. Test bulk upload (multiple photos)

### Expected Results
- ✅ Semua file type tampil dengan benar
- ✅ Loading indicator muncul saat loading
- ✅ Error message jelas jika gagal load
- ✅ Download berfungsi sempurna
- ✅ View count terupdate

## 👥 Testing Data Pengunjung

### Registration Testing
1. Buka halaman home
2. Isi form pendaftaran:
   - Nama: minimal 2 karakter
   - Instansi: minimal 2 karakter
   - Jabatan: minimal 2 karakter
   - No HP: minimal 10 digit
3. Submit form
4. Cek success message
5. Cek data di admin panel

### Validation Testing
1. Submit form kosong → Error "Semua field harus diisi"
2. Nama 1 karakter → Error "Nama minimal 2 karakter"
3. No HP < 10 digit → Error "Nomor tidak valid"
4. Submit valid data → Success

### Admin Panel Testing
1. Login sebagai admin
2. Buka Visitor Management
3. Cek data pengunjung tampil
4. Test search/filter
5. Test export to CSV
6. Test delete visitor

### Expected Results
- ✅ Form validation berfungsi
- ✅ Data tersimpan sempurna
- ✅ Success message tampil
- ✅ Admin dapat melihat data
- ✅ Export CSV berfungsi

## 🔧 Troubleshooting

### Game Tidak Berjalan
```bash
# Cek console browser untuk error
# Pastikan canvas element ada
# Cek browser compatibility
```

### Materi Tidak Tampil
```bash
# Cek network tab di browser
# Pastikan file URL benar
# Cek CORS headers
# Pastikan file exists di uploads/
```

### Data Tidak Tersimpan
```bash
# Cek backend logs
# Test database connection
npm run test:connection

# Test database operations
npm run test:database

# Cek Supabase dashboard
```

### Build Error
```bash
# Clear cache
cd frontend
rm -rf node_modules dist
npm install
npm run build

# Cek TypeScript errors
npm run build -- --mode development
```

## 📊 Performance Testing

### Load Testing
```bash
# Test dengan banyak concurrent users
# Gunakan tools seperti Apache Bench atau k6
ab -n 1000 -c 10 http://localhost:5000/api/health
```

### Network Testing
```bash
# Test dengan slow 3G
# Buka Chrome DevTools → Network → Throttling → Slow 3G
# Pastikan loading indicators muncul
# Pastikan error handling berfungsi
```

### Mobile Testing
```bash
# Test di berbagai device
# iPhone: Safari
# Android: Chrome
# Tablet: iPad, Android Tablet
# Cek responsive design
# Cek touch interactions
```

## ✅ Production Checklist

Sebelum deploy ke production:

- [ ] Semua test passed
- [ ] No console errors
- [ ] No console warnings
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] CORS configured correctly
- [ ] File upload limits set
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Security headers set
- [ ] SSL certificate installed

## 🎯 Success Criteria

Aplikasi dianggap siap production jika:

1. ✅ Game dapat dimainkan sempurna tanpa error
2. ✅ Materi (PowerPoint, PDF, Video, Foto) tampil sempurna
3. ✅ Data pengunjung tersimpan sempurna
4. ✅ Tidak ada error di console
5. ✅ Build production berhasil
6. ✅ Performance baik (< 3s load time)
7. ✅ Mobile responsive sempurna
8. ✅ Error handling comprehensive

## 📝 Test Results Log

Catat hasil testing di sini:

```
Date: ___________
Tester: ___________

Game Testing: ✅ / ❌
Materi Testing: ✅ / ❌
Data Pengunjung Testing: ✅ / ❌
Build Testing: ✅ / ❌

Notes:
_______________________
_______________________
_______________________
```

## 🆘 Support

Jika menemukan bug atau issue:
1. Cek console browser untuk error
2. Cek backend logs
3. Cek database connection
4. Baca TROUBLESHOOTING.md
5. Contact developer

---

**Happy Testing! 🚀**
