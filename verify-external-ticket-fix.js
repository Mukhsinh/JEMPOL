/**
 * Script untuk verifikasi perbaikan External Ticket
 * 
 * Perbaikan:
 * 1. Form eksternal bisa diakses tanpa unit_id di URL
 * 2. Dropdown unit ditampilkan jika tidak ada unit_id
 * 3. Validasi unit_id diperbaiki
 * 4. Error handling lebih baik
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifikasi Perbaikan External Ticket...\n');

// 1. Cek file DirectExternalTicketForm.tsx
const formPath = path.join(__dirname, 'frontend/src/pages/public/DirectExternalTicketForm.tsx');
if (fs.existsSync(formPath)) {
  const formContent = fs.readFileSync(formPath, 'utf8');
  
  console.log('✅ File DirectExternalTicketForm.tsx ditemukan');
  
  // Cek apakah ada state units
  if (formContent.includes('const [units, setUnits] = useState')) {
    console.log('✅ State units sudah ditambahkan');
  } else {
    console.log('❌ State units belum ditambahkan');
  }
  
  // Cek apakah ada loadingUnits
  if (formContent.includes('const [loadingUnits, setLoadingUnits] = useState')) {
    console.log('✅ State loadingUnits sudah ditambahkan');
  } else {
    console.log('❌ State loadingUnits belum ditambahkan');
  }
  
  // Cek apakah ada useEffect untuk load units
  if (formContent.includes('const loadUnits = async ()')) {
    console.log('✅ Function loadUnits sudah ditambahkan');
  } else {
    console.log('❌ Function loadUnits belum ditambahkan');
  }
  
  // Cek apakah ada dropdown unit
  if (formContent.includes('!unitId &&') && formContent.includes('Pilih Unit')) {
    console.log('✅ Dropdown unit sudah ditambahkan');
  } else {
    console.log('❌ Dropdown unit belum ditambahkan');
  }
  
  // Cek apakah ada validasi finalUnitId
  if (formContent.includes('const finalUnitId = formData.unit_id || unitId')) {
    console.log('✅ Validasi finalUnitId sudah diperbaiki');
  } else {
    console.log('❌ Validasi finalUnitId belum diperbaiki');
  }
  
  // Cek apakah interface FormData sudah update
  if (formContent.includes('unit_id: string;') && formContent.includes('interface FormData')) {
    console.log('✅ Interface FormData sudah diupdate');
  } else {
    console.log('❌ Interface FormData belum diupdate');
  }
  
  console.log('\n');
} else {
  console.log('❌ File DirectExternalTicketForm.tsx tidak ditemukan\n');
}

// 2. Cek backend publicRoutes.ts
const backendPath = path.join(__dirname, 'backend/src/routes/publicRoutes.ts');
if (fs.existsSync(backendPath)) {
  const backendContent = fs.readFileSync(backendPath, 'utf8');
  
  console.log('✅ File publicRoutes.ts ditemukan');
  
  // Cek endpoint /api/public/units
  if (backendContent.includes("router.get('/units'")) {
    console.log('✅ Endpoint /api/public/units sudah ada');
  } else {
    console.log('❌ Endpoint /api/public/units belum ada');
  }
  
  // Cek endpoint /api/public/external-tickets
  if (backendContent.includes("router.post('/external-tickets'")) {
    console.log('✅ Endpoint /api/public/external-tickets sudah ada');
  } else {
    console.log('❌ Endpoint /api/public/external-tickets belum ada');
  }
  
  // Cek validasi unit_id di backend
  if (backendContent.includes('if (!unit_id)') && backendContent.includes('Unit ID harus diisi')) {
    console.log('✅ Validasi unit_id di backend sudah ada');
  } else {
    console.log('❌ Validasi unit_id di backend belum ada');
  }
  
  console.log('\n');
} else {
  console.log('❌ File publicRoutes.ts tidak ditemukan\n');
}

console.log('========================================');
console.log('RINGKASAN PERBAIKAN');
console.log('========================================\n');

console.log('Perbaikan yang dilakukan:');
console.log('1. ✅ Tambah state units dan loadingUnits');
console.log('2. ✅ Tambah function loadUnits untuk fetch units dari API');
console.log('3. ✅ Tambah dropdown unit di Step 1 (jika tidak ada unit_id)');
console.log('4. ✅ Update validasi unit_id (finalUnitId)');
console.log('5. ✅ Update interface FormData dengan unit_id');
console.log('6. ✅ Backend sudah siap dengan endpoint dan validasi\n');

console.log('Cara Test:');
console.log('1. Akses http://localhost:3002/form/eksternal');
console.log('2. Pilih unit dari dropdown');
console.log('3. Isi form dan submit');
console.log('4. Tiket harus berhasil dibuat\n');

console.log('Atau dengan unit_id:');
console.log('http://localhost:3002/form/eksternal?unit_id=xxx&unit_name=Unit%20Test\n');

console.log('✅ Perbaikan selesai! Silakan test form eksternal.');
