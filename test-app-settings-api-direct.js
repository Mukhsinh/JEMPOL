const API_BASE = 'http://localhost:3003/api';

async function testAppSettingsAPI() {
    console.log('=== Testing App Settings API ===');
    
    try {
        // 1. Login first
        console.log('\n1. Testing login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@jempol.com',
                password: 'password'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');

        // 2. Get current settings
        console.log('\n2. Getting current settings...');
        const getResponse = await fetch(`${API_BASE}/app-settings`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!getResponse.ok) {
            throw new Error(`Get settings failed: ${getResponse.status}`);
        }

        const currentSettings = await getResponse.json();
        console.log('✅ Current settings retrieved');
        console.log('Current settings count:', currentSettings.length);
        
        // Check if app_footer exists
        const footerSetting = currentSettings.find(s => s.setting_key === 'app_footer');
        console.log('Footer setting exists:', !!footerSetting);
        if (footerSetting) {
            console.log('Current footer value:', footerSetting.setting_value);
        }

        // 3. Update settings with footer
        console.log('\n3. Updating settings with footer...');
        const updateData = {
            app_name: 'Sistem Pengaduan Masyarakat Terpadu - Test Footer API',
            app_footer: 'Copyright © 2025 Test Footer API Integration. Semua hak dilindungi. | Powered by KISS System | API Test',
            institution_name: 'RSUD Test Footer API',
            manager_name: 'Dr. Test Footer API Manager',
            manager_position: 'Kepala Bagian Test Footer API',
            job_title: 'Koordinator Footer API Test',
            logo_url: 'https://example.com/test-footer-api-logo.png',
            description: 'Deskripsi test untuk footer API integration',
            address: 'Jl. Test Footer API No. 456, Kota Test Footer API',
            contact_email: 'test-footer-api@instansi.go.id',
            contact_phone: '(021) 3333-4444',
            website: 'https://test-footer-api.instansi.go.id'
        };

        const updateResponse = await fetch(`${API_BASE}/app-settings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Update settings failed: ${updateResponse.status} - ${errorText}`);
        }

        const updateResult = await updateResponse.json();
        console.log('✅ Settings updated successfully');
        console.log('Update result:', updateResult);

        // 4. Verify the update
        console.log('\n4. Verifying the update...');
        const verifyResponse = await fetch(`${API_BASE}/app-settings`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!verifyResponse.ok) {
            throw new Error(`Verify settings failed: ${verifyResponse.status}`);
        }

        const verifiedSettings = await verifyResponse.json();
        const verifiedFooter = verifiedSettings.find(s => s.setting_key === 'app_footer');
        
        console.log('✅ Settings verified');
        console.log('Updated footer value:', verifiedFooter?.setting_value);
        
        // Check all required fields
        const requiredFields = ['app_name', 'app_footer', 'institution_name', 'logo_url', 'address'];
        console.log('\n5. Checking required fields...');
        
        requiredFields.forEach(field => {
            const setting = verifiedSettings.find(s => s.setting_key === field);
            console.log(`${field}: ${setting ? '✅ Found' : '❌ Missing'} - ${setting?.setting_value || 'N/A'}`);
        });

        // 5. Test public settings endpoint
        console.log('\n6. Testing public settings endpoint...');
        const publicResponse = await fetch(`${API_BASE}/app-settings/public`);

        if (!publicResponse.ok) {
            throw new Error(`Public settings failed: ${publicResponse.status}`);
        }

        const publicSettings = await publicResponse.json();
        console.log('✅ Public settings retrieved');
        console.log('Public settings data:', publicSettings.data);
        
        // Check if footer is public
        if (publicSettings.data && publicSettings.data.app_footer) {
            console.log('✅ Footer is available in public settings');
            console.log('Public footer value:', publicSettings.data.app_footer);
        } else {
            console.log('❌ Footer not available in public settings');
        }

        console.log('\n=== All tests completed successfully! ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testAppSettingsAPI();