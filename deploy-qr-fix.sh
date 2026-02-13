#!/bin/bash
# Script Bash untuk deploy perbaikan QR Code 404 di Vercel
# Mengatasi masalah 404 pada link QR Code Management

echo "========================================"
echo "🚀 Deploy Perbaikan QR Code 404"
echo "========================================"
echo ""

# 1. Cek perubahan
echo "📋 Checking changes..."
git status

echo ""
echo "📝 Changes yang akan di-commit:"
echo "   - vercel.json: Tambah explicit routing untuk /form/* dan /m/*"
echo "   - Menambahkan rewrites dan routes untuk SPA routing"
echo ""

# 2. Konfirmasi
read -p "Lanjutkan deploy? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deploy dibatalkan"
    exit 1
fi

echo ""
echo "📦 Staging changes..."
git add vercel.json test-qr-links-vercel.js deploy-qr-fix.sh deploy-qr-fix.ps1

echo ""
echo "💾 Committing..."
git commit -m "fix: Perbaiki 404 error pada QR Code links di Vercel

- Tambah explicit routing untuk /form/* dan /m/* di vercel.json
- Tambah rewrites untuk SPA routing
- Tambah routes untuk handle form paths
- Tambah test script untuk validasi QR links

Fixes: QR Code links mengembalikan 404 di Vercel production
"

if [ $? -ne 0 ]; then
    echo "❌ Commit gagal"
    exit 1
fi

echo ""
echo "🚀 Pushing to remote..."
git push

if [ $? -ne 0 ]; then
    echo "❌ Push gagal"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ Deploy berhasil!"
echo "========================================"
echo ""
echo "⏳ Tunggu beberapa menit untuk Vercel build selesai"
echo ""
echo "📝 Langkah selanjutnya:"
echo "   1. Buka Vercel Dashboard: https://vercel.com"
echo "   2. Tunggu deployment selesai (biasanya 2-3 menit)"
echo "   3. Test QR Code links di production"
echo "   4. Jalankan: node test-qr-links-vercel.js"
echo ""
echo "🔗 Test manual di browser:"
echo "   - https://[your-domain]/form/internal"
echo "   - https://[your-domain]/form/eksternal"
echo "   - https://[your-domain]/form/survey"
echo ""
