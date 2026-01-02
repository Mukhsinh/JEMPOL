// Test script untuk login API
const testLogin = async () => {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing SARAH Login API...\n');
  
  // Test data
  const testUsers = [
    {
      email: 'admin@jempol.com',
      password: 'admin123',
      name: 'Admin Utama'
    },
    {
      email: 'mukhsin9@gmail.com', 
      password: 'admin123',
      name: 'Mukhsin Superadmin'
    }
  ];
  
  for (const user of testUsers) {
    console.log(`Testing login for: ${user.name} (${user.email})`);
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Login SUCCESS');
        console.log(`   Role: ${data.data.admin.role}`);
        console.log(`   Username: ${data.data.admin.username}`);
        console.log(`   Full Name: ${data.data.admin.full_name}`);
        
        // Test token verification
        const token = data.data.session.access_token;
        console.log('   Testing token verification...');
        
        const verifyResponse = await fetch(`${baseUrl}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
          console.log('   ✅ Token verification SUCCESS');
        } else {
          console.log('   ❌ Token verification FAILED:', verifyData.error);
        }
        
      } else {
        console.log('❌ Login FAILED:', data.error);
      }
      
    } catch (error) {
      console.log('❌ Request ERROR:', error.message);
    }
    
    console.log(''); // Empty line
  }
  
  console.log('🎉 Test completed!');
};

// Run if this is executed directly (Node.js)
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testLogin();
} else {
  // Browser environment
  window.testLogin = testLogin;
  console.log('Run testLogin() in console to test');
}