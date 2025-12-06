# ✅ Checklist Deploy - Perbaikan Error JEMPOL

## 📋 Pre-Deployment Checklist

### Database
- [x] Migration script created
- [x] Migration applied successfully
- [x] RLS policies verified
- [x] Indexes created
- [x] Triggers created
- [x] Permissions granted

### Frontend
- [x] `.env.production` updated
- [x] `api.ts` fixed (auto-detect environment)
- [x] `gameService.ts` fixed (format conversion)
- [x] No TypeScript errors
- [x] No linting errors
- [x] Build successful locally

### Backend
- [x] CORS configuration updated
- [x] Socket.IO CORS updated
- [x] Environment variables verified
- [x] No TypeScript errors
- [x] No linting errors
- [x] Server starts successfully

### Configuration
- [x] `vercel.json` updated
- [x] Routing configuration verified
- [x] CORS headers added
- [x] Cache headers configured

### Documentation
- [x] PERBAIKAN_LENGKAP_ERROR.md created
- [x] DEPLOY_FIX_GUIDE.md created
- [x] RINGKASAN_PERBAIKAN_FINAL.md created
- [x] SUMMARY_PERBAIKAN.md created
- [x] BACA_DULU_SEBELUM_DEPLOY.txt created
- [x] CHECKLIST_DEPLOY.md created (this file)

### Testing Scripts
- [x] test-all-endpoints.js created
- [x] TEST_PRODUCTION.bat created
- [x] TEST_LOCAL_API.bat created
- [x] DEPLOY_PERBAIKAN.bat created

---

## 🚀 Deployment Steps

### Step 1: Final Verification
```bash
# Check Git status
[ ] git status

# Review changes
[ ] git diff

# Verify no uncommitted changes that shouldn't be deployed
[ ] Review file list
```

### Step 2: Commit Changes
```bash
[ ] git add .
[ ] git commit -m "fix: Perbaiki error registrasi, game, dan CORS"
[ ] Verify commit message
```

### Step 3: Push to GitHub
```bash
[ ] git push origin main
[ ] Verify push successful
[ ] Check GitHub repository
```

### Step 4: Monitor Vercel Deployment
```bash
[ ] Open Vercel Dashboard
[ ] Navigate to project
[ ] Watch deployment progress
[ ] Wait for "Ready" status
[ ] Check deployment logs for errors
```

### Step 5: Verify Environment Variables
```bash
[ ] Open Vercel Settings → Environment Variables
[ ] Verify SUPABASE_URL is set
[ ] Verify SUPABASE_ANON_KEY is set
[ ] Verify JWT_SECRET is set
[ ] Verify NODE_ENV is set to "production"
```

---

## 🧪 Post-Deployment Testing

### Automated Tests
```bash
[ ] Run TEST_PRODUCTION.bat
[ ] Verify all endpoints return 200 OK
[ ] Check response data format
```

### Manual Tests

#### 1. Health Check
```bash
[ ] Open: https://jempol-frontend.vercel.app/api/health
[ ] Expected: {"success":true,"message":"Server is running"}
[ ] Status: 200 OK
```

#### 2. Registrasi Pengunjung
```bash
[ ] Navigate to: https://jempol-frontend.vercel.app/#registration
[ ] Fill form:
    [ ] Nama: Test User
    [ ] Instansi: Test Hospital
    [ ] Jabatan: Dokter
    [ ] No HP: 081234567890
[ ] Click "Daftar Sekarang"
[ ] Expected: "Pendaftaran Berhasil!" message
[ ] Verify: No console errors
[ ] Verify: Form cleared after submit
```

#### 3. Game
```bash
[ ] Navigate to: https://jempol-frontend.vercel.app/game
[ ] Expected: Page loads (no 404)
[ ] Select mode: Single Player
[ ] Play game for 30 seconds
[ ] Submit score
[ ] Expected: Score appears in leaderboard
[ ] Verify: No console errors
```

#### 4. Materi (PowerPoint/PDF)
```bash
[ ] Navigate to materi gallery
[ ] Click on PowerPoint thumbnail
[ ] Expected: Viewer opens
[ ] Verify: Content displays
[ ] Verify: No CORS errors in console
[ ] Close viewer
[ ] Click on PDF thumbnail
[ ] Expected: PDF opens
[ ] Verify: Content displays
```

#### 5. Video
```bash
[ ] Navigate to video gallery
[ ] Click on video thumbnail
[ ] Expected: Video player opens
[ ] Click play
[ ] Expected: Video plays
[ ] Verify: No CORS errors in console
```

#### 6. Foto
```bash
[ ] Navigate to foto gallery
[ ] Click on photo thumbnail
[ ] Expected: Photo viewer opens
[ ] Verify: Image displays
[ ] Verify: No CORS errors in console
[ ] Test navigation (next/previous)
[ ] Expected: Navigation works
```

