const axios = require('axios');

async function testApplicationAfterRestart() {
    console.log('🔄 TESTING APLIKASI SETELAH RESTART');
    console.log('='.repeat(50));
    
    // Wait for servers to start
    console.log('\n⏳ Menunggu servers siap...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test backend
    console.log('\n1. 🖥️ Testing Backend (Port 3003)...');
    try {
        const backendResponse = await axios.get('http://localhost:3003/api/health', { 
            timeout: 5000 
        });
        console.log('✅ Backend AKTIF:', backendResponse.data);
    } catch (err) {
        console.log('❌ Backend belum siap:', err.message);
        console.log('   Tunggu beberapa detik lagi...');
    }
    
    // Test frontend
    console.log('\n2. 🌐 Testing Frontend (Port 3001)...');
    try {
        const frontendResponse = await axios.get('http://localhost:3001', { 
            timeout: 5000,
            validateStatus: () => true
        });
        console.log('✅ Frontend AKTIF, status:', frontendResponse.status);
    } catch (err) {
        console.log('❌ Frontend belum siap:', err.message);
    }
    
    // Test auth endpoint
    console.log('\n3. 🔐 Testing Auth Endpoint...');
    try {
        const authResponse = await axios.post('http://localhost:3003/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        }, { 
            timeout: 10000,
            validateStatus: () => true
        });
        
        if (authResponse.status === 200) {
            console.log('✅ Auth endpoint BERFUNGSI');
            console.log('   Token diterima:', authResponse.data.token ? 'Ya' : 'Tidak');
        } else {
            console.log('⚠️ Auth response status:', authResponse.status);
            console.log('   Data:', authResponse.data);
        }
    } catch (err) {
        console.log('❌ Auth endpoint error:', err.message);
    }
    
    // Test API endpoints
    console.log('\n4. 📊 Testing API Endpoints...');
    const endpoints = [
        '/api/units',
        '/api/service-categories', 
        '/api/patient-types',
        '/api/qr-codes'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`http://localhost:3003${endpoint}`, {
                timeout: 5000,
                validateStatus: () => true
            });
            
            if (response.status === 200) {
                console.log(`✅ ${endpoint}: OK`);
            } else {
                console.log(`⚠️ ${endpoint}: Status ${response.status}`);
            }
        } catch (err) {
            console.log(`❌ ${endpoint}: Error`);
        }
    }
    
    console.log('\n🎯 HASIL TESTING:');
    console.log('-'.repeat(30));
    console.log('Jika semua test ✅, aplikasi siap digunakan');
    console.log('Jika ada ❌, tunggu beberapa detik dan coba lagi');
    console.log('\n🌐 Akses aplikasi di: http://localhost:3001');
    console.log('🔑 Login: admin / admin123');
}

testApplicationAfterRestart().catch(console.error);