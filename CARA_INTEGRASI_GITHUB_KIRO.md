# 🔗 Cara Integrasi GitHub Repository di Kiro IDE

## 📋 Langkah-langkah Integrasi

### Metode 1: Menggunakan Git Panel di Kiro (Recommended)

#### 1. Buka Git Panel
- Klik icon **Source Control** di sidebar kiri Kiro
- Atau tekan `Ctrl+Shift+G`

#### 2. Initialize Repository (Jika Belum Ada)
```bash
# Jika belum ada git repository
git init
```

#### 3. Cek Remote Repository
```bash
# Cek apakah sudah ada remote
git remote -v
```

#### 4. Tambahkan Remote Repository
```bash
# Jika belum ada remote, tambahkan
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Contoh:
git remote add origin https://github.com/mukhainilfmpol/jempol-app.git
```

#### 5. Verifikasi Remote
```bash
git remote -v
```

Output yang diharapkan:
```
origin  https://github.com/USERNAME/REPO_NAME.git (fetch)
origin  https://github.com/USERNAME/REPO_NAME.git (push)
```

---

### Metode 2: Menggunakan Terminal di Kiro

#### 1. Buka Terminal
- Klik menu **Terminal** → **New Terminal**
- Atau tekan `` Ctrl+` ``

#### 2. Cek Status Git
```bash
git status
```

#### 3. Tambahkan Remote
```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

#### 4. Pull dari Remote (Jika Repository Sudah Ada)
```bash
# Pull branch main
git pull origin main

# Atau jika ada conflict, gunakan rebase
git pull origin main --rebase
```

#### 5. Push ke Remote
```bash
# Push pertama kali
git push -u origin main

# Push selanjutnya
git push
```

---

### Metode 3: Clone Repository yang Sudah Ada

#### 1. Buka Command Palette
- Tekan `Ctrl+Shift+P`
- Ketik: **Git: Clone**

#### 2. Masukkan URL Repository
```
https://github.com/USERNAME/REPO_NAME.git
```

#### 3. Pilih Folder Tujuan
- Pilih folder di komputer Anda
- Kiro akan clone repository ke folder tersebut

#### 4. Buka Folder di Kiro
- Klik **File** → **Open Folder**
- Pilih folder yang baru di-clone

---

## 🔐 Setup GitHub Authentication

### Opsi 1: Personal Access Token (PAT)

#### 1. Buat Personal Access Token di GitHub
1. Buka https://github.com/settings/tokens
2. Klik **Generate new token** → **Generate new token (classic)**
3. Beri nama token: `Kiro IDE Access`
4. Pilih scope:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Klik **Generate token**
6. **COPY TOKEN** (hanya muncul sekali!)

#### 2. Gunakan Token di Kiro
```bash
# Saat push pertama kali, masukkan:
Username: YOUR_GITHUB_USERNAME
Password: YOUR_PERSONAL_ACCESS_TOKEN
```

#### 3. Simpan Credentials (Optional)
```bash
# Simpan credentials agar tidak perlu input berulang
git config --global credential.helper store

# Atau gunakan cache (15 menit)
git config --global credential.helper cache
```

---

### Opsi 2: SSH Key

#### 1. Generate SSH Key
```bash
# Buka terminal di Kiro
ssh-keygen -t ed25519 -C "your_email@example.com"

# Tekan Enter untuk default location
# Masukkan passphrase (optional)
```

#### 2. Copy Public Key
```bash
# Windows
type %USERPROFILE%\.ssh\id_ed25519.pub

# Copy output yang muncul
```

#### 3. Tambahkan ke GitHub
1. Buka https://github.com/settings/keys
2. Klik **New SSH key**
3. Title: `Kiro IDE`
4. Paste public key
5. Klik **Add SSH key**

#### 4. Test Connection
```bash
ssh -T git@github.com
```

#### 5. Ubah Remote ke SSH
```bash
# Cek remote saat ini
git remote -v

# Ubah ke SSH
git remote set-url origin git@github.com:USERNAME/REPO_NAME.git
```

---

## 📝 Workflow Git di Kiro

### 1. Cek Status
```bash
git status
```

### 2. Stage Changes
```bash
# Stage semua file
git add .

# Stage file tertentu
git add path/to/file.ts
```

**Atau gunakan Git Panel:**
- Klik icon **+** di samping file untuk stage

### 3. Commit Changes
```bash
git commit -m "feat: add new feature"
```

**Atau gunakan Git Panel:**
- Ketik commit message di text box
- Klik **✓** (Commit)

### 4. Push ke GitHub
```bash
git push
```

