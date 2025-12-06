# Cara Push Project ke GitHub

## Repository Anda
**URL:** https://github.com/boshadi3030/JEMPOL.git

## Langkah-Langkah

### 1. Pastikan Repository Sudah Dibuat di GitHub
- Buka https://github.com/boshadi3030/JEMPOL
- Jika belum ada, buat repository baru dengan nama **JEMPOL**
- Pilih **Public** atau **Private**
- **JANGAN** centang "Initialize with README"

### 2. Setup Git Credentials (Hanya Sekali)

Anda perlu Personal Access Token untuk push ke GitHub:

1. Buka: https://github.com/settings/tokens
2. Klik **"Generate new token (classic)"**
3. Beri nama: `JEMPOL Project`
4. Centang scope: **repo** (full control)
5. Klik **"Generate token"**
6. **COPY TOKEN** yang muncul (hanya muncul sekali!)

### 3. Simpan Credentials (Opsional tapi Direkomendasikan)

Agar tidak perlu login terus-menerus:

```cmd
git config --global credential.helper wincred
```

### 4. Push ke GitHub

**Cara Mudah:** Jalankan script yang sudah dibuat
```cmd
PUSH_KE_GITHUB.bat
```

**Cara Manual:**
```cmd
git add .
git commit -m "Update project"
git push -u origin main
```

Saat diminta:
- **Username:** `boshadi3030`
- **Password:** Paste **Personal Access Token** yang sudah dibuat

### 5. Verifikasi

Buka browser dan cek: https://github.com/boshadi3030/JEMPOL

## Update Selanjutnya

Setelah setup awal, untuk update berikutnya cukup:

```cmd
git add .
git commit -m "Deskripsi perubahan"
git push
```

Atau jalankan: `PUSH_KE_GITHUB.bat`

## Troubleshooting

### Error: "Repository not found"
- Pastikan repository sudah dibuat di GitHub
- Cek URL repository benar: https://github.com/boshadi3030/JEMPOL.git

### Error: "Authentication failed"
- Gunakan Personal Access Token, bukan password biasa
- Token harus punya scope "repo"

### Error: "Permission denied"
- Pastikan Anda login dengan akun yang benar (boshadi3030)
- Regenerate Personal Access Token jika perlu

## File yang Tidak Akan Di-upload

File berikut sudah ada di `.gitignore` dan tidak akan di-upload:
- `node_modules/` - Dependencies (akan di-install ulang)
- `backend/.env` - File rahasia (password, API key)
- `uploads/` - File upload lokal
- `.DS_Store`, `Thumbs.db` - File sistem

## Tips
- Commit secara berkala untuk backup
- Gunakan commit message yang jelas
- Jangan upload file `.env` atau password
- Push sebelum deploy ke Vercel
