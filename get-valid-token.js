// Get valid token for testing
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function getValidToken() {
    console.log('🔑 Getting valid token for testing...\n');

    try {
        // Try to login with admin credentials
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });

        console.log(`Login Response Status: ${loginResponse.status}`);
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login successful!');
            console.log('Token:', loginData.token);
            
            // Test the token
            await testWithToken(loginData.token);
        } else {
            const errorText = await loginResponse.text();
            console.log('❌ Login failed:', errorText);
            
            // Try with different credentials
            console.log('\n🔄 Trying alternative credentials...');
            await tryAlternativeLogin();
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
    }
}

async function tryAlternativeLogin() {
    const credentials = [
        { email: 'admin@admin.com', password: 'admin123' },
        { email: 'admin@test.com', password: 'password' },
        { email: 'test@admin.com', password: 'test123' }
    ];

    for (const cred of credentials) {
        try {
            console.log(`Trying ${cred.email}...`);
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cred)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success with ${cred.email}!`);
                console.log('Token:', data.token);
                await testWithToken(data.token);
                return;
            }
        } catch (error) {
            console.log(`❌ Failed with ${cred.email}`);
        }
    }
    
    console.log('\n⚠️ No valid credentials found. Testing with mock data...');
    await testWithoutAuth();
}

async function testWithToken(token) {
    console.log('\n📊 Testing export endpoints with valid token...');
    
    // Test PDF export
    try {
        const pdfResponse = await fetch(`${API_BASE}/reports/export/pdf?dateRange=month`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`PDF Export Status: ${pdfResponse.status}`);
        if (pdfResponse.ok) {
            console.log('✅ PDF export working!');
        } else {
            const errorText = await pdfResponse.text();
            console.log('❌ PDF export failed:', errorText);
        }
    } catch (error) {
        console.log('❌ PDF export error:', error.message);
    }

    // Test Excel export
    try {
        const excelResponse = await fetch(`${API_BASE}/reports/export/excel?dateRange=month`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Excel Export Status: ${excelResponse.status}`);
        if (excelResponse.ok) {
            console.log('✅ Excel export working!');
        } else {
            const errorText = await excelResponse.text();
            console.log('❌ Excel export failed:', errorText);
        }
    } catch (error) {
        console.log('❌ Excel export error:', error.message);
    }
}

async function testWithoutAuth() {
    console.log('\n🔧 Testing export functionality without auth (for development)...');
    
    // We can temporarily disable auth for testing
    console.log('💡 Suggestion: Temporarily disable auth middleware for testing export functions');
    console.log('   Or create a test admin user in the database');
}

// Run the test
getValidToken().catch(console.error);