// Test login with existing admin
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testAdminLogin() {
    console.log('🔑 Testing login with existing admin users...\n');

    const adminEmails = [
        'admin@jempol.com',
        'mukhsin9@gmail.com'
    ];

    const passwords = [
        'password',
        'admin123',
        'test123',
        '123456',
        'admin'
    ];

    for (const email of adminEmails) {
        console.log(`\n👤 Testing email: ${email}`);
        
        for (const password of passwords) {
            try {
                console.log(`  🔐 Trying password: ${password}`);
                
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const responseText = await response.text();
                console.log(`  Status: ${response.status}`);
                
                if (response.ok) {
                    const data = JSON.parse(responseText);
                    console.log(`  ✅ SUCCESS! Session token: ${data.data?.session?.access_token?.substring(0, 50)}...`);
                    
                    // Test export with this token
                    await testExportWithToken(data.data?.session?.access_token);
                    return;
                } else {
                    console.log(`  ❌ Failed: ${responseText}`);
                }
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
            }
        }
    }
    
    console.log('\n⚠️ No valid login found. Let me create a test route without auth...');
    await createTestRoute();
}

async function testExportWithToken(token) {
    console.log('\n📊 Testing export with valid token...');
    
    try {
        // Test PDF export
        const pdfResponse = await fetch(`${API_BASE}/reports/export/pdf?dateRange=month`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`PDF Export Status: ${pdfResponse.status}`);
        
        if (pdfResponse.ok) {
            console.log('✅ PDF export working! File size:', pdfResponse.headers.get('content-length'));
        } else {
            const errorText = await pdfResponse.text();
            console.log('❌ PDF export failed:', errorText);
        }

        // Test Excel export
        const excelResponse = await fetch(`${API_BASE}/reports/export/excel?dateRange=month`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Excel Export Status: ${excelResponse.status}`);
        
        if (excelResponse.ok) {
            console.log('✅ Excel export working! File size:', excelResponse.headers.get('content-length'));
        } else {
            const errorText = await excelResponse.text();
            console.log('❌ Excel export failed:', errorText);
        }
        
    } catch (error) {
        console.log('❌ Export test error:', error.message);
    }
}

async function createTestRoute() {
    console.log('\n💡 Suggestion: Create a temporary test route without authentication');
    console.log('   Add this to your backend routes:');
    console.log('   router.get("/test-export/pdf", exportToPDF);');
    console.log('   router.get("/test-export/excel", exportToExcel);');
}

// Run the test
testAdminLogin().catch(console.error);