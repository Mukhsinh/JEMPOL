# 🚀 Deploy ke Vercel Tanpa GitHub

## Alternatif: Deploy Langsung dari Local

Jika tidak ingin menggunakan GitHub, Anda bisa deploy langsung dari komputer lokal menggunakan Vercel CLI.

## 📋 Langkah-Langkah

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login ke Vercel

```bash
vercel login
```

Pilih metode login:
- Email
- GitHub
- GitLab
- Bitbucket

### Step 3: Deploy dari Local

```bash
# Masuk ke folder project
cd "D:\Aplikasi Antigravity\JEMPOL"

# Deploy (preview)
vercel

# Atau deploy langsung ke production
vercel --prod
```

### Step 4: Jawab Pertanyaan Setup

Vercel CLI akan menanyakan beberapa hal:

```
? Set up and deploy "D:\Aplikasi Antigravity\JEMPOL"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] N
? What's your project's name? JEMPOL
? In which directory is your code located? ./
```

### Step 5: Configure Build Settings

Vercel akan detect project type. Jika ditanya:

```
? Want to override the settings? [y/N] Y

Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Development Command: npm run dev
```

### Step 6: Add Environment Variables

Setelah deploy pertama kali, tambahkan environment variables:

```bash
# Via CLI
vercel env add VITE_API_URL production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add JWT_SECRET production

# Atau via Dashboard
# https://vercel.com/dashboard → Project → Settings → Environment Variables
```

### Step 7: Redeploy dengan Environment Variables

```bash
vercel --prod
```

## 🔄 Update & Redeploy

Setiap kali ada perubahan code:

```bash
# 1. Test build lokal
npm run build

# 2. Deploy ke production
vercel --prod
```

## ⚙️ Vercel CLI Commands

### Deploy Commands
```bash
vercel                    # Deploy ke preview
vercel --prod            # Deploy ke production
vercel --force           # Force redeploy
vercel --yes             # Skip confirmations
```

### Environment Variables
```bash
vercel env ls            # List all env vars
vercel env add           # Add new env var
vercel env rm            # Remove env var
vercel env pull          # Pull env vars to local
```

### Project Management
```bash
vercel ls                # List deployments
vercel inspect [URL]     # Inspect deployment
vercel logs [URL]        # View logs
vercel domains           # Manage domains
vercel alias             # Manage aliases
```

### Other Commands
```bash
vercel whoami            # Check logged in user
vercel logout            # Logout
vercel help              # Show help
```

## 📊 Kelebihan & Kekurangan

### ✅ Kelebihan Deploy Tanpa GitHub:
- Lebih cepat (tidak perlu push ke GitHub)
- Tidak perlu buat repository
- Langsung dari local
- Cocok untuk testing

### ❌ Kekurangan:
- Harus deploy manual setiap update
- Tidak ada version control
- Tidak ada automatic deployment
- Tidak ada collaboration features

## 🎯 Recommended Workflow

### Untuk Development:
```bash
# Deploy ke preview untuk testing
vercel
```

### Untuk Production:
```bash
# Deploy ke production
vercel --prod
```

### Untuk Rollback:
```bash
# List deployments
vercel ls

# Promote specific deployment to production
vercel promote [DEPLOYMENT_URL]
```

## 🔧 Configuration File

Buat file `vercel.json` di root project untuk konfigurasi:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

## 📱 Environment Variables Needed

### Frontend (.env.production)
```env
VITE_API_URL=https://your-project.vercel.app/api
VITE_PUBLIC_URL=https://your-project.vercel.app
```

### Backend (Vercel Dashboard)
```env
NODE_ENV=production
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-project.vercel.app
```

## 🆘 Troubleshooting

### Error: Not logged in
```bash
vercel login
```

### Error: Build failed
```bash
# Check logs
vercel logs [DEPLOYMENT_URL]

# Test build locally
cd frontend
npm run build
```

### Error: Environment variables not set
```bash
# Add via CLI
vercel env add VARIABLE_NAME production

# Or via Dashboard
# https://vercel.com/dashboard → Settings → Environment Variables
```

## 📞 Support

- Vercel CLI Docs: https://vercel.com/docs/cli
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Support: https://vercel.com/support

---

**Recommended**: Gunakan GitHub untuk automatic deployment
**Alternative**: Gunakan Vercel CLI untuk quick testing
**Production**: Setup GitHub + Vercel untuk best workflow
