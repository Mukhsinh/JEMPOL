const API_BASE = 'http://localhost:3003/api';

// Test data dengan field baru
const testSettings = {
    app_name: 'Sistem Pengaduan Masyarakat Terpadu - Enhanced',
    app_logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDA3YmZmIi8+Cjwvc3ZnPgo=',
    app_footer: 'Copyright © 2025 Sistem Pengaduan Masyarakat Terpadu Enhanced. Semua hak dilindungi undang-undang.',
    institution_name: 'RSUD Sehat Sentosa Enhanced',
    institution_address: 'Jl. Kesehatan No. 123, Kelurahan Sehat, Kecamatan Sentosa, Kota Bahagia, Provinsi Sejahtera 12345',
    institution_logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMjhhNzQ1Ii8+Cjwvc3ZnPgo=',
    description: 'Rumah Sakit Umum Daerah yang melayani masyarakat dengan sepenuh hati dan profesional.',
    address: 'Jl. Kesehatan No. 123, Kelurahan Sehat, Kecamatan Sentosa, Kota Bahagia 12345',
    contact_email: 'info@rsudsehatsentosa.go.id',
    contact_phone: '(021) 1234-5678',
    website: 'https://www.rsudsehatsentosa.go.id',
    manager_name: 'Dr. Budi Santoso, Sp.PD',
    manager_position: 'Kepala Bagian Humas dan Komunikasi',
    job_title: 'Koordinator Sistem Informasi Pengaduan'
};

async function loginAndGetToken() {
    try {
        console.log('🔐 Attempting login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
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
            const loginResult = await loginResponse.json();
            console.log('✅ Login berhasil');
            return loginResult.token;
        } else {
            console.log('❌ Login gagal, mencoba dengan password lain...');
            
            // Try with different password
            const loginResponse2 = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'admin',
                    password: 'password'
                })
            });

            if (loginResponse2.ok) {
                const loginResult2 = await loginResponse2.json();
                console.log('✅ Login berhasil dengan password alternatif');
                return loginResult2.token;
            } else {
                console.log('❌ Login gagal dengan kedua password');
                return null;
            }
        }
    } catch (error) {
        console.error('❌ Error during login:', error.message);
        return null;
    }
}

async function testAppSettingsWithAuth() {
    console.log('🔧 Testing Enhanced App Settings API with Authentication...\n');

    // Get valid token
    const token = await loginAndGetToken();
    if (!token) {
        console.log('❌ Tidak bisa mendapatkan token, menggunakan public API saja');
        await testPublicAPI();
        return;
    }

    try {
        // Test 1: Save settings dengan field baru
        console.log('\n1️⃣ Testing save settings dengan field baru...');
        const saveResponse = await fetch(`${API_BASE}/app-settings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testSettings)
        });

        if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ Save berhasil:', saveResult.message);
        } else {
            const errorData = await saveResponse.json();
            console.log('❌ Save gagal:', errorData.message || saveResponse.statusText);
        }

        // Test 2: Load settings
        console.log('\n2️⃣ Testing load settings...');
        const loadResponse = await fetch(`${API_BASE}/app-settings`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (loadResponse.ok) {
            const settings = await loadResponse.json();
            console.log('✅ Load berhasil, jumlah settings:', settings.length);
            
            // Convert to map untuk mudah dibaca
            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.setting_key] = setting.setting_value;
            });

            console.log('\n📋 Settings yang dimuat:');
            console.log('- App Name:', settingsMap.app_name);
            console.log('- App Logo:', settingsMap.app_logo ? 'Ada (base64)' : 'Tidak ada');
            console.log('- App Footer:', settingsMap.app_footer);
            console.log('- Institution Name:', settingsMap.institution_name);
            console.log('- Institution Address:', settingsMap.institution_address);
            console.log('- Institution Logo:', settingsMap.institution_logo ? 'Ada (base64)' : 'Tidak ada');
            console.log('- Description:', settingsMap.description);
            console.log('- Contact Email:', settingsMap.contact_email);
            console.log('- Contact Phone:', settingsMap.contact_phone);
            console.log('- Website:', settingsMap.website);
            console.log('- Manager Name:', settingsMap.manager_name);
            console.log('- Manager Position:', settingsMap.manager_position);
            console.log('- Job Title:', settingsMap.job_title);
        } else {
            console.log('❌ Load gagal:', loadResponse.status, loadResponse.statusText);
        }

        // Test 3: Update single setting
        console.log('\n3️⃣ Testing update single setting...');
        const singleUpdateResponse = await fetch(`${API_BASE}/app-settings/app_footer`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: 'Footer yang diperbarui melalui single update API - ' + new Date().toLocaleString(),
                type: 'text'
            })
        });

        if (singleUpdateResponse.ok) {
            const updateResult = await singleUpdateResponse.json();
            console.log('✅ Single update berhasil:', updateResult.message);
        } else {
            const errorData = await singleUpdateResponse.json();
            console.log('❌ Single update gagal:', errorData.message || singleUpdateResponse.statusText);
        }

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
    }

    // Test public API juga
    await testPublicAPI();
}

async function testPublicAPI() {
    console.log('\n4️⃣ Testing public settings...');
    try {
        const publicResponse = await fetch(`${API_BASE}/app-settings/public`);

        if (publicResponse.ok) {
            const publicResult = await publicResponse.json();
            console.log('✅ Public API berhasil');
            console.log('📋 Public settings:', Object.keys(publicResult.data || {}));
            
            // Cek field baru di public settings
            const publicData = publicResult.data || {};
            console.log('\n🌐 Field baru di public settings:');
            console.log('- app_logo:', publicData.app_logo ? 'Ada' : 'Tidak ada');
            console.log('- app_footer:', publicData.app_footer ? 'Ada' : 'Tidak ada');
            console.log('- institution_address:', publicData.institution_address ? 'Ada' : 'Tidak ada');
            console.log('- institution_logo:', publicData.institution_logo ? 'Ada' : 'Tidak ada');
            
            console.log('\n📄 Sample values:');
            if (publicData.app_name) console.log('- App Name:', publicData.app_name);
            if (publicData.app_footer) console.log('- App Footer:', publicData.app_footer.substring(0, 50) + '...');
            if (publicData.institution_name) console.log('- Institution Name:', publicData.institution_name);
            if (publicData.institution_address) console.log('- Institution Address:', publicData.institution_address.substring(0, 50) + '...');
        } else {
            console.log('❌ Public API gagal:', publicResponse.status);
        }
    } catch (error) {
        console.error('❌ Error testing public API:', error.message);
    }

    console.log('\n🎉 Test selesai!');
}

// Jalankan test
testAppSettingsWithAuth();