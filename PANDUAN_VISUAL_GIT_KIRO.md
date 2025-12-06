# 📸 Panduan Visual Git di Kiro IDE

## ✅ Status Repository Anda

```
Repository: https://github.com/Mukhsinh/JEMPOL.git
Branch: main
Status: Terintegrasi ✅
```

---

## 🎯 Cara Menggunakan Git di Kiro (3 Metode)

### Metode 1: Git Panel (Paling Mudah) ⭐

#### Langkah 1: Buka Git Panel
```
📍 Lokasi: Sidebar kiri Kiro
🔍 Icon: Source Control (icon cabang)
⌨️ Shortcut: Ctrl+Shift+G
```

#### Langkah 2: Lihat Changes
```
📂 Changes: File yang berubah
📋 Staged Changes: File siap commit
```

#### Langkah 3: Stage Files
```
Cara 1: Klik icon + di samping file
Cara 2: Klik "Stage All Changes" untuk stage semua
```

#### Langkah 4: Commit
```
1. Ketik commit message di text box atas
   Contoh: "feat: add error handling"
2. Klik ✓ (Commit) atau tekan Ctrl+Enter
```

#### Langkah 5: Push ke GitHub
```
1. Klik ... (More Actions) di atas
2. Pilih "Push"
3. Atau klik icon ↑ di status bar
```

#### Langkah 6: Pull dari GitHub
```
1. Klik ... (More Actions)
2. Pilih "Pull"
3. Atau klik icon ↓ di status bar
```

---

### Metode 2: Terminal di Kiro

#### Langkah 1: Buka Terminal
```
📍 Menu: Terminal → New Terminal
⌨️ Shortcut: Ctrl+`
```

#### Langkah 2: Workflow Lengkap
```bash
# 1. Cek status
git status

# 2. Stage semua perubahan
git add .

# 3. Commit dengan message
git commit -m "feat: add new feature"

# 4. Push ke GitHub
git push

# 5. Pull dari GitHub (jika perlu)
git pull
```

---

### Metode 3: Command Palette

#### Langkah 1: Buka Command Palette
```
⌨️ Shortcut: Ctrl+Shift+P
```

#### Langkah 2: Ketik Perintah Git
```
Git: Commit
Git: Push
Git: Pull
Git: Create Branch
Git: Checkout to...
```

---

## 🎨 Visual Workflow

### Workflow 1: Commit & Push
```
┌─────────────────────────────────────────┐
│ 1. Edit Code                            │
│    ↓                                    │
│ 2. Save File (Ctrl+S)                   │
│    ↓                                    │
│ 3. Buka Git Panel (Ctrl+Shift+G)       │
│    ↓                                    │
│ 4. Stage Changes (klik +)               │
│    ↓                                    │
│ 5. Ketik Commit Message                 │
│    ↓                                    │
│ 6. Commit (Ctrl+Enter)                  │
│    ↓                                    │
│ 7. Push (klik ... → Push)               │
└─────────────────────────────────────────┘
```

### Workflow 2: Pull & Merge
```
┌─────────────────────────────────────────┐
│ 1. Buka Git Panel                       │
│    ↓                                    │
│ 2. Klik ... → Pull                      │
│    ↓                                    │
│ 3. Jika ada conflict:                   │
│    - Buka file yang conflict            │
│    - Pilih "Accept Current" atau        │
│      "Accept Incoming"                  │
│    - Save file                          │
│    ↓                                    │
│ 4. Stage resolved files                 │
│    ↓                                    │
│ 5. Commit merge                         │
└─────────────────────────────────────────┘
```

### Workflow 3: Branch Management
```
┌─────────────────────────────────────────┐
│ 1. Klik nama branch di status bar       │
│    (bawah kiri: "main")                 │
│    ↓                                    │
│ 2. Pilih "Create new branch"            │
│    ↓                                    │
│ 3. Ketik nama branch:                   │
│    "feature/new-feature"                │
│    ↓                                    │
│ 4. Edit code di branch baru             │
│    ↓                                    │
│ 5. Commit & Push                        │
│    ↓                                    │
│ 6. Kembali ke main:                     │
│    Klik branch → pilih "main"           │
│    ↓                                    │
│ 7. Merge: git merge feature/new-feature │
└─────────────────────────────────────────┘
```

---

## 🎯 Lokasi Penting di Kiro

### 1. Git Panel
```
📍 Lokasi: Sidebar kiri
🔍 Icon: Cabang (Source Control)
⌨️ Shortcut: Ctrl+Shift+G
```

### 2. Status Bar (Bawah)
```
📍 Kiri: Nama branch (main)
📍 Tengah: Sync status (↑↓)
📍 Kanan: Errors & Warnings
```

### 3. Terminal
```
📍 Lokasi: Panel bawah
⌨️ Shortcut: Ctrl+`
```

### 4. Command Palette
```
⌨️ Shortcut: Ctrl+Shift+P
🔍 Ketik: Git
```

---

## 📝 Commit Message Examples

### Good Examples ✅
```
feat: add game error handling
fix: resolve video player network error
docs: update testing guide
style: format code with prettier
refactor: improve game performance
test: add unit tests for visitor service
chore: update dependencies
```

### Bad Examples ❌
```
update
fix bug
changes
wip
asdf
```

