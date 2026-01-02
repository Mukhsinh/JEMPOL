// Test script untuk API App Settings
const API_BASE = 'http://localhost:5000/api';

// Test data
const testSettings = {
    app_name: 'Sistem Pengaduan Masyarakat Terpadu - Updated',
    institution_name: 'RSUD Sehat Sentosa',
    manager_name: 'Dr. Budi Santoso',
    manager_position: 'Kepala Bagian Humas',
    description: 'Rumah Sakit Umum Daerah yang melayani masyarakat dengan sepenuh hati',
    address: 'Jl. Kesehatan No. 123, Jakarta Selatan 12345',
    contact_phone: '(021) 1234-5678',
    contact_email: 'info@rsudsehatsentosa.go.id',
    website: 'https://www.rsudsehatsentosa.go.id'
};

// Get auth token (mock for testing)
const getAuthToken = () => {
    // In real app, this would come from login
    return 'mock-jwt-token';
};

// Test functions
async function testGetPublicSettings() {
    console.log('\n=== Testing GET Public Settings ===');
    try {
        const response = await fetch(`${API_BASE}/app-settings/public`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Public settings retrieved successfully');
            console.log('Data:', data);
        } else {
            console.log('❌ Failed to get public settings:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testGetAllSettings() {
    console.log('\n=== Testing GET All Settings (Protected) ===');
    try {
        const response = await fetch(`${API_BASE}/app-settings`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ All settings retrieved successfully');
            console.log('Data:', data);
        } else {
            console.log('❌ Failed to get settings:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testUpdateSettings() {
    console.log('\n=== Testing PUT Update Settings ===');
    try {
        const response = await fetch(`${API_BASE}/app-settings`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testSettings)
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Settings updated successfully');
            console.log('Response:', data);
        } else {
            console.log('❌ Failed to update settings:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testUpdateSingleSetting() {
    console.log('\n=== Testing PUT Single Setting ===');
    try {
        const response = await fetch(`${API_BASE}/app-settings/app_name`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: 'Sistem Pengaduan Terpadu - Test Update',
                type: 'text'
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Single setting updated successfully');
            console.log('Response:', data);
        } else {
            console.log('❌ Failed to update single setting:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testDatabaseConnection() {
    console.log('\n=== Testing Database Connection ===');
    try {
        // Test if we can reach the API
        const response = await fetch(`${API_BASE}/app-settings/public`);
        
        if (response.ok) {
            console.log('✅ Database connection working');
        } else {
            console.log('❌ Database connection issue');
        }
    } catch (error) {
        console.log('❌ Cannot connect to API server');
        console.log('Make sure backend is running on port 5000');
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting App Settings API Tests...');
    console.log('Backend should be running on http://localhost:5000');
    
    await testDatabaseConnection();
    await testGetPublicSettings();
    await testGetAllSettings();
    await testUpdateSettings();
    await testUpdateSingleSetting();
    
    console.log('\n✨ All tests completed!');
}

// Export for Node.js or run in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests };
} else {
    // Run in browser
    runAllTests();
}alhost:5000/api';

// Mock token untuk testing (dalam implementasi nyata, ambil dari localStorage)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3OC05MGFiLWNkZWYtMTIzNC01Njc4OTBhYmNkZWYiLCJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MDQxNTM2MDB9.test';

async function testGetAppSettings() {
    console.log('🧪 Testing GET /api/app-settings...');
    
    try {
        const response = await fetch(`${API_BASE}/app-settings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ GET app-settings berhasil:', data);
            return data;
        } else {
            console.log('❌ GET app-settings gagal:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error GET app-settings:', error);
        return null;
    }
}

async function testGetPublicAppSettings() {
    console.log('🧪 Testing GET /api/app-settings/public...');
    
    try {
        const response = await fetch(`${API_BASE}/app-settings/public`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ GET public app-settings berhasil:', data);
            return data;
        } else {
            console.log('❌ GET public app-settings gagal:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error GET public app-settings:', error);
        return null;
    }
}

async function testUpdateAppSettings() {
    console.log('🧪 Testing POST /api/app-settings...');
    
    const testData = {
        app_name: 'Sistem Pengaduan Masyarakat Terpadu - Test',
        institution_name: 'RSUD Sehat Sentosa - Test',
        manager_name: 'Dr. Budi Santoso',
        job_title: 'Kepala Bagian Humas',
        logo_url: 'https://example.com/logo-test.png'
    };
    
    try {
        const response = await fetch(`${API_BASE}/app-settings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ POST app-settings berhasil:', data);
            return data;
        } else {
            console.log('❌ POST app-settings gagal:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error POST app-settings:', error);
        return null;
    }
}

async function testHealthCheck() {
    console.log('🧪 Testing server health...');
    
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Server health check berhasil:', data);
            return true;
        } else {
            console.log('❌ Server health check gagal:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Error health check:', error);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Memulai test API App Settings...\n');
    
    // Test server health first
    const isHealthy = await testHealthCheck();
    if (!isHealthy) {
        console.log('❌ Server tidak sehat, menghentikan test');
        return;
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Test get public settings (no auth required)
    await testGetPublicAppSettings();
    
    console.log('\n' + '='.repeat(50));
    
    // Test get all settings (auth required)
    await testGetAppSettings();
    
    console.log('\n' + '='.repeat(50));
    
    // Test update settings (auth required)
    await testUpdateAppSettings();
    
    console.log('\n' + '='.repeat(50));
    
    // Test get settings again to verify update
    console.log('🧪 Verifying update...');
    await testGetAppSettings();
    
    console.log('\n✨ Test selesai!');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    runTests();
} else {
    // Browser environment
    console.log('Script loaded. Call runTests() to start testing.');
    window.runTests = runTests;
    window.testGetAppSettings = testGetAppSettings;
    window.testGetPublicAppSettings = testGetPublicAppSettings;
    window.testUpdateAppSettings = testUpdateAppSettings;
}