#!/bin/bash
# Script Deployment untuk Perbaikan QR URL 404
# Linux/Mac Bash Script

echo "=== DEPLOYMENT PERBAIKAN QR URL 404 ==="
echo ""

# 1. Validasi perubahan
echo "1. Validasi format URL..."
node test-qr-url-generation.js
if [ $? -ne 0 ]; then
    echo "❌ Test validasi gagal!"
    exit 1
fi
echo "✅ Validasi berhasil!"
echo ""

# 2. Build aplikasi
echo "2. Building aplikasi..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build gagal!"
    exit 1
fi
echo "✅ Build berhasil!"
echo ""

# 3. Git operations
echo "3. Commit dan push ke repository..."
git add .
git commit -m "fix: Perbaiki format URL QR Code untuk menghindari error 404 di production

- Memastikan semua URL memiliki leading slash (/)
- Menambahkan dokumentasi inline untuk mencegah masalah serupa
- Membuat test script untuk validasi URL generation
- Tidak mengubah kode yang sudah benar dan terintegrasi

Fixes: Error 404 pada link QR Code form tiket eksternal di production"

if [ $? -ne 0 ]; then
    echo "⚠️ Tidak ada perubahan untuk di-commit atau commit gagal"
fi

echo ""
echo "Push ke remote repository..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push gagal!"
    exit 1
fi
echo "✅ Push berhasil!"
echo ""

# 4. Informasi deployment
echo "=== DEPLOYMENT SELESAI ==="
echo ""
echo "📋 Langkah Selanjutnya:"
echo "1. Tunggu Vercel selesai deploy (biasanya 2-3 menit)"
echo "2. Buka halaman QR Management di production"
echo "3. Periksa link yang dihasilkan untuk setiap QR Code"
echo "4. Klik 'Buka Link' untuk memastikan tidak ada error 404"
echo "5. Test scan QR Code dengan smartphone"
echo ""
echo "📊 Monitoring:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Deployment Logs: Cek di Vercel Dashboard > Project > Deployments"
echo ""
echo "✅ Perbaikan berhasil di-deploy!"
