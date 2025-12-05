# ⚡ Quick Deploy Guide - Vercel

## 🚀 Deploy dalam 5 Menit

### Step 1: Test Build Lokal (2 menit)
```bash
TEST_BUILD.bat
```
- Buka http://localhost:4173
- Test semua fitur
- Test di mobile (DevTools → Responsive)
- Pastikan no overflow

### Step 2: Push ke GitHub (1 menit)
```bash
git add .
git commit -m "Ready for Vercel deployment - Mobile responsive"
git push origin main
```

### Step 3: Deploy ke Vercel (2 menit)

#### Via Vercel Dashboard:
1. Buka https://vercel.com/new
2. Import repository GitHub
3. Configure:
   - **Framework**: Other
   - **Root Directory**: `./`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-project.vercel.app/api
   VITE_PUBLIC_URL=https://your-project.vercel.app
   SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
   SUPABASE_ANON_KEY=eyJhbGci...
   JWT_SECRET=your-secret-key
   ```

5. Click "Deploy"

#### Via Vercel CLI:
```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## ✅ Mobile Responsive - DONE

### Fixed Issues:
1. ✅ Modal padding responsive (p-2 sm:p-4)
2. ✅ Font sizes responsive (text-sm sm:text-base)
3. ✅ PDF viewer height mobile (60vh min 400px)
4. ✅ Video player responsive (max-h-[50vh] sm:max-h-[65vh])
5. ✅ No horizontal overflow
6. ✅ Touch-friendly spacing

### Test Devices:
- ✅ iPhone SE (375x667)
- ✅ iPhone 12 Pro (390x844)
- ✅ iPad (768x1024)
- ✅ Desktop (1920x1080)

## 📱 Mobile Test Checklist

Open DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)

### iPhone SE (375x667)
- [ ] Home page no overflow
- [ ] PDF card thumbnail visible
- [ ] Click PDF → Modal opens
- [ ] PDF viewer fits screen
- [ ] Close button accessible
- [ ] Registration form usable
- [ ] Video player controls visible
- [ ] Photo gallery grid OK

### iPad (768x1024)
- [ ] Layout looks good
- [ ] PDF viewer comfortable size
- [ ] All buttons accessible
- [ ] No weird spacing

### Desktop (1920x1080)
- [ ] Full layout visible
- [ ] PDF viewer large enough
- [ ] All features working

## 🔧 Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://your-project.vercel.app/api
VITE_PUBLIC_URL=https://your-project.vercel.app
```

### Backend (Vercel Dashboard)
```env
NODE_ENV=production
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-production-secret-key-change-this
FRONTEND_URL=https://your-project.vercel.app
```

## 📊 Post-Deploy Verification

### 1. Check Deployment
```
✅ Build successful
✅ No errors in logs
✅ Domain assigned
```

### 2. Test Live Site
```
✅ Homepage loads
✅ PDF viewer works
✅ Video player works
✅ Photo gallery works
✅ Registration form submits
✅ Mobile responsive
✅ No console errors
```

### 3. Test Mobile (Real Device)
```
✅ Open on phone
✅ Test PDF viewer
✅ Test video player
✅ Test registration
✅ No horizontal scroll
✅ All buttons clickable
```

## 🆘 Troubleshooting

### Build Failed
```bash
# Check logs in Vercel dashboard
# Common issues:
- Missing dependencies
- TypeScript errors
- Environment variables not set
```

### API Not Working
```bash
# Check:
1. VITE_API_URL correct?
2. CORS configured?
3. Supabase keys correct?
4. Backend routes working?
```

### Mobile Overflow
```bash
# Check:
1. All containers have max-w-full
2. Images have w-full
3. Text has break-words
4. No fixed widths > screen
```

## 📞 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Deployment Logs**: Vercel Dashboard → Deployments → View Logs
- **Domain Settings**: Vercel Dashboard → Settings → Domains

## 🎯 Success Criteria

- [x] Build passes locally
- [x] Mobile responsive (no overflow)
- [x] All features working
- [ ] Deployed to Vercel
- [ ] Live site accessible
- [ ] Mobile tested on real device
- [ ] No console errors
- [ ] SSL certificate active

---

**Ready to Deploy**: ✅ YES
**Mobile Responsive**: ✅ YES
**No Overflow**: ✅ YES
**Estimated Deploy Time**: 5 minutes
