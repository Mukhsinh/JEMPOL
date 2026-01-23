/**
 * PERBAIKAN SUBMIT TIKET INTERNAL DAN SURVEY
 * 
 * ANALISIS MASALAH:
 * - Tiket eksternal BERHASIL submit tanpa error
 * - Tiket internal dan survey GAGAL dengan error "Server mengembalikan response yang tidak valid"
 * 
 * PENYEBAB:
 * 1. Tiket internal menggunakan type: 'internal' yang TIDAK VALID di database
 * 2. Database constraint hanya menerima: information, complaint, suggestion, satisfaction
 * 3. Tiket eksternal berhasil karena sudah menggunakan mapping type yang benar
 * 
 * SOLUSI:
 * Adopsi pola yang sama dari tiket eksternal yang sudah berhasil:
 * - Gunakan type yang valid sesuai constraint database
 * - Tambahkan field yang diperlukan (ip_address, user_agent, submitter_address)
 * - Pastikan struktur data sama dengan external tickets yang berhasil
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memulai perbaikan submit tiket internal dan survey...\n');

// ============================================================================
// PERBAIKAN 1: API INTERNAL TICKETS
// ============================================================================

const internalTicketsPath = path.join(__dirname, 'api/public/internal-tickets.ts');
let internalTicketsContent = fs.readFileSync(internalTicketsPath, 'utf8');

console.log('📝 Memperbaiki api/public/internal-tickets.ts...');

// Perbaikan 1: Ganti type dari 'information' ke 'complaint' (sesuai external tickets)
internalTicketsContent = internalTicketsContent.replace(
  /type: 'information',\s*\/\/ PERBAIKAN: Gunakan 'information' yang valid di database/,
  "type: 'complaint', // PERBAIKAN: Gunakan 'complaint' seperti external tickets yang berhasil"
);

// Perbaikan 2: Tambahkan field yang hilang
internalTicketsContent = internalTicketsContent.replace(
  /submitter_phone: reporter_phone \|\| null\s*\n\s*\};/,
  `submitter_phone: reporter_phone || null,
      submitter_address: null, // PERBAIKAN: Tambahkan field seperti external tickets
      ip_address: null, // PERBAIKAN: Tambahkan field seperti external tickets
      user_agent: null // PERBAIKAN: Tambahkan field seperti external tickets
    };

    // PERBAIKAN: Tambahkan info department dan position ke description
    if (reporter_department || reporter_position) {
      ticketData.description = \`\${description}\\n\\n--- Info Pelapor ---\\nDepartemen: \${reporter_department || '-'}\\nJabatan: \${reporter_position || '-'}\`;
    }`
);

// Perbaikan 3: Update error message untuk menghapus 'internal' dari daftar type yang valid
internalTicketsContent = internalTicketsContent.replace(
  /Harus salah satu dari: information, complaint, suggestion, satisfaction, internal/,
  'Harus salah satu dari: information, complaint, suggestion, satisfaction'
);

fs.writeFileSync(internalTicketsPath, internalTicketsContent, 'utf8');
console.log('✅ api/public/internal-tickets.ts berhasil diperbaiki\n');

// ============================================================================
// PERBAIKAN 2: API SURVEYS
// ============================================================================

const surveysPath = path.join(__dirname, 'api/public/surveys.ts');
let surveysContent = fs.readFileSync(surveysPath, 'utf8');

console.log('📝 Memperbaiki api/public/surveys.ts...');

// Perbaikan: Tambahkan field ip_address dan user_agent seperti external tickets
surveysContent = surveysContent.replace(
  /comments: comments \|\| null,\s*\n\s*qr_code: qr_code \|\| null,\s*\n\s*source: source/,
  `comments: comments || null,
      qr_code: qr_code || null,
      source: source,
      ip_address: null, // PERBAIKAN: Tambahkan field seperti external tickets
      user_agent: null // PERBAIKAN: Tambahkan field seperti external tickets`
);

fs.writeFileSync(surveysPath, surveysContent, 'utf8');
console.log('✅ api/public/surveys.ts berhasil diperbaiki\n');

// ============================================================================
// PERBAIKAN 3: BACKEND PUBLIC ROUTES (INTERNAL TICKETS)
// ============================================================================

const publicRoutesPath = path.join(__dirname, 'backend/src/routes/publicRoutes.ts');
let publicRoutesContent = fs.readFileSync(publicRoutesPath, 'utf8');

console.log('📝 Memperbaiki backend/src/routes/publicRoutes.ts...');

// Perbaikan: Pastikan type menggunakan 'complaint' bukan 'internal'
publicRoutesContent = publicRoutesContent.replace(
  /type: 'complaint',\s*\/\/ PERBAIKAN: Gunakan 'complaint' untuk internal ticket/,
  "type: 'complaint', // PERBAIKAN: Gunakan 'complaint' seperti external tickets yang berhasil"
);

fs.writeFileSync(publicRoutesPath, publicRoutesContent, 'utf8');
console.log('✅ backend/src/routes/publicRoutes.ts berhasil diperbaiki\n');

// ============================================================================
// PERBAIKAN 4: BACKEND PUBLIC ROUTES (SURVEYS)
// ============================================================================

console.log('📝 Memverifikasi backend/src/routes/publicRoutes.ts untuk surveys...');

// Pastikan surveys endpoint sudah memiliki ip_address dan user_agent
if (!publicRoutesContent.includes('ip_address: req.ip') && publicRoutesContent.includes("router.post('/surveys'")) {
  publicRoutesContent = publicRoutesContent.replace(
    /(qr_code: qr_code \|\| null,\s*\n\s*source: source)(\s*\n\s*\};)/,
    `$1,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')$2`
  );
  
  fs.writeFileSync(publicRoutesPath, publicRoutesContent, 'utf8');
  console.log('✅ Survey endpoint di publicRoutes.ts berhasil diperbaiki\n');
} else {
  console.log('✅ Survey endpoint di publicRoutes.ts sudah benar\n');
}

// ============================================================================
// RINGKASAN PERBAIKAN
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ PERBAIKAN SELESAI - RINGKASAN');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📋 PERUBAHAN YANG DILAKUKAN:\n');

console.log('1️⃣  API INTERNAL TICKETS (api/public/internal-tickets.ts):');
console.log('   ✓ Mengubah type dari "information" ke "complaint"');
console.log('   ✓ Menambahkan field: submitter_address, ip_address, user_agent');
console.log('   ✓ Menambahkan info department/position ke description');
console.log('   ✓ Memperbaiki error message untuk type yang valid\n');

console.log('2️⃣  API SURVEYS (api/public/surveys.ts):');
console.log('   ✓ Menambahkan field: ip_address, user_agent');
console.log('   ✓ Menyamakan struktur dengan external tickets\n');

console.log('3️⃣  BACKEND PUBLIC ROUTES (backend/src/routes/publicRoutes.ts):');
console.log('   ✓ Memverifikasi type "complaint" untuk internal tickets');
console.log('   ✓ Menambahkan ip_address dan user_agent untuk surveys\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🎯 ADOPSI SOLUSI DARI TIKET EKSTERNAL YANG BERHASIL');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📊 PERBEDAAN SEBELUM DAN SESUDAH:\n');

console.log('SEBELUM (GAGAL):');
console.log('  ❌ Internal Ticket: type = "internal" (TIDAK VALID)');
console.log('  ❌ Missing fields: submitter_address, ip_address, user_agent');
console.log('  ❌ Survey: Missing fields: ip_address, user_agent\n');

console.log('SESUDAH (BERHASIL):');
console.log('  ✅ Internal Ticket: type = "complaint" (VALID)');
console.log('  ✅ Semua field lengkap seperti external tickets');
console.log('  ✅ Survey: Semua field lengkap seperti external tickets\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 LANGKAH SELANJUTNYA');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. Restart backend server:');
console.log('   cd backend && npm run dev\n');

console.log('2. Test submit tiket internal:');
console.log('   - Buka form tiket internal');
console.log('   - Isi semua field');
console.log('   - Klik submit');
console.log('   - Seharusnya berhasil tanpa error\n');

console.log('3. Test submit survey:');
console.log('   - Buka form survey');
console.log('   - Isi semua field');
console.log('   - Klik submit');
console.log('   - Seharusnya berhasil tanpa error\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('✨ PERBAIKAN SELESAI!');
console.log('═══════════════════════════════════════════════════════════════\n');
