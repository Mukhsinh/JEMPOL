# 🔧 Setup GitHub & Deploy ke Vercel

## ❌ Error: Repository not found

Error ini terjadi karena repository GitHub belum dibuat atau URL salah.

## ✅ Solusi: Setup GitHub Repository

### Step 1: Buat Repository di GitHub

1. **Buka GitHub**: https://github.com/new
2. **Repository name**: `JEMPOL` (atau nama lain)
3. **Description**: `Jembatan Pembayaran Online - RSUD Bendan`
4. **Visibility**: 
   - ✅ **Public** (recommended untuk Vercel free tier)
   - Private (jika perlu, tapi Vercel free tier limited)
5. **Initialize**: 
   - ❌ JANGAN centang "Add README"
   - ❌ JANGAN centang "Add .gitignore"
   - ❌ JANGAN centang "Choose a license"
6. **Click**: "Create repository"

### Step 2: Update Remote URL

Setelah repository dibuat, GitHub akan menampilkan URL. Copy URL tersebut, lalu:

```bash
# Remove old remote
git remote remove origin

# Add new remote (ganti dengan URL repository Anda)
git remote add origin https://github.com/USERNAME/JEMPOL.git

# Verify
git remote -v
```

**Contoh**:
```bash
git remote add origin https://github.com/boshadi3030/JEMPOL.git
```

### Step 3: Push ke GitHub

```bash
# Push ke GitHub
git push -u origin main

# Jika error "failed to push", coba:
git push -u origin main --force
```

### Step 4: Verify di GitHub

1. Buka repository di browser
2. Pastikan semua files sudah ada
3. Cek branch "main" ada

## 🚀 Deploy ke Vercel (Setelah Push Berhasil)

### Option 1: Via Vercel Dashboard

1. **Login Vercel**: https://vercel.com/login
2. **New Project**: https://vercel.com/new
3. **Import Git Repository**:
   - Pilih GitHub
   - Authorize Vercel (jika belum)
   - Pilih repository "JEMPOL"
   - Click "Import"

4. **Configure Project**:
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: cd frontend && npm install && npm run build
   Output Directory: frontend/dist
   Install Command: npm install
   ```

5. **Environment Variables**:
   Click "Environment Variables" dan tambahkan:
   
   **Frontend**:
   ```
   VITE_API_URL = https://your-project.vercel.app/api
   VITE_PUBLIC_URL = https://your-project.vercel.app
   ```
   
   **Backend**:
   ```
   NODE_ENV = production
   SUPABASE_URL = https://jxxzbdivafzzwqhagwrf.supabase.co
   SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   JWT_SECRET = your-production-secret-key
   FRONTEND_URL = https://your-project.vercel.app
   ```

6. **Deploy**: Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🔍 Troubleshooting

### Error: Repository not found
**Cause**: Repository belum dibuat di GitHub atau URL salah

**Solution**:
1. Buat repository baru di GitHub
2. Update remote URL
3. Push ulang

### Error: Permission denied
**Cause**: Tidak punya akses ke repository

**Solution**:
1. Pastikan login dengan akun yang benar
2. Atau buat repository baru dengan akun Anda

### Error: Branch not found
**Cause**: Branch "main" belum di-push

**Solution**:
```bash
git push -u origin main --force
```

### Error: Authentication failed
**Cause**: Credentials salah atau expired

**Solution**:
```bash
# Use Personal Access Token
# GitHub → Settings → Developer settings → Personal access tokens
# Generate new token dengan scope "repo"

# Update remote dengan token
git remote set-url origin https://TOKEN@github.com/USERNAME/JEMPOL.git
```

## 📋 Quick Commands

### Setup Git (First Time)
```bash
# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize (if not done)
git init
git add .
git commit -m "Initial commit - Ready for Vercel"
```

### Create & Push to GitHub
```bash
# After creating repository on GitHub
git remote add origin https://github.com/USERNAME/JEMPOL.git
git branch -M main
git push -u origin main
```

### Update & Push Changes
```bash
git add .
git commit -m "Update for deployment"
git push origin main
```

## 🎯 Alternative: Deploy Tanpa GitHub

Jika tidak ingin menggunakan GitHub, bisa deploy langsung dengan Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy dari local
cd D:\Aplikasi Antigravity\JEMPOL
vercel

# Deploy to production
vercel --prod
```

**Note**: Dengan cara ini, setiap update harus deploy manual dengan `vercel --prod`.

## 📞 Need Help?

### GitHub Issues:
- Repository not found → Buat repository baru
- Permission denied → Check akun GitHub
- Authentication failed → Generate Personal Access Token

### Vercel Issues:
- Build failed → Check build logs
- Environment variables → Verify all vars set
- Domain issues → Check DNS settings

## ✅ Success Checklist

- [ ] Repository dibuat di GitHub
- [ ] Remote URL updated
- [ ] Code pushed ke GitHub
- [ ] Repository visible di GitHub
- [ ] Branch "main" exists
- [ ] Ready to import di Vercel

---

**Next Step**: Setelah push berhasil, import repository di Vercel Dashboard
**Estimated Time**: 5-10 minutes
