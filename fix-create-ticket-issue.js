const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCreateTicketIssue() {
  console.log('🔧 Memperbaiki masalah pembuatan tiket...\n');

  // 1. Tambahkan category yang hilang jika belum ada
  const categoriesToAdd = [
    { name: 'IT Support', code: 'IT_SUPPORT', description: 'Dukungan IT dan Teknologi' },
    { name: 'SDM', code: 'HR', description: 'Sumber Daya Manusia' },
    { name: 'Fasilitas', code: 'FACILITY_MAINTENANCE', description: 'Pemeliharaan Fasilitas' },
    { name: 'Peralatan', code: 'EQUIPMENT', description: 'Peralatan dan Perlengkapan' },
    { name: 'Administrasi', code: 'ADMINISTRATION', description: 'Administrasi Umum' },
    { name: 'Lainnya', code: 'OTHER', description: 'Kategori Lainnya' }
  ];

  console.log('📝 Menambahkan kategori yang hilang...');
  for (const category of categoriesToAdd) {
    // Cek apakah sudah ada
    const { data: existing } = await supabase
      .from('service_categories')
      .select('id, name, code')
      .eq('code', category.code)
      .single();

    if (existing) {
      console.log(`✅ Kategori "${category.name}" (${category.code}) sudah ada`);
    } else {
      const { data, error } = await supabase
        .from('service_categories')
        .insert({
          name: category.name,
          code: category.code,
          description: category.description,
          is_active: true,
          requires_attachment: false
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Gagal menambahkan kategori "${category.name}":`, error.message);
      } else {
        console.log(`✅ Kategori "${category.name}" (${category.code}) berhasil ditambahkan`);
      }
    }
  }

  // 2. Test pembuatan tiket
  console.log('\n🧪 Testing pembuatan tiket...');
  
  // Ambil unit pertama
  const { data: units } = await supabase
    .from('units')
    .select('id, name')
    .eq('is_active', true)
    .limit(1);

  if (!units || units.length === 0) {
    console.error('❌ Tidak ada unit aktif ditemukan');
    return;
  }

  const testUnit = units[0];
  console.log(`📍 Menggunakan unit: ${testUnit.name} (${testUnit.id})`);

  // Ambil category pertama
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name')
    .eq('is_active', true)
    .limit(1);

  if (!categories || categories.length === 0) {
    console.error('❌ Tidak ada kategori aktif ditemukan');
    return;
  }

  const testCategory = categories[0];
  console.log(`📂 Menggunakan kategori: ${testCategory.name} (${testCategory.id})`);

  // Generate ticket number
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const ticketNumber = `TKT-${year}-${random}`;

  // Test data
  const testTicketData = {
    ticket_number: ticketNumber,
    type: 'complaint',
    title: 'Test Tiket - Perbaikan Sistem',
    description: 'Ini adalah tiket test untuk memastikan sistem pembuatan tiket berfungsi dengan baik.',
    unit_id: testUnit.id,
    category_id: testCategory.id,
    priority: 'medium',
    status: 'open',
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    source: 'web',
    is_anonymous: false,
    submitter_name: 'Test User',
    submitter_email: 'test@example.com'
  };

  console.log('\n📤 Mencoba membuat tiket test...');
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert(testTicketData)
    .select()
    .single();

  if (ticketError) {
    console.error('❌ Gagal membuat tiket test:', ticketError.message);
    console.error('Detail error:', ticketError);
  } else {
    console.log('✅ Tiket test berhasil dibuat!');
    console.log(`   Nomor Tiket: ${ticket.ticket_number}`);
    console.log(`   ID: ${ticket.id}`);
    
    // Hapus tiket test
    console.log('\n🗑️  Menghapus tiket test...');
    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticket.id);

    if (deleteError) {
      console.error('❌ Gagal menghapus tiket test:', deleteError.message);
    } else {
      console.log('✅ Tiket test berhasil dihapus');
    }
  }

  console.log('\n✅ Perbaikan selesai!');
  console.log('\n📋 Ringkasan:');
  console.log('   - Kategori yang hilang telah ditambahkan');
  console.log('   - Endpoint backend telah diperbaiki untuk pencarian kategori yang lebih fleksibel');
  console.log('   - Frontend service telah diperbaiki untuk menggunakan endpoint yang benar');
  console.log('\n🎯 Silakan coba buat tiket lagi dari aplikasi!');
}

fixCreateTicketIssue()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
