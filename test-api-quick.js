// Quick API test script
const API_BASE = 'http://localhost:3003/api';

async function testAPI() {
    console.log('🔧 Testing API Connection...');
    console.log('API Base:', API_BASE);
    
    try {
        // Test health endpoint
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Health Check: SUCCESS');
            console.log('Response:', data);
            
            // Test public units
            const unitsResponse = await fetch(`${API_BASE}/public/units`);
            if (unitsResponse.ok) {
                const unitsData = await unitsResponse.json();
                console.log('✅ Public Units: SUCCESS');
                console.log('Units count:', Array.isArray(unitsData) ? unitsData.length : 'Unknown');
            } else {
                console.log('❌ Public Units: FAILED');
            }
            
        } else {
            console.log('❌ Health Check: FAILED');
            console.log('Status:', response.status);
        }
        
    } catch (error) {
        console.log('❌ Connection Error:', error.message);
    }
}

testAPI();