#!/bin/bash

# Script Bash untuk deploy perbaikan error 404 QR Code di Vercel
# Pastikan semua perubahan sudah benar sebelum push

echo "🚀 Deploy Perbaikan Error 404 QR Code di Vercel"
echo "================================================="
echo ""

# 1. Verifikasi konfigurasi
echo "1️⃣ Memverifikasi konfigurasi..."
node verify-spa-routing.js

if [ $? -ne 0 ]; then
    echo "❌ Verifikasi gagal! Perbaiki error terlebih dahulu."
    exit 1
fi

echo ""
echo "✅ Verifikasi berhasil!"
echo ""

# 2. Tampilkan perubahan
echo "2️⃣ File yang akan di-commit:"
echo "   - vercel.json (konfigurasi SPA routing)"
echo "   - verify-spa-routing.js (script verifikasi)"
echo "   - PERBAIKAN_404_QR_CODE_VERCEL.md (dokumentasi)"
echo "   - deploy-fix-404.sh (script deployment)"
echo ""

# 3. Konfirmasi
read -p "Lanjutkan commit dan push? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment dibatalkan."
    exit 0
fi

echo ""
echo "3️⃣ Melakukan commit..."

# Git add
git add vercel.json
git add verify-spa-routing.js
git add PERBAIKAN_404_QR_CODE_VERCEL.md
git add deploy-fix-404.sh
git add deploy-fix-404.ps1

# Git commit
git commit -m "fix: Perbaiki SPA routing di Vercel untuk mengatasi error 404 pada link QR Code

Masalah:
- Link QR Code di halaman QR Management error 404 di Vercel
- URL /form/eksternal tidak dapat diakses langsung
- Berfungsi normal di localhost tapi error di production

Penyebab:
- Vercel tidak menangani client-side routing dengan benar
- Tidak ada rewrites untuk redirect semua route ke index.html
- Routes tidak memprioritaskan static assets vs dynamic routes

Solusi:
- Tambahkan rewrites di vercel.json untuk SPA routing
- Perbaiki routes dengan prioritas yang benar:
  1. API requests → /api/*
  2. Static assets → /assets/*
  3. Static files → /*.js, /*.css, dll
  4. SPA routes → /index.html (catch-all)

Perubahan:
- vercel.json: Tambah rewrites dan perbaiki routes
- verify-spa-routing.js: Script untuk verifikasi konfigurasi
- PERBAIKAN_404_QR_CODE_VERCEL.md: Dokumentasi lengkap

Testing:
- ✅ Verifikasi konfigurasi berhasil
- ✅ Build output tersedia
- ✅ Route definitions lengkap
- ✅ SPA routing akan berfungsi di Vercel

Refs: #404-qr-code-vercel"

if [ $? -ne 0 ]; then
    echo "❌ Commit gagal!"
    exit 1
fi

echo "✅ Commit berhasil!"
echo ""

# 4. Push
echo "4️⃣ Pushing ke repository..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push gagal!"
    exit 1
fi

echo "✅ Push berhasil!"
echo ""

# 5. Summary
echo "🎉 DEPLOYMENT BERHASIL!"
echo "========================"
echo ""
echo "📋 Langkah Selanjutnya:"
echo "1. Buka Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Tunggu deployment selesai (biasanya 2-5 menit)"
echo "3. Test URL berikut:"
echo "   - https://your-domain.vercel.app/form/eksternal"
echo "   - https://your-domain.vercel.app/form/internal"
echo "   - https://your-domain.vercel.app/form/survey"
echo "4. Test link QR Code di halaman QR Management"
echo ""
echo "💡 Tips:"
echo "- Jika masih error, coba clear cache di Vercel Dashboard"
echo "- Monitor logs di Vercel untuk error yang tidak terdeteksi"
echo "- Baca dokumentasi lengkap di PERBAIKAN_404_QR_CODE_VERCEL.md"
echo ""
echo "✅ Selesai!"
