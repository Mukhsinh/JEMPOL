# 🎨 Panduan Visual: Commit Manual via Kiro IDE

## 📍 Lokasi Tombol Commit

```
┌─────────────────────────────────────────────────────────────┐
│  KIRO IDE                                            [_][□][X]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────┐  ┌──────────────────────────────────────────────┐ │
│  │ 📁   │  │  SOURCE CONTROL                              │ │
│  │ 🔍   │  │                                              │ │
│  │ ⎇    │◄─┤  REPOSITORIES                               │ │
│  │ ▶    │  │  └─ JEMPOL                                  │ │
│  │ 🐛   │  │                                              │ │
│  │ ⚙    │  │  CHANGES                                    │ │
│  └──────┘  │  ├─ CARA_COMMIT_MANUAL.md          [+]      │ │
│            │  ├─ READY_TO_COMMIT.txt            [+]      │ │
│            │  └─ STATUS_PERBAIKAN_ERROR.md      [+]      │ │
│            │                                              │ │
│            │  Message (Ctrl+Enter to commit...)          │ │
│            │  ┌────────────────────────────────────────┐ │ │
│            │  │ fix: Perbaiki error registrasi...      │ │ │
│            │  │                                        │ │ │
│            │  └────────────────────────────────────────┘ │ │
│            │                                              │ │
│            │  [✓ Commit]  [↑ Push]  [⟳ Sync]  [...]     │ │
│            └──────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔢 Langkah-Langkah (Step by Step)

### Step 1: Buka Source Control
```
Klik ikon ⎇ (Git branch) di sidebar kiri
Atau tekan: Ctrl + Shift + G
```

### Step 2: Lihat File yang Berubah
```
Di bagian CHANGES, Anda akan melihat:
✓ CARA_COMMIT_MANUAL.md
✓ READY_TO_COMMIT.txt
✓ STATUS_PERBAIKAN_ERROR.md
```

### Step 3: Stage All Changes
```
Klik tombol [+] di sebelah "CHANGES"
Atau klik [+] di sebelah masing-masing file
```

### Step 4: Tulis Commit Message
```
Klik di kotak "Message (Ctrl+Enter to commit...)"
Ketik atau copy-paste message berikut:
```

**Commit Message (Copy ini):**
```
fix: Perbaiki error registrasi, game, dan CORS untuk production

- Fix API URL configuration untuk production
- Fix game service data format (camelCase to snake_case)
- Update CORS untuk allow Vercel deployments
- Apply database migration untuk RLS policies
- Update vercel.json routing configuration
- Add comprehensive documentation and testing scripts
```

### Step 5: Commit
```
Klik tombol [✓ Commit]
Atau tekan: Ctrl + Enter
```

### Step 6: Push ke GitHub
```
Klik tombol [↑ Push]
Atau klik tombol [⟳ Sync Changes]
```

### Step 7: Verifikasi
```
1. Buka browser
2. Go to: https://github.com/Mukhaini/JEMPOL
3. Refresh halaman (F5)
4. Lihat commit terbaru
```

## 🎯 Shortcut Keyboard

| Action | Shortcut |
|--------|----------|
| Open Source Control | `Ctrl + Shift + G` |
| Commit | `Ctrl + Enter` |
| Refresh | `F5` |
| Stage All | `Ctrl + K, Ctrl + A` |

## ✅ Checklist

Pastikan Anda sudah:
- [ ] Buka Source Control panel
- [ ] Lihat file yang berubah (3 files)
- [ ] Stage all changes (klik +)
- [ ] Tulis commit message
- [ ] Klik Commit
- [ ] Klik Push
- [ ] Verifikasi di GitHub

## 🔍 Troubleshooting

### Tidak Melihat File di CHANGES?
**Solusi:**
1. Klik icon refresh di Source Control
2. Pastikan file sudah disimpan (Ctrl + S)
3. Cek .gitignore

### Tombol Commit Disabled?
**Solusi:**
1. Pastikan sudah stage changes (klik +)
2. Pastikan commit message tidak kosong
3. Pastikan ada file yang berubah

### Push Gagal?
**Solusi:**
1. Cek koneksi internet
2. Cek GitHub credentials
3. Pull terlebih dahulu jika ada conflict
4. Baca: SOLUSI_PUSH_GITHUB.md

## 📊 Status Saat Ini

```
Branch: main
Status: Up to date with origin/main
Untracked files: 3
Ready to commit: YES ✅
```

## 🚀 Setelah Push Berhasil

1. **Vercel Auto-Deploy**: Tunggu 2-3 menit
2. **Test Production**: 
   - Health: https://jempol-frontend.vercel.app/api/health
   - Registrasi: https://jempol-frontend.vercel.app/#registration
   - Game: https://jempol-frontend.vercel.app/game
3. **Monitor Logs**: Cek Vercel Dashboard

---

**READY TO COMMIT!** 🎉

Sekarang Anda bisa commit manual melalui tombol di IDE.
