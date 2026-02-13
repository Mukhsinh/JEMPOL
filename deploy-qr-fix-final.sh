#!/bin/bash
# Script deployment untuk perbaikan QR Code URL
# Memperbaiki link QR code untuk form tiket internal dan survey

echo "========================================"
echo "  DEPLOYMENT: Perbaikan QR Code URL"
echo "========================================"
echo ""

# 1. Build aplikasi
echo "[1/3] Building aplikasi..."
cd kiss
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build gagal!"
    cd ..
    exit 1
fi
cd ..
echo "✅ Build berhasil!"
echo ""

# 2. Verifikasi file build
echo "[2/3] Verifikasi file build..."
if [ -f "dist/index.html" ]; then
    echo "✅ File build ditemukan"
else
    echo "❌ File build tidak ditemukan!"
    exit 1
fi
echo ""

# 3. Deploy ke Vercel
echo "[3/3] Deploy ke Vercel..."
echo "Menjalankan: vercel --prod"
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  ✅ DEPLOYMENT BERHASIL!"
    echo "========================================"
    echo ""
    echo "Perubahan yang diterapkan:"
    echo "  • Perbaikan URL QR code untuk form tiket internal"
    echo "  • Perbaikan URL QR code untuk form survey"
    echo "  • Membersihkan kode di qrCodeService.ts"
    echo ""
    echo "URL yang diperbaiki:"
    echo "  • /form/internal - Form Tiket Internal"
    echo "  • /form/eksternal - Form Tiket Eksternal"
    echo "  • /form/survey - Form Survey"
    echo ""
else
    echo ""
    echo "❌ Deployment gagal!"
    echo "Silakan periksa error di atas"
    exit 1
fi
