// Test script untuk login dan akses dashboard
const API_BASE = 'http://localhost:5001/api';
const FRONTEND_BASE = 'http://localhost:3001';

async function testLogin() {
    console.log('🔐 Testing login...');
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@jempol.com',
                password: 'admin123'
            })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Login berhasil!');
            const token = data.data?.session?.access_token;
            console.log('Token:', token ? 'Ada' : 'Tidak ada');
            console.log('User:', data.data?.admin?.full_name || data.data?.admin?.username);
            return token;
        } else {
            console.log('❌ Login gagal:', data.error || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.log('❌ Error saat login:', error.message);
        return null;
    }
}

async function testDashboardMetrics(token) {
    console.log('\n📊 Testing dashboard metrics...');
    
    if (!token) {
        console.log('❌ Tidak ada token untuk test dashboard');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/complaints/dashboard/metrics`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Dashboard metrics berhasil diambil!');
            console.log('Status counts:', data.data?.statusCounts || 'Tidak ada');
            console.log('Recent tickets:', data.data?.recentTickets?.length || 0, 'tickets');
        } else {
            console.log('❌ Dashboard metrics gagal:', data.error || 'Unknown error');
        }
    } catch (error) {
        console.log('❌ Error saat mengambil dashboard metrics:', error.message);
    }
}

async function testFrontendAccess() {
    console.log('\n🌐 Testing frontend access...');
    
    try {
        const response = await fetch(FRONTEND_BASE);
        if (response.ok) {
            console.log('✅ Frontend dapat diakses di', FRONTEND_BASE);
        } else {
            console.log('❌ Frontend tidak dapat diakses - Status:', response.status);
        }
    } catch (error) {
        console.log('❌ Error saat mengakses frontend:', error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Memulai test lengkap untuk dashboard SARAH...\n');
    
    // Test frontend access
    await testFrontendAccess();
    
    // Test login
    const token = await testLogin();
    
    // Test dashboard metrics
    await testDashboardMetrics(token);
    
    console.log('\n✨ Test selesai!');
    console.log('\n📋 Langkah selanjutnya:');
    console.log('1. Buka browser ke http://localhost:3001');
    console.log('2. Login dengan email: admin@jempol.com, password: admin123');
    console.log('3. Dashboard seharusnya muncul dengan data metrics');
}

// Jalankan test
runAllTests().catch(console.error);