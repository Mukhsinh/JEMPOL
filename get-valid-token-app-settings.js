// Get valid token for app settings testing
const API_BASE = 'http://localhost:5000/api';

async function getValidToken() {
    console.log('🔑 Getting valid token for app settings testing...\n');

    try {
        // Try to login with admin credentials
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@jempol.com',
                password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.success && loginData.data?.session?.access_token) {
            console.log('✅ Login successful!');
            const token = loginData.data.session.access_token;
            console.log('Token:', token.substring(0, 50) + '...');
            
            // Test the token with app settings
            console.log('\n🔧 Testing token with app settings...');
            const testResponse = await fetch(`${API_BASE}/app-settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const testData = await testResponse.json();
            console.log('Status:', testResponse.status);
            
            if (testResponse.ok) {
                console.log('✅ Token works with app settings!');
                console.log('Settings count:', Array.isArray(testData) ? testData.length : 'Not array');
                
                // Show current settings
                if (Array.isArray(testData)) {
                    console.log('\n📋 Current settings:');
                    testData.forEach(setting => {
                        console.log(`  ${setting.setting_key}: ${setting.setting_value || '(empty)'}`);
                    });
                }
                
                return token;
            } else {
                console.log('❌ Token failed with app settings:', testData);
            }
        } else {
            console.log('❌ Login failed:', loginData);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    return null;
}

// Test with valid token
async function testWithValidToken() {
    const token = await getValidToken();
    
    if (!token) {
        console.log('❌ Could not get valid token');
        return;
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🧪 Testing App Settings with Valid Token...\n');
    
    // Test update settings
    const testData = {
        app_name: 'Sistem Pengaduan Masyarakat Terpadu - Test Update',
        institution_name: 'RSUD Sehat Sentosa - Test Update',
        manager_name: 'Dr. Test Manager Updated',
        manager_position: 'Kepala Bagian Test Updated',
        job_title: 'Koordinator Test Updated',
        description: 'Deskripsi test untuk instansi yang telah diperbarui',
        address: 'Jl. Test Update No. 456, Kota Test Update',
        contact_email: 'test-update@instansi.go.id',
        contact_phone: '(021) 9876-5432',
        website: 'https://test-update.instansi.go.id',
        logo_url: 'https://example.com/test-logo-updated.png'
    };
    
    try {
        console.log('📝 Updating all settings...');
        const updateResponse = await fetch(`${API_BASE}/app-settings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const updateData = await updateResponse.json();
        console.log('Update Status:', updateResponse.status);
        console.log('Update Response:', JSON.stringify(updateData, null, 2));
        
        if (updateResponse.ok) {
            console.log('✅ Settings updated successfully!');
            
            // Verify the update
            console.log('\n🔍 Verifying updates...');
            const verifyResponse = await fetch(`${API_BASE}/app-settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok && Array.isArray(verifyData)) {
                console.log('✅ Verification successful!');
                console.log('\n📋 Updated settings:');
                verifyData.forEach(setting => {
                    const isUpdated = testData[setting.setting_key] === setting.setting_value;
                    const status = isUpdated ? '✅' : '⚠️';
                    console.log(`  ${status} ${setting.setting_key}: ${setting.setting_value || '(empty)'}`);
                });
            }
        } else {
            console.log('❌ Update failed:', updateData);
        }
        
    } catch (error) {
        console.log('❌ Error during update:', error.message);
    }
}

// Run the test
testWithValidToken().catch(console.error);