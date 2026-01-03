// Create Admin User for QR Management
// Script untuk memastikan admin user ada di database

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration in backend/.env');
    console.log('Required variables:');
    console.log('- SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
    console.log('🔐 Creating Admin User for QR Management...');
    console.log('');

    try {
        // 1. Check if admin table exists
        console.log('1. 📋 Checking admin table...');
        const { data: tables, error: tablesError } = await supabase
            .from('admins')
            .select('id')
            .limit(1);

        if (tablesError) {
            console.error('❌ Admin table not found or accessible:', tablesError.message);
            console.log('');
            console.log('🔧 Creating admin table...');
            
            // Create admin table if it doesn't exist
            const { error: createTableError } = await supabase.rpc('create_admin_table');
            if (createTableError) {
                console.error('❌ Failed to create admin table:', createTableError.message);
                return;
            }
            console.log('✅ Admin table created');
        } else {
            console.log('✅ Admin table exists');
        }

        // 2. Check if admin user already exists
        console.log('');
        console.log('2. 👤 Checking existing admin users...');
        const { data: existingAdmins, error: checkError } = await supabase
            .from('admins')
            .select('*')
            .eq('is_active', true);

        if (checkError) {
            console.error('❌ Error checking existing admins:', checkError.message);
            return;
        }

        console.log(`Found ${existingAdmins?.length || 0} active admin(s)`);
        
        if (existingAdmins && existingAdmins.length > 0) {
            console.log('');
            console.log('📋 Existing admins:');
            existingAdmins.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.username} (${admin.email}) - Role: ${admin.role}`);
            });
        }

        // 3. Create default admin if none exists
        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123';
        
        const existingAdmin = existingAdmins?.find(admin => admin.email === adminEmail);
        
        if (!existingAdmin) {
            console.log('');
            console.log('3. 🔧 Creating default admin user...');
            
            // Hash password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            // Create admin user
            const { data: newAdmin, error: createError } = await supabase
                .from('admins')
                .insert([
                    {
                        username: 'admin',
                        email: adminEmail,
                        password_hash: hashedPassword,
                        full_name: 'System Administrator',
                        role: 'superadmin',
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (createError) {
                console.error('❌ Failed to create admin user:', createError.message);
                return;
            }

            console.log('✅ Default admin user created successfully');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            console.log(`   Role: superadmin`);
        } else {
            console.log('');
            console.log('3. ✅ Default admin user already exists');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Role: ${existingAdmin.role}`);
            
            // Update password if needed
            console.log('');
            console.log('🔧 Updating admin password for testing...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            const { error: updateError } = await supabase
                .from('admins')
                .update({
                    password_hash: hashedPassword,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingAdmin.id);

            if (updateError) {
                console.error('❌ Failed to update admin password:', updateError.message);
            } else {
                console.log('✅ Admin password updated for testing');
                console.log(`   Password: ${adminPassword}`);
            }
        }

        // 4. Create Supabase Auth user if needed
        console.log('');
        console.log('4. 🔐 Ensuring Supabase Auth user exists...');
        
        try {
            // Try to create auth user (will fail if already exists, which is fine)
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: 'System Administrator',
                    role: 'superadmin'
                }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    console.log('✅ Supabase Auth user already exists');
                    
                    // Update password
                    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
                        authUser?.user?.id || 'unknown',
                        { password: adminPassword }
                    );
                    
                    if (!updateAuthError) {
                        console.log('✅ Supabase Auth password updated');
                    }
                } else {
                    console.warn('⚠️ Supabase Auth user creation failed:', authError.message);
                }
            } else {
                console.log('✅ Supabase Auth user created successfully');
            }
        } catch (authCreateError) {
            console.warn('⚠️ Supabase Auth operation failed:', authCreateError.message);
        }

        // 5. Test login
        console.log('');
        console.log('5. 🧪 Testing admin login...');
        
        try {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password: adminPassword
            });

            if (loginError) {
                console.error('❌ Login test failed:', loginError.message);
            } else {
                console.log('✅ Login test successful');
                console.log(`   User ID: ${loginData.user?.id}`);
                console.log(`   Email: ${loginData.user?.email}`);
                
                // Sign out after test
                await supabase.auth.signOut();
            }
        } catch (loginTestError) {
            console.warn('⚠️ Login test failed:', loginTestError.message);
        }

        console.log('');
        console.log('🎉 Admin User Setup Complete!');
        console.log('');
        console.log('📋 Login Credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('');
        console.log('🔧 Next Steps:');
        console.log('1. Run TEST_QR_MANAGEMENT_AUTH_FIX.bat');
        console.log('2. Open admin-login-test.html');
        console.log('3. Login with the credentials above');
        console.log('4. Test the QR Management page');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

createAdminUser();