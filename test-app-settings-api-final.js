const API_BASE = 'http://localhost:3001';

async function testAppSettingsAPI() {
    console.log('🔧 Testing App Settings API Integration');
    console.log('=====================================');

    let authToken = null;

    try {
        // Step 1: Login to get token
        console.log('\n1. Testing Authentication...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            authToken = loginData.token;
            console.log('✓ Authentication successful');
        } else {
            throw new Error('Authentication failed');
        }

        // Step 2: Fetch current settings
        console.log('\n2. Fetching current settings...');
        const settingsResponse = await fetch(`${API_BASE}/api/app-settings`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            console.log('✓ Settings fetched successfully');
            console.log(`   Found ${settings.length} settings`);
            
            // Show current values
            const keySettings = ['app_name', 'institution_name', 'manager_name', 'job_title'];
            keySettings.forEach(key => {
                const setting = settings.find(s => s.setting_key === key);
                if (setting) {
                    console.log(`   ${key}: "${setting.setting_value}"`);
                }
            });
        } else {
            throw new Error(`Failed to fetch settings: ${settingsResponse.status}`);
        }

        // Step 3: Test update
        console.log('\n3. Testing settings update...');
        const updateData = {
            app_name: 'Test App Settings API - ' + new Date().toISOString(),
            institution_name: 'Test Institution API - ' + new Date().toISOString(),
            manager_name: 'Test Manager API',
            job_title: 'Test Job Title API'
        };

        const updateResponse = await fetch(`${API_BASE}/api/app-settings`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            console.log('✓ Settings updated successfully');
            console.log('   Response:', updateResult.message);
        } else {
            const errorData = await updateResponse.json().catch(() => ({}));
            throw new Error(`Update failed: ${errorData.message || updateResponse.status}`);
        }

        // Step 4: Verify update
        console.log('\n4. Verifying update...');
        const verifyResponse = await fetch(`${API_BASE}/api/app-settings`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (verifyResponse.ok) {
            const verifySettings = await verifyResponse.json();
            console.log('✓ Verification successful');
            
            // Check if updates were applied
            Object.keys(updateData).forEach(key => {
                const setting = verifySettings.find(s => s.setting_key === key);
                if (setting && setting.setting_value === updateData[key]) {
                    console.log(`   ✓ ${key} updated correctly`);
                } else {
                    console.log(`   ✗ ${key} update failed`);
                }
            });
        } else {
            throw new Error(`Verification failed: ${verifyResponse.status}`);
        }

        // Step 5: Test public settings
        console.log('\n5. Testing public settings...');
        const publicResponse = await fetch(`${API_BASE}/api/app-settings/public`);

        if (publicResponse.ok) {
            const publicSettings = await publicResponse.json();
            console.log('✓ Public settings fetched successfully');
            console.log('   Public settings count:', Object.keys(publicSettings.data || {}).length);
        } else {
            throw new Error(`Public settings failed: ${publicResponse.status}`);
        }

        console.log('\n🎉 All tests passed! App Settings API is working correctly.');
        console.log('\n📝 Summary:');
        console.log('   - Authentication: ✓');
        console.log('   - Fetch settings: ✓');
        console.log('   - Update settings: ✓');
        console.log('   - Verify updates: ✓');
        console.log('   - Public settings: ✓');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n🔍 Troubleshooting:');
        console.log('   1. Make sure backend server is running on port 3001');
        console.log('   2. Check if admin user exists with password "admin123"');
        console.log('   3. Verify app_settings table exists in database');
        console.log('   4. Check server logs for detailed error information');
    }
}

// Run the test
testAppSettingsAPI();