---

## 🔍 Verification Checklist

### Browser Console
```bash
[ ] Open DevTools (F12)
[ ] Navigate to Console tab
[ ] Verify: No red errors
[ ] Verify: No CORS errors
[ ] Verify: No 404 errors
[ ] Verify: API calls successful
```

### Network Tab
```bash
[ ] Open DevTools → Network tab
[ ] Reload page
[ ] Verify: All requests return 200 OK
[ ] Verify: API responses are valid JSON
[ ] Verify: Response times < 3 seconds
[ ] Verify: No failed requests
```

### Database Verification
```sql
-- Run in Supabase SQL Editor

[ ] -- Check new visitor record
    SELECT * FROM visitors ORDER BY registered_at DESC LIMIT 1;

[ ] -- Check new game score
    SELECT * FROM game_scores ORDER BY played_at DESC LIMIT 1;

[ ] -- Verify RLS policies
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE tablename IN ('visitors', 'game_scores', 'innovations');

[ ] -- Check data counts
    SELECT 
      (SELECT COUNT(*) FROM visitors) as total_visitors,
      (SELECT COUNT(*) FROM game_scores) as total_games,
      (SELECT COUNT(*) FROM innovations) as total_innovations;
```

---

## 📊 Monitoring Checklist

### Vercel Logs (First Hour)
```bash
[ ] Open Vercel → Deployments → Latest → View Function Logs
[ ] Monitor for errors
[ ] Check API request logs
[ ] Verify response times
[ ] Check for any warnings
```

### Supabase Logs (First Hour)
```bash
[ ] Open Supabase → Logs → API
[ ] Monitor for errors
[ ] Check query performance
[ ] Verify RLS policy enforcement
[ ] Check for any warnings
```

### User Feedback (First 24 Hours)
```bash
[ ] Monitor user reports
[ ] Check for error reports
[ ] Verify feature usage
[ ] Collect feedback
[ ] Document any issues
```

---

## 🐛 Troubleshooting Checklist

### If Health Check Fails
```bash
[ ] Check Vercel deployment status
[ ] Check Vercel Function Logs
[ ] Verify environment variables
[ ] Check backend build logs
[ ] Verify Supabase connection
```

### If Registrasi Fails
```bash
[ ] Check browser console for errors
[ ] Check Network tab for failed requests
[ ] Verify API URL in request
[ ] Check Vercel Function Logs
[ ] Verify Supabase RLS policies
[ ] Test with curl:
    curl -X POST https://jempol-frontend.vercel.app/api/visitors \
      -H "Content-Type: application/json" \
      -d '{"nama":"Test","instansi":"Test","jabatan":"Test","no_handphone":"081234567890"}'
```

### If Game Fails
```bash
[ ] Check browser console for errors
[ ] Verify page loads (not 404)
[ ] Check Network tab for API calls
[ ] Verify data format in request
[ ] Check Vercel Function Logs
[ ] Test leaderboard endpoint:
    curl https://jempol-frontend.vercel.app/api/game/leaderboard
```

### If CORS Errors
```bash
[ ] Check browser console for blocked origin
[ ] Verify origin in error message
[ ] Check backend CORS configuration
[ ] Verify vercel.json headers
[ ] Check Vercel Function Logs
[ ] Test with curl (should work):
    curl -H "Origin: https://jempol-frontend.vercel.app" \
      https://jempol-frontend.vercel.app/api/health
```

---

## 📝 Rollback Plan

### If Critical Issues Found
```bash
[ ] Identify the issue
[ ] Document the error
[ ] Decide: Fix forward or rollback?

If Rollback:
[ ] Open Vercel Dashboard
[ ] Navigate to Deployments
[ ] Find last working deployment
[ ] Click "Promote to Production"
[ ] Verify rollback successful
[ ] Document reason for rollback
[ ] Plan fix for next deployment
```

---

## ✅ Sign-Off

### Deployment Completed By
- Name: ___________________
- Date: ___________________
- Time: ___________________

### Testing Completed By
- Name: ___________________
- Date: ___________________
- Time: ___________________

### Verification
- [ ] All tests passed
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] User feedback positive
- [ ] Documentation updated

### Approval
- [ ] Technical Lead: ___________________
- [ ] Product Owner: ___________________
- [ ] QA Lead: ___________________

---

## 📞 Emergency Contacts

### If Issues Arise
1. Check documentation first
2. Review Vercel logs
3. Review Supabase logs
4. Check browser console
5. Document the issue
6. Consider rollback if critical

### Resources
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repository: [Your Repo URL]
- Documentation: See DEPLOY_FIX_GUIDE.md

---

**Status**: Ready for Deployment ✅  
**Last Updated**: 2025-12-06  
**Version**: 1.0.0
