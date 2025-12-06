# Cara Mengatasi Error 403 - Write Access Denied

## Masalah
Token tidak punya akses write ke repository, meskipun sudah dibuat dengan benar.

## Penyebab Umum
1. **Token tidak punya scope "repo"** yang benar
2. **Token sudah expired**
3. **Repository adalah Private tapi token hanya punya akses Public**
4. **Token belum di-authorize untuk organization** (jika repo di organization)

## Solusi 1: Buat Token Baru dengan Fine-Grained Token (RECOMMENDED)

GitHub sekarang merekomendasikan Fine-Grained Personal Access Token yang lebih aman:

### Langkah-Langkah:
1. **Buka:** https://github.com/settings/tokens?type=beta
2. **Klik:** "Generate new token"
3. **Isi form:**
   - **Token name:** `JEMPOL-Project`
   - **Expiration:** `90 days` atau `Custom`
   - **Repository access:** Pilih `Only select repositories`
   - **Select repositories:** Pilih `JEMPOL`
   
4. **Permissions - Repository permissions:**
   - **Contents:** `Read and write` ✅
   - **Metadata:** `Read-only` (otomatis tercentang)

5. **Klik:** "Generate token"
6. **COPY TOKEN** yang muncul

### Gunakan Token Baru:
```cmd
git remote remove origin

git remote add origin https://boshadi3030:TOKEN_BARU@github.com/boshadi3030/JEMPOL.git

git push -u origin main
```

## Solusi 2: Gunakan GitHub CLI (Paling Mudah)

### Install GitHub CLI:
Download dari: https://cli.github.com/

### Login dan Push:
```cmd
gh auth login

gh repo create JEMPOL --public --source=. --remote=origin --push
```

Atau jika repo sudah ada:
```cmd
gh auth login

git push -u origin main
```

## Solusi 3: Cek Permission Token Classic

Jika menggunakan Classic Token:

1. **Buka:** https://github.com/settings/tokens
2. **Cari token** yang baru dibuat
3. **Klik token** untuk melihat detail
4. **Pastikan tercentang:**
   - ✅ **repo** (Full control of private repositories)
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events

5. Jika tidak ada centang "repo", token tidak bisa write
6. **Buat token baru** dengan centang "repo"

## Solusi 4: Pastikan Repository Sudah Dibuat

1. **Cek apakah repo ada:** https://github.com/boshadi3030/JEMPOL
2. Jika belum ada, buat di: https://github.com/new
   - Nama: `JEMPOL`
   - Visibility: `Public` (atau Private jika token punya akses private)
   - JANGAN centang "Initialize with README"

## Solusi 5: Push dengan SSH (Alternatif)

Jika token terus bermasalah, gunakan SSH:

### Setup SSH Key:
```cmd
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### Add SSH Key ke GitHub:
1. Copy public key: `type %USERPROFILE%\.ssh\id_ed25519.pub`
2. Buka: https://github.com/settings/keys
3. Klik "New SSH key"
4. Paste key dan save

### Push dengan SSH:
```cmd
git remote remove origin

git remote add origin git@github.com:boshadi3030/JEMPOL.git

git push -u origin main
```

## Solusi 6: Cek Apakah Akun Terverifikasi

Kadang GitHub memerlukan verifikasi email:
1. Cek email dari GitHub
2. Klik link verifikasi
3. Coba push lagi

## Rekomendasi Terbaik

**Gunakan GitHub CLI** - ini cara paling mudah dan aman:

```cmd
REM Install dari: https://cli.github.com/

REM Login
gh auth login

REM Push
git push -u origin main
```

GitHub CLI akan handle authentication secara otomatis tanpa perlu token manual.
