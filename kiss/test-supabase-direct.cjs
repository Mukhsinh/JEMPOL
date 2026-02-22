/**
 * Test Supabase connection dengan environment variables yang sama dengan Vite plugin
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually (sama seperti vite-api-plugin.ts)
function loadEnvFiles() {
    const envFiles = [
        path.resolve(__dirname, '..', '.env.local'),
        path.resolve(__dirname, '.env.local'),
    ];

    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            console.log(`📂 Loading: ${envFile}`);
            const content = fs.readFileSync(envFile, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const eqIndex = trimmed.indexOf('=');
                    if (eqIndex > 0) {
                        const key = trimmed.substring(0, eqIndex).trim();
                        const value = trimmed.substring(eqIndex + 1).trim();
                        if (!process.env[key]) {
                            process.env[key] = value;
                        }
                    }
                }
            }
        }
    }

    // Fallback
    if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
        process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    }
    if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
        process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
    }
}

async function testSupabase() {
    loadEnvFiles();

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    console.log('\n🔍 Environment Variables:');
    console.log('   SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('   SUPABASE_ANON_KEY:', supabaseKey ? `${supabaseKey.substring(0, 30)}... (length: ${supabaseKey.length})` : 'NOT SET');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

    if (!supabaseUrl || !supabaseKey) {
        console.error('\n❌ Missing Supabase credentials');
        return;
    }

    console.log('\n🧪 Testing Supabase connection...');

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // Test 1: Simple SELECT
    console.log('\n📝 Test 1: SELECT count from users');
    const { data: countData, error: countError } = await supabase
        .from('users')
        .select('count');

    if (countError) {
        console.error('❌ Error:', countError);
    } else {
        console.log('✅ Success:', countData);
    }

    // Test 2: Check for duplicate email
    const testEmail = 'test@example.com';
    console.log(`\n📝 Test 2: Check for duplicate email: ${testEmail}`);
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', testEmail.toLowerCase())
        .maybeSingle();

    if (checkError) {
        console.error('❌ Error:', checkError);
    } else {
        console.log('✅ Success:', existingUser ? 'User found' : 'User not found');
    }

    // Test 3: Try to insert a user
    const testUserEmail = `test-${Date.now()}@example.com`;
    console.log(`\n📝 Test 3: INSERT user with email: ${testUserEmail}`);
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
            full_name: 'Test User',
            email: testUserEmail,
            role: 'staff',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (insertError) {
        console.error('❌ Error:', insertError);
    } else {
        console.log('✅ Success: User created with ID:', newUser.id);

        // Test 4: Delete the user
        console.log(`\n📝 Test 4: DELETE user with ID: ${newUser.id}`);
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', newUser.id);

        if (deleteError) {
            console.error('❌ Error:', deleteError);
        } else {
            console.log('✅ Success: User deleted');
        }
    }

    console.log('\n✅ All tests completed!');
}

testSupabase().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
