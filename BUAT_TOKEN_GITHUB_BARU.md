# Cara Membuat Personal Access Token GitHub yang Benar

## Masalah Saat Ini
Token yang ada tidak memiliki akses write atau sudah expired.

## Langkah-Langkah Membuat Token Baru

### 1. Buka GitHub Settings
Klik link ini: https://github.com/settings/tokens

Atau manual:
1. Login ke GitHub
2. Klik foto profil (pojok kanan atas)
3. Pilih **Settings**
4. Scroll ke bawah, klik **Developer settings**
5. Klik **Personal access tokens**
6. Pilih **Tokens (classic)**

### 2. Generate New Token
1. Klik tombol **"Generate new token"** → **"Generate new token (classic)"**
2. Isi form:
   - **Note:** `JEMPOL Project` (nama token)
   - **Expiration:** Pilih `90 days` atau `No expiration`
   
3. **PENTING:** Centang permission berikut:
   - ✅ **repo** (centang semua sub-item di bawahnya)
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events

4. Scroll ke bawah, klik **"Generate token"**

### 3. Copy Token
- Token akan muncul **HANYA SEKALI**
- Copy seluruh token (format: `ghp_xxxxxxxxxxxxxxxxxxxx`)
- Simpan di tempat aman

### 4. Gunakan Token

Setelah dapat token baru, jalankan perintah ini di Command Prompt:

```cmd
cd "D:\Aplikasi Antigravity\JEMPOL"

git remote remove origin

git remote add origin https://boshadi3030:TOKEN_BARU_ANDA@github.com/boshadi3030/JEMPOL.git

git push -u origin main
```

Ganti `TOKEN_BARU_ANDA` dengan token yang baru dibuat.

## Alternatif: Push Manual dengan Prompt

Jika cara di atas tidak berhasil, gunakan cara ini:

```cmd
git remote remove origin

git remote add origin https://github.com/boshadi3030/JEMPOL.git

git push -u origin main
```

Saat diminta:
- **Username:** `boshadi3030`
- **Password:** Paste token yang baru dibuat

## Verifikasi Repository

Setelah berhasil push, buka:
https://github.com/boshadi3030/JEMPOL

## Troubleshooting

### Error 403: Write access denied
- Token tidak punya permission `repo`
- Buat token baru dengan centang `repo`

### Error 404: Repository not found
- Repository belum dibuat di GitHub
- Buat dulu di: https://github.com/new
- Nama: `JEMPOL`
- Jangan centang "Initialize with README"

### Token Expired
- Buat token baru dengan expiration lebih lama
- Atau pilih "No expiration"
