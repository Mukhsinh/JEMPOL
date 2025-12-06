# 🚀 Panduan Deploy Perbaikan ke Production

## 📋 Checklist Sebelum Deploy

- [x] Database migration sudah dijalankan
- [x] Frontend API service sudah diperbaiki
- [x] Backend CORS sudah dikonfigurasi
- [x] Game service format data sudah diperbaiki
- [x] Vercel.json routing sudah diupdate
- [x] Environment variables sudah dicek

## 🔧 Langkah-Langkah Deploy

### 1. Verifikasi Local (Opsional)

Sebelum deploy, test dulu di local:

```bash
# Test backend
cd backend
npm install
npm run dev

# Di terminal lain, test frontend
cd frontend
npm install
npm run dev
```

Buka browser:
- Frontend: http://localhost:3001
- Test registrasi, game, dan materi

### 2. Commit dan Push ke GitHub

```bash
# Add all changes
git add .

# Commit dengan message yang jelas
git commit -m "fix: Perbaiki error registrasi, game, dan CORS untuk production

- Fix API URL configuration untuk production
- Fix game service data format (camelCase to snake_case)
- Update CORS untuk allow Vercel deployments
- Apply database migration untuk RLS policies
- Update vercel.json routing configuration"

# Push ke GitHub
git push origin main
```

### 3. Monitor Vercel Deployment

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. **Pilih Project**: jempol-frontend
3. **Lihat Deployments**: Akan muncul deployment baru
4. **Tunggu Build**: Biasanya 2-3 menit
5. **Cek Status**: Pastikan status "Ready"

### 4. Set Environment Variables di Vercel

Pastikan environment variables sudah diset:

1. Buka **Settings** → **Environment Variables**
2. Tambahkan/Update variables berikut:

```
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
PORT=5000
```

3. **Apply to**: Production, Preview, Development
4. **Redeploy** jika perlu

### 5. Test Production Endpoints

#### A. Manual Test via Browser

1. **Health Check**: https://jempol-frontend.vercel.app/api/health
   - Harus return: `{"success":true,"message":"Server is running"}`

2. **Test Registrasi**:
   - Buka: https://jempol-frontend.vercel.app/#registration
   - Isi form dan submit
   - Harus berhasil tanpa error

3. **Test Game**:
   - Buka: https://jempol-frontend.vercel.app/game
   - Harus load tanpa 404
   - Mainkan game dan submit score

4. **Test Materi**:
   - Buka galeri materi
   - Klik foto/video
   - Harus bisa dibuka tanpa CORS error

#### B. Automated Test via Script

Jalankan script test:

```bash
# Windows
TEST_PRODUCTION.bat

# Atau manual dengan curl
curl https://jempol-frontend.vercel.app/api/health
curl https://jempol-frontend.vercel.app/api/visitors
curl https://jempol-frontend.vercel.app/api/game/leaderboard
```

### 6. Verifikasi Database

Buka Supabase Dashboard dan jalankan query:

```sql
-- Check data terbaru
SELECT * FROM visitors ORDER BY registered_at DESC LIMIT 5;
SELECT * FROM game_scores ORDER BY played_at DESC LIMIT 5;
SELECT * FROM innovations ORDER BY uploaded_at DESC LIMIT 5;

-- Check RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('visitors', 'game_scores', 'innovations');
```

## 🐛 Troubleshooting

### Error: "Cannot connect to server"

**Solusi:**
1. Cek Vercel Function Logs
2. Pastikan backend build berhasil
3. Cek environment variables
4. Test API health endpoint

```bash
curl https://jempol-frontend.vercel.app/api/health
```

### Error: 404 Not Found

**Solusi:**
1. Cek vercel.json routing
2. Pastikan build frontend berhasil
3. Clear browser cache
4. Hard refresh (Ctrl + Shift + R)

### Error: CORS Policy

**Solusi:**
1. Cek backend CORS configuration
2. Pastikan origin ter-allow
3. Cek browser console untuk origin yang di-block
4. Update allowedOrigins di server.ts

### Error: Database Connection

**Solusi:**
1. Cek Supabase status: https://status.supabase.com
2. Verify SUPABASE_URL dan SUPABASE_ANON_KEY
3. Test connection dari Vercel logs
4. Cek RLS policies

## 📊 Monitoring

### 1. Vercel Logs

```
Vercel Dashboard → Project → Deployments → Latest → View Function Logs
```

Monitor untuk:
- API request errors
- Database connection errors
- CORS errors
- Timeout errors

### 2. Supabase Logs

```
Supabase Dashboard → Project → Logs → API
```

Monitor untuk:
- Failed queries
- RLS policy violations
- Connection issues

### 3. Browser Console

Buka DevTools (F12) dan monitor:
- Network errors
- CORS errors
- JavaScript errors
- API response times

## ✅ Success Criteria

Deploy dianggap berhasil jika:

- [ ] Health check return 200 OK
- [ ] Registrasi pengunjung berhasil
- [ ] Game dapat dimainkan dan score tersimpan
- [ ] Materi/video/foto dapat dibuka
- [ ] Tidak ada CORS error di console
- [ ] Tidak ada 404 error
- [ ] Response time < 3 detik

## 🔄 Rollback Plan

Jika deployment gagal:

1. **Rollback via Vercel**:
   - Buka Deployments
   - Pilih deployment sebelumnya yang working
   - Klik "Promote to Production"

2. **Rollback via Git**:
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Rollback Database**:
   - Supabase migrations bisa di-revert manual
   - Atau restore dari backup

## 📞 Support Checklist

Jika masih ada masalah, kumpulkan info berikut:

1. **Error Message**: Screenshot atau copy exact error
2. **Browser Console**: Screenshot console errors
3. **Network Tab**: Screenshot failed requests
4. **Vercel Logs**: Copy relevant log entries
5. **Supabase Logs**: Copy relevant log entries
6. **Steps to Reproduce**: Langkah-langkah untuk reproduce error

## 🎯 Post-Deployment Tasks

Setelah deploy berhasil:

1. **Notify Users**: Informasikan bahwa bug sudah diperbaiki
2. **Monitor**: Pantau logs selama 24 jam pertama
3. **Collect Feedback**: Minta user test dan report issues
4. **Document**: Update dokumentasi jika ada perubahan
5. **Backup**: Backup database setelah deploy stabil

## 📝 Deployment Log Template

```
Date: 2025-12-06
Time: [HH:MM]
Deployed By: [Your Name]
Commit: [Git Commit Hash]
Status: [Success/Failed]

Changes:
- Fixed API URL configuration
- Fixed game service data format
- Updated CORS configuration
- Applied database migration
- Updated Vercel routing

Tests:
- [ ] Health check: OK
- [ ] Registrasi: OK
- [ ] Game: OK
- [ ] Materi: OK

Issues:
- None / [List any issues]

Notes:
[Any additional notes]
```

---

**Last Updated**: 2025-12-06
**Version**: 1.0.0
**Status**: Ready for Deployment ✅
