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

async function testAppSettingsAPI() {
    console.log('🔧 Testing Enhanced App Settings API...\n');

    try {
        // Test 1: Save settings dengan field baru
        console.log('1️⃣ Testing save settings dengan field baru...');
        const saveResponse = await fetch(`${API_BASE}/app-settings`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer dummy-token',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testSettings)
        });

        if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ Save berhasil:', saveResult.message);
        } else {
            const errorData = await saveResponse.json();
            console.log('❌ Save gagal:', errorData.message);
        }

        // Test 2: Load settings
        console.log('\n2️⃣ Testing load settings...');
        const loadResponse = await fetch(`${API_BASE}/app-settings`, {
            headers: {
                'Authorization': 'Bearer dummy-token',
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
            console.log('❌ Load gagal:', loadResponse.status);
        }

        // Test 3: Public settings
        console.log('\n3️⃣ Testing public settings...');
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
        } else {
            console.log('❌ Public API gagal:', publicResponse.status);
        }

        // Test 4: Update single setting
        console.log('\n4️⃣ Testing update single setting...');
        const singleUpdateResponse = await fetch(`${API_BASE}/app-settings/app_footer`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer dummy-token',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: 'Footer yang diperbarui melalui single update API',
                type: 'text'
            })
        });

        if (singleUpdateResponse.ok) {
            const updateResult = await singleUpdateResponse.json();
            console.log('✅ Single update berhasil:', updateResult.message);
        } else {
            const errorData = await singleUpdateResponse.json();
            console.log('❌ Single update gagal:', errorData.message);
        }

        console.log('\n🎉 Test selesai!');

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
    }
}

// Jalankan test
testAppSettingsAPI();