// Test create unit type via API
const API_URL = 'http://localhost:3004/api';

// Ambil token dari localStorage browser (copy dari browser console)
// Atau gunakan token hardcode untuk testing
const TOKEN = 'YOUR_TOKEN_HERE'; // Ganti dengan token dari localStorage

async function testCreateUnitType() {
    console.log('🧪 Testing Create Unit Type API...\n');
    
    const testData = {
        name: 'Layanan Perawat',
        code: 'PRWT',
        description: 'Layanan perawatan pasien',
        icon: 'local_hospital',
        color: '#3B82F6',
        is_active: true
    };
    
    console.log('📤 Sending data:', testData);
    console.log('🔑 Using token:', TOKEN.substring(0, 20) + '...\n');
    
    try {
        const response = await fetch(`${API_URL}/master-data/unit-types`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response data:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('\n✅ SUCCESS! Unit type created:');
            console.log('   ID:', data.id);
            console.log('   Name:', data.name);
            console.log('   Code:', data.code);
        } else {
            console.log('\n❌ FAILED!');
            console.log('   Error:', data.error);
            if (data.details) console.log('   Details:', data.details);
            if (data.hint) console.log('   Hint:', data.hint);
        }
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
}

// Jika dijalankan langsung
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testCreateUnitType();
}
