# 📝 Cara Membuat Repository GitHub

## ❌ Error: Repository not found

Repository `https://github.com/boshadi3030/JEMPOL.git` belum dibuat di GitHub.

## ✅ Langkah-Langkah Membuat Repository

### Step 1: Login ke GitHub

1. Buka browser
2. Pergi ke: https://github.com/login
3. Login dengan akun **boshadi3030**

### Step 2: Buat Repository Baru

1. Setelah login, klik tombol **"+"** di pojok kanan atas
2. Pilih **"New repository"**
3. Atau langsung buka: https://github.com/new

### Step 3: Isi Form Repository

**Repository name**: `JEMPOL`

**Description** (optional): 
```
Jembatan Pembayaran Online - RSUD Bendan Kota Pekalongan
```

**Visibility**: 
- ✅ **Public** (Pilih ini untuk Vercel free tier)
- ⚪ Private (Jika perlu private, tapi Vercel free tier terbatas)

**Initialize this repository with**:
- ❌ **JANGAN** centang "Add a README file"
- ❌ **JANGAN** centang "Add .gitignore"
- ❌ **JANGAN** centang "Choose a license"

**PENTING**: Biarkan semua checkbox KOSONG!

### Step 4: Create Repository

Klik tombol **"Create repository"** (hijau)

### Step 5: Copy URL

Setelah repository dibuat, GitHub akan menampilkan halaman dengan instruksi.
Copy URL repository: `https://github.com/boshadi3030/JEMPOL.git`

### Step 6: Push Code

Sekarang jalankan command berikut di terminal:

```bash
git remote add origin https://github.com/boshadi3030/JEMPOL.git
git branch -M main
git push -u origin main
```

Atau gunakan script:
```bash
PUSH_TO_GITHUB.bat
```

## 🔐 Jika Diminta Login

Jika diminta username dan password saat push:

### Option 1: Personal Access Token (Recommended)

1. Buka: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Note: `JEMPOL Deploy`
4. Expiration: `90 days` atau `No expiration`
5. Select scopes: ✅ **repo** (centang semua)
6. Click "Generate token"
7. **COPY TOKEN** (hanya muncul sekali!)

Gunakan token sebagai password:
```
Username: boshadi3030
Password: [PASTE TOKEN DISINI]
```

### Option 2: GitHub CLI

```bash
# Install GitHub CLI
winget install GitHub.cli

# Login
gh auth login

# Push
git push -u origin main
```

## 📸 Screenshot Panduan

### 1. Halaman New Repository
```
https://github.com/new

[+] New repository

Repository name: JEMPOL
Description: Jembatan Pembayaran Online - RSUD Bendan

○ Public  ○ Private

Initialize this repository with:
☐ Add a README file
☐ Add .gitignore
☐ Choose a license

[Create repository]
```

### 2. Setelah Repository Dibuat
```
Quick setup — if you've done this kind of thing before

HTTPS: https://github.com/boshadi3030/JEMPOL.git

…or push an existing repository from the command line

git remote add origin https://github.com/boshadi3030/JEMPOL.git
git branch -M main
git push -u origin main
```

## ✅ Verifikasi Repository Berhasil Dibuat

1. Buka: https://github.com/boshadi3030/JEMPOL
2. Harus tampil halaman repository (bukan 404)
3. Jika masih kosong, itu normal (belum di-push)

## 🚀 Setelah Repository Dibuat

### 1. Push Code
```bash
git push -u origin main
```

### 2. Verify di GitHub
Refresh halaman repository, harus tampil semua files.

### 3. Deploy ke Vercel
1. Login: https://vercel.com/login
2. New Project: https://vercel.com/new
3. Import dari GitHub
4. Pilih repository "JEMPOL"
5. Deploy

## 🆘 Troubleshooting

### Repository sudah dibuat tapi masih error "not found"

**Kemungkinan**:
1. URL salah (typo di username atau nama repo)
2. Repository private tapi tidak punya akses
3. Cache git, coba:
   ```bash
   git remote remove origin
   git remote add origin https://github.com/boshadi3030/JEMPOL.git
   git push -u origin main
   ```

### Authentication failed

**Solusi**: Gunakan Personal Access Token sebagai password

### Permission denied

**Solusi**: Pastikan login dengan akun yang benar (boshadi3030)

## 📞 Quick Links

- **New Repository**: https://github.com/new
- **Your Repositories**: https://github.com/boshadi3030?tab=repositories
- **Personal Access Tokens**: https://github.com/settings/tokens
- **GitHub Docs**: https://docs.github.com/en/get-started/quickstart/create-a-repo

---

**Next Step**: Buat repository di GitHub, lalu push code
**Estimated Time**: 2-3 minutes