**Atau gunakan Git Panel:**
- Klik **...** (More Actions)
- Pilih **Push**

### 5. Pull dari GitHub
```bash
git pull
```

**Atau gunakan Git Panel:**
- Klik **...** (More Actions)
- Pilih **Pull**

---

## 🌿 Bekerja dengan Branches

### 1. Lihat Branches
```bash
git branch -a
```

### 2. Buat Branch Baru
```bash
git checkout -b feature/new-feature
```

**Atau gunakan Git Panel:**
- Klik nama branch di status bar (bawah kiri)
- Pilih **Create new branch**

### 3. Switch Branch
```bash
git checkout main
```

**Atau gunakan Git Panel:**
- Klik nama branch di status bar
- Pilih branch yang ingin digunakan

### 4. Merge Branch
```bash
# Pindah ke branch tujuan
git checkout main

# Merge branch
git merge feature/new-feature
```

### 5. Push Branch ke Remote
```bash
git push -u origin feature/new-feature
```

---

## 🔄 Sync dengan Remote

### Pull Latest Changes
```bash
# Pull dari main
git pull origin main

# Atau dengan rebase
git pull origin main --rebase
```

### Push Local Changes
```bash
# Push ke branch saat ini
git push

# Push ke branch tertentu
git push origin main
```

### Fetch Updates
```bash
# Fetch tanpa merge
git fetch origin

# Lihat perubahan
git log origin/main
```

---

## 🛠️ Troubleshooting

### Problem 1: Authentication Failed
```bash
# Solusi: Gunakan Personal Access Token
# Buat token di: https://github.com/settings/tokens
# Gunakan token sebagai password
```

### Problem 2: Remote Already Exists
```bash
# Hapus remote lama
git remote remove origin

# Tambah remote baru
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

### Problem 3: Merge Conflict
```bash
# Lihat file yang conflict
git status

# Edit file yang conflict
# Hapus marker: <<<<<<<, =======, >>>>>>>

# Stage resolved files
git add .

# Commit merge
git commit -m "resolve merge conflict"
```

### Problem 4: Push Rejected
```bash
# Pull dulu
git pull origin main --rebase

# Resolve conflicts jika ada
# Lalu push
git push
```

### Problem 5: Detached HEAD
```bash
# Kembali ke branch
git checkout main
```

---

## 📊 Git Panel Features di Kiro

### 1. Source Control View
- **Changes**: File yang berubah
- **Staged Changes**: File yang sudah di-stage
- **Merge Changes**: File dengan conflict

### 2. Actions
- **Stage All**: Stage semua perubahan
- **Unstage All**: Unstage semua
- **Commit**: Commit changes
- **Push**: Push ke remote
- **Pull**: Pull dari remote
- **Sync**: Pull + Push

### 3. File Actions
- **+**: Stage file
- **-**: Unstage file
- **↶**: Discard changes
- **⊕**: Open file

### 4. Commit Message
- Ketik message di text box
- Tekan `Ctrl+Enter` untuk commit

---

## 🎯 Best Practices

### 1. Commit Messages
```bash
# Format: type: description

feat: add new feature
fix: fix bug in game
docs: update README
style: format code
refactor: refactor component
test: add tests
chore: update dependencies
```

### 2. Branch Naming
```bash
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
release/v1.0.0
```

### 3. Regular Commits
- Commit sering dengan perubahan kecil
- Jangan commit file besar (>100MB)
- Gunakan .gitignore untuk exclude files

### 4. Pull Before Push
```bash
# Selalu pull sebelum push
git pull origin main
git push origin main
```

### 5. Use .gitignore
```gitignore
# Node modules
node_modules/
dist/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

---

## 🚀 Quick Commands

### Setup
```bash
git init
git remote add origin https://github.com/USERNAME/REPO.git
git pull origin main
```

### Daily Workflow
```bash
git status
git add .
git commit -m "message"
git push
```

### Branch Workflow
```bash
git checkout -b feature/new
# ... make changes ...
git add .
git commit -m "feat: add feature"
git push -u origin feature/new
```

### Sync
```bash
git pull origin main
git push origin main
```

---

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Kiro IDE Documentation](https://kiro.dev/docs)

---

## ✅ Checklist Integrasi

- [ ] Repository sudah di-init
- [ ] Remote sudah ditambahkan
- [ ] Authentication sudah di-setup (PAT atau SSH)
- [ ] Bisa pull dari remote
- [ ] Bisa push ke remote
- [ ] .gitignore sudah dikonfigurasi
- [ ] Branch strategy sudah ditentukan

---

**Selamat! Repository GitHub Anda sudah terintegrasi dengan Kiro IDE! 🎉**
