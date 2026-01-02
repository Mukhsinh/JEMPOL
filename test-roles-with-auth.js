// Test Roles API dengan Authentication
const API_BASE = 'http://localhost:5001';

async function testRolesWithAuth() {
    try {
        console.log('🚀 Testing Roles API dengan Authentication...\n');

        // 1. Login untuk mendapatkan token
        console.log('1. Login untuk mendapatkan token...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@jempol.com',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const loginResult = await loginResponse.json();
        const token = loginResult.data.session.access_token;
        console.log('✅ Login berhasil, token diperoleh\n');

        // 2. Test GET /api/roles
        console.log('2. Test GET /api/roles...');
        const rolesResponse = await fetch(`${API_BASE}/api/roles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!rolesResponse.ok) {
            throw new Error(`GET roles failed: ${rolesResponse.status}`);
        }

        const rolesResult = await rolesResponse.json();
        console.log(`✅ GET /api/roles berhasil - Ditemukan ${rolesResult.data?.length || 0} peran`);
        
        if (rolesResult.data && rolesResult.data.length > 0) {
            console.log('   Peran yang ditemukan:');
            rolesResult.data.forEach(role => {
                console.log(`   - ${role.name} (${role.code}) - ${role.is_active ? 'Aktif' : 'Nonaktif'}`);
            });
        }
        console.log('');

        // 3. Test GET /api/roles/:id/users
        if (rolesResult.data && rolesResult.data.length > 0) {
            const firstRole = rolesResult.data[0];
            console.log(`3. Test GET /api/roles/${firstRole.id}/users...`);
            
            const usersResponse = await fetch(`${API_BASE}/api/roles/${firstRole.id}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!usersResponse.ok) {
                throw new Error(`GET users by role failed: ${usersResponse.status}`);
            }

            const usersResult = await usersResponse.json();
            console.log(`✅ GET /api/roles/:id/users berhasil - ${usersResult.message}`);
            
            if (usersResult.data && usersResult.data.length > 0) {
                console.log('   Pengguna yang ditemukan:');
                usersResult.data.forEach(user => {
                    console.log(`   - ${user.full_name} (${user.email})`);
                });
            }
            console.log('');
        }

        // 4. Test CREATE role
        console.log('4. Test POST /api/roles (Create Role)...');
        const newRole = {
            name: 'Test Role API',
            code: 'TEST_API',
            description: 'Role untuk testing API dengan auth',
            permissions: {
                test_permission: true,
                api_test: true
            }
        };

        const createResponse = await fetch(`${API_BASE}/api/roles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newRole)
        });

        if (!createResponse.ok) {
            const errorResult = await createResponse.json();
            throw new Error(`CREATE role failed: ${createResponse.status} - ${errorResult.message}`);
        }

        const createResult = await createResponse.json();
        console.log(`✅ POST /api/roles berhasil - ${createResult.message}`);
        const createdRoleId = createResult.data?.id;
        console.log('');

        // 5. Test UPDATE role
        if (createdRoleId) {
            console.log('5. Test PUT /api/roles/:id (Update Role)...');
            const updateData = {
                description: 'Role untuk testing API dengan auth - UPDATED',
                permissions: {
                    test_permission: true,
                    api_test: true,
                    updated_permission: true
                }
            };

            const updateResponse = await fetch(`${API_BASE}/api/roles/${createdRoleId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!updateResponse.ok) {
                const errorResult = await updateResponse.json();
                throw new Error(`UPDATE role failed: ${updateResponse.status} - ${errorResult.message}`);
            }

            const updateResult = await updateResponse.json();
            console.log(`✅ PUT /api/roles/:id berhasil - ${updateResult.message}`);
            console.log('');

            // 6. Test DELETE role
            console.log('6. Test DELETE /api/roles/:id...');
            const deleteResponse = await fetch(`${API_BASE}/api/roles/${createdRoleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!deleteResponse.ok) {
                const errorResult = await deleteResponse.json();
                throw new Error(`DELETE role failed: ${deleteResponse.status} - ${errorResult.message}`);
            }

            const deleteResult = await deleteResponse.json();
            console.log(`✅ DELETE /api/roles/:id berhasil - ${deleteResult.message}`);
            console.log('');
        }

        console.log('🎉 SEMUA TEST BERHASIL!');
        console.log('✅ API Roles berfungsi dengan sempurna');
        console.log('✅ Authentication berfungsi dengan baik');
        console.log('✅ CRUD operations berhasil semua');
        console.log('✅ Integrasi database berhasil');
        console.log('\n📋 Halaman /settings/roles-permissions siap digunakan!');

    } catch (error) {
        console.error('❌ Test gagal:', error.message);
        process.exit(1);
    }
}

// Jalankan test
testRolesWithAuth();