---

## 🎨 Git Panel Icons

### File Status Icons
```
M  = Modified (file berubah)
A  = Added (file baru)
D  = Deleted (file dihapus)
U  = Untracked (file belum di-track)
C  = Conflict (ada conflict)
```

### Action Icons
```
+  = Stage file
-  = Unstage file
↶  = Discard changes
⊕  = Open file
✓  = Commit
↑  = Push
↓  = Pull
↻  = Sync (Pull + Push)
```

---

## 🔄 Sync Workflow

### Auto Sync (Recommended)
```
1. Buka Settings (Ctrl+,)
2. Search: "git autofetch"
3. Enable: Git: Autofetch
4. Kiro akan auto-fetch setiap 3 menit
```

### Manual Sync
```
1. Klik icon ↻ di status bar
2. Atau klik ... → Sync
3. Ini akan Pull + Push sekaligus
```

---

## 🛠️ Troubleshooting Visual

### Problem: Authentication Failed
```
┌─────────────────────────────────────────┐
│ Error: Authentication failed            │
│                                         │
│ Solusi:                                 │
│ 1. Buka: github.com/settings/tokens     │
│ 2. Generate new token (classic)         │
│ 3. Copy token                           │
│ 4. Saat push, gunakan:                  │
│    Username: Mukhsinh                   │
│    Password: [paste token]              │
└─────────────────────────────────────────┘
```

### Problem: Merge Conflict
```
┌─────────────────────────────────────────┐
│ File dengan conflict akan muncul di:    │
│ "Merge Changes" section                 │
│                                         │
│ Cara resolve:                           │
│ 1. Klik file yang conflict              │
│ 2. Lihat marker:                        │
│    <<<<<<< HEAD                         │
│    your changes                         │
│    =======                              │
│    incoming changes                     │
│    >>>>>>> branch                       │
│ 3. Pilih salah satu atau edit manual    │
│ 4. Hapus marker (<<<, ===, >>>)        │
│ 5. Save file                            │
│ 6. Stage file (klik +)                  │
│ 7. Commit                               │
└─────────────────────────────────────────┘
```

### Problem: Push Rejected
```
┌─────────────────────────────────────────┐
│ Error: Updates were rejected            │
│                                         │
│ Solusi:                                 │
│ 1. Pull dulu: klik ... → Pull          │
│ 2. Resolve conflicts (jika ada)         │
│ 3. Push lagi: klik ... → Push          │
└─────────────────────────────────────────┘
```

---

## 🎯 Quick Actions

### Dari Git Panel
```
Right-click file:
├─ Open File
├─ Open Changes
├─ Stage Changes
├─ Discard Changes
└─ Reveal in Explorer
```

### Dari Status Bar
```
Click branch name:
├─ Create new branch
├─ Checkout to...
├─ Merge branch
└─ Delete branch

Click sync icon:
├─ Pull
├─ Push
└─ Sync
```

---

## 📚 Keyboard Shortcuts

### Git Panel
```
Ctrl+Shift+G    = Open Git Panel
Ctrl+Enter      = Commit
Ctrl+Shift+P    = Command Palette
```

### Terminal
```
Ctrl+`          = Toggle Terminal
Ctrl+Shift+`    = New Terminal
```

### File Operations
```
Ctrl+S          = Save
Ctrl+Shift+S    = Save All
Ctrl+K Ctrl+W   = Close All
```

---

## ✅ Checklist Harian

### Sebelum Mulai Coding
- [ ] Pull latest changes: `git pull`
- [ ] Cek branch: pastikan di branch yang benar
- [ ] Cek status: `git status`

### Setelah Coding
- [ ] Save all files: `Ctrl+Shift+S`
- [ ] Stage changes: klik + di Git Panel
- [ ] Commit: ketik message & Ctrl+Enter
- [ ] Push: klik ... → Push

### Sebelum Pulang
- [ ] Commit semua changes
- [ ] Push ke GitHub
- [ ] Cek GitHub: pastikan sudah terupload

---

## 🎉 Tips & Tricks

### Tip 1: Auto Save
```
Settings → Files: Auto Save → afterDelay
Kiro akan auto-save setiap beberapa detik
```

### Tip 2: Git Lens Extension
```
Install GitLens extension untuk:
- Lihat blame inline
- Lihat commit history
- Compare branches
```

### Tip 3: Commit Template
```
Buat file .gitmessage:

feat: 

# What changed?
# Why?
# Breaking changes?

Lalu set:
git config --global commit.template .gitmessage
```

### Tip 4: Alias
```bash
# Buat alias untuk command yang sering dipakai
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit

# Sekarang bisa pakai:
git st
git co main
git br
git cm -m "message"
```

---

## 🚀 Repository Anda

```
URL: https://github.com/Mukhsinh/JEMPOL.git
Branch: main
Status: ✅ Terintegrasi dengan Kiro

Siap untuk:
✅ Commit changes
✅ Push ke GitHub
✅ Pull dari GitHub
✅ Branch management
✅ Collaboration
```

---

**Selamat! Anda sudah siap menggunakan Git di Kiro IDE! 🎉**

Untuk bantuan lebih lanjut, buka Command Palette (Ctrl+Shift+P) dan ketik "Git" untuk melihat semua perintah Git yang tersedia.
