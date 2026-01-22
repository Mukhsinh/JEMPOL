const axios = require('axios');

async function cekKoneksi() {
    console.log('🔍 Mengecek koneksi backend-frontend untuk Unit Types...\n');
    
    // 1. Cek backend health
    try {
        console.log('[1/4] Cek backend health...');
        const health = await axios.get('http://localhost:3001/api/health');
        console.log('✅ Backend berjalan:', health.data);
    } catch (error) {
        console.log('❌ Backend TIDAK berjalan!');
        console.log('   Jalankan: cd backend && npm run dev\n');
        return;
    }
    
    // 2. Cek endpoint GET unit-types
    try {
        console.log('\n[2/4] Cek GET /api/master-data/unit-types...');
        const response = await axios.get('http://localhost:3001/api/master-data/unit-types');
        console.log('✅ GET berhasil, data:', response.data.length, 'records');
    } catch (error) {
        console.log('❌ GET gagal:', error.message);
    }
    
    // 3. Cek endpoint POST unit-types (tanpa auth)
    try {
        console.log('\n[3/4] Cek POST /api/master-data/unit-types (tanpa auth)...');
        const response = await axios.post('http://localhost:3001/api/master-data/unit-types', {
            name: 'Test Unit',
            code: 'TEST_' + Date.now(),
            description: 'Test',
            icon: 'corporate_fare',
            color: '#3B82F6',
            is_active: true
        });
        console.log('❌ POST berhasil tanpa auth (TIDAK SEHARUSNYA!)');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ POST ditolak karena tidak ada auth (BENAR)');
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data);
        } else {
            console.log('⚠️  POST gagal dengan error lain:', error.message);
        }
    }
    
    // 4. Info untuk user
    console.log('\n[4/4] Kesimpulan:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Untuk menambah Unit Type, pastikan:');
    console.log('1. ✅ Backend berjalan di http://localhost:3001');
    console.log('2. ✅ Frontend berjalan di http://localhost:3002');
    console.log('3. ✅ Sudah login sebagai admin');
    console.log('4. ✅ Token tersimpan di localStorage');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

cekKoneksi();
