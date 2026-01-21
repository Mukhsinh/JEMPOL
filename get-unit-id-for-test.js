/**
 * Script untuk mendapatkan Unit ID untuk testing
 */

const API_URL = 'http://localhost:3004';

async function getUnits() {
  try {
    console.log('🔍 Mengambil daftar unit...\n');
    
    const response = await fetch(`${API_URL}/api/public/units`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('✅ Unit ditemukan:\n');
      
      data.data.forEach((unit, index) => {
        console.log(`${index + 1}. ${unit.name} (${unit.code})`);
        console.log(`   ID: ${unit.id}`);
        console.log(`   Status: ${unit.is_active ? 'Aktif' : 'Tidak Aktif'}`);
        console.log('');
      });
      
      const firstUnit = data.data[0];
      const testUrl = `http://localhost:3002/form/eksternal?unit_id=${firstUnit.id}&unit_name=${encodeURIComponent(firstUnit.name)}`;
      
      console.log('🔗 URL untuk test form:');
      console.log(testUrl);
      console.log('');
      
      console.log('📋 Data untuk test API langsung:');
      console.log(JSON.stringify({
        unit_id: firstUnit.id,
        reporter_identity_type: 'personal',
        reporter_name: 'Test User',
        reporter_email: 'test@example.com',
        reporter_phone: '081234567890',
        service_type: 'complaint',
        title: 'Test Complaint',
        description: 'This is a test complaint',
        source: 'web'
      }, null, 2));
      
    } else {
      console.log('❌ Tidak ada unit ditemukan!');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️ Pastikan backend sudah berjalan di', API_URL);
  }
}

getUnits();
