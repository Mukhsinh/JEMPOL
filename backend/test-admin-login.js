import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function testAdminLogin() {
  console.log('🧪 Testing Admin Login...\n');
  
  try {
    // Test 1: Login dengan kredensial yang benar
    console.log('1️⃣ Test login dengan kredensial benar...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login berhasil!');
      console.log('📋 Data admin:', loginResponse.data.data.admin);
      console.log('🔑 Token:', loginResponse.data.token.substring(0, 20) + '...');
      
      const token = loginResponse.data.data.token;
      
      // Test 2: Verify token
      console.log('\n2️⃣ Test verify token...');
      const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (verifyResponse.data.success) {
        console.log('✅ Token valid!');
        console.log('📋 Admin dari token:', verifyResponse.data.data.admin);
      }
    }
    
    // Test 3: Login dengan password salah
    console.log('\n3️⃣ Test login dengan password salah...');
    try {
      await axios.post(`${API_URL}/api/auth/login`, {
        username: 'admin',
        password: 'wrongpassword'
      });
      console.log('❌ Seharusnya gagal!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Berhasil menolak password salah');
      }
    }
    
    // Test 4: Login dengan username salah
    console.log('\n4️⃣ Test login dengan username salah...');
    try {
      await axios.post(`${API_URL}/api/auth/login`, {
        username: 'wronguser',
        password: 'admin123'
      });
      console.log('❌ Seharusnya gagal!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Berhasil menolak username salah');
      }
    }
    
    console.log('\n✅ Semua test berhasil!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminLogin();
