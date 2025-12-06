# 📝 Cara Commit Manual via Kiro IDE

## Langkah-Langkah Commit

### 1. Buka Source Control Panel
- Klik ikon **Source Control** di sidebar kiri (ikon seperti cabang Git)
- Atau tekan `Ctrl + Shift + G`

### 2. Lihat File yang Berubah
Anda akan melihat daftar file yang berubah di bagian **CHANGES**:
- `STATUS_PERBAIKAN_ERROR.md` (new file)
- `CARA_COMMIT_MANUAL.md` (new file)
- Dan file-file lain yang sudah diubah

### 3. Stage All Changes
- Klik tombol **+** di sebelah "CHANGES" untuk stage semua file
- Atau klik **+** di sebelah masing-masing file

### 4. Tulis Commit Message
Di kotak "Message (Ctrl+Enter to commit...)", ketik:

```
fix: Perbaiki error registrasi, game, dan CORS untuk production

- Fix API URL configuration untuk production
- Fix game service data format (camelCase to snake_case)
- Update CORS untuk allow Vercel deployments
- Apply database migration untuk RLS policies
- Update vercel.json routing configuration
- Add comprehensive documentation and testing scripts
```

### 5. Commit
- Klik tombol **✓ Commit** atau tekan `Ctrl + Enter`
- File akan ter-commit ke local repository

### 6. Push ke GitHub
- Klik tombol **↑ Push** atau **⟳ Sync Changes**
- Atau klik menu **...** → **Push**
- Tunggu hingga push selesai

### 7. Verifikasi
- Buka GitHub repository di browser
- Refresh halaman
- Pastikan commit terbaru muncul

## 🎯 Commit Message Template

Gunakan format ini untuk commit message yang baik:

```
<type>: <subject>

<body>
```

**Type:**
- `fix:` - Bug fix
- `feat:` - New feature
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Testing
- `chore:` - Maintenance

**Contoh:**
```
fix: Perbaiki error registrasi pengunjung

- Update API URL configuration
- Fix CORS policy
- Add error handling
```

## 🔍 Troubleshooting

### Tidak Ada File di CHANGES
**Solusi:**
1. Pastikan file sudah disimpan (Ctrl + S)
2. Refresh Source Control (klik icon refresh)
3. Cek apakah file di .gitignore

### Push Gagal
**Solusi:**
1. Pull terlebih dahulu: `git pull origin main`
2. Resolve conflicts jika ada
3. Push lagi

### Authentication Error
**Solusi:**
1. Cek GitHub token
2. Update credentials
3. Baca: `SOLUSI_PUSH_GITHUB.md`

## 📚 Dokumentasi Terkait

- `DEPLOY_FIX_GUIDE.md` - Panduan deployment lengkap
- `SOLUSI_PUSH_GITHUB.md` - Solusi masalah push
- `CARA_PUSH_GITHUB.md` - Cara push ke GitHub

---

**Status**: File ini siap untuk di-commit!
