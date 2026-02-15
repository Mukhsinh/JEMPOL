#!/bin/bash

# Script untuk memperbaiki error 404 di Vercel
# Menjalankan diagnosa dan memberikan instruksi deploy

echo "🔧 PERBAIKAN ERROR 404 DI VERCEL"
echo "=================================="
echo ""

# 1. Diagnosa lokal
echo "1️⃣ Menjalankan diagnosa lokal..."
node diagnose-vercel-404.js

echo ""
echo "=================================="
echo ""

# 2. Instruksi deploy
echo "2️⃣ LANGKAH SELANJUTNYA:"
echo ""
echo "A. Commit perubahan:"
echo "   git add .vercelignore vercel.json"
echo "   git commit -m \"fix: perbaiki konfigurasi Vercel untuk API endpoints\""
echo "   git push"
echo ""
echo "B. Set Environment Variables di Vercel Dashboard:"
echo "   1. Buka https://vercel.com/dashboard"
echo "   2. Pilih project Anda"
echo "   3. Settings > Environment Variables"
echo "   4. Tambahkan:"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_ANON_KEY"
echo "      - VITE_SUPABASE_URL"
echo "      - VITE_SUPABASE_ANON_KEY"
echo "      - VITE_API_URL=/api"
echo "   5. Pilih environment: Production, Preview, Development (semua)"
echo "   6. Save"
echo ""
echo "C. Redeploy:"
echo "   Vercel Dashboard > Deployments > ... > Redeploy"
echo "   JANGAN centang 'Use existing Build Cache'"
echo ""
echo "D. Verifikasi:"
echo "   1. Cek tab 'Source' - pastikan folder api/ ada"
echo "   2. Cek tab 'Functions' - pastikan ada external-tickets.func"
echo "   3. Test: https://your-domain.vercel.app/api/public/external-tickets"
echo "      (harus return 405, bukan 404)"
echo ""
echo "=================================="
echo ""
echo "📖 Baca RINGKASAN_PERBAIKAN_404.md untuk detail lengkap"
echo ""
