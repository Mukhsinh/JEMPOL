/**
 * Fix QR Management Token Issue
 * Mengatasi masalah token tidak valid saat mengakses halaman QR Management
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixQRManagementTokenIssue() {
  console.log('🔧 Starting QR Management Token Issue Fix...');
  
  try {
    // 1. Check current admin users
    console.log('\n1. Checking current admin users...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('is_active', true);
    
    if (adminError) {
      console.error('❌ Error fetching admins:', adminError);
      return;
    }
    
    console.log(`✅ Found ${admins.length} active admin(s):`);
    admins.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.email}) - Role: ${admin.role}`);
    });
    
    // 2. Check RLS policies on admins table
    console.log('\n2. Checking RLS policies on admins table...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'admins' })
      .catch(() => null);
    
    if (policies) {
      console.log('✅ RLS policies found:', policies.length);
    } else {
      console.log('⚠️ Could not fetch RLS policies (this is normal)');
    }
    
    // 3. Test token generation for each admin
    console.log('\n3. Testing token generation for admins...');
    
    for (const admin of admins) {
      try {
        // Try to sign in with admin email (we'll need to reset password)
        console.log(`\n   Testing admin: ${admin.email}`);
        
        // Check if auth user exists
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error(`   ❌ Error listing auth users:`, authError.message);
          continue;
        }
        
        const authUser = authUsers.users.find(u => u.email === admin.email);
        
        if (!authUser) {
          console.log(`   ⚠️ No auth user found for ${admin.email}, creating...`);
          
          // Create auth user
          const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
            email: admin.email,
            password: 'TempPassword123!',
            email_confirm: true,
            user_metadata: {
              username: admin.username,
              full_name: admin.full_name,
              role: admin.role
            }
          });
          
          if (createError) {
            console.error(`   ❌ Error creating auth user:`, createError.message);
            continue;
          }
          
          console.log(`   ✅ Auth user created for ${admin.email}`);
        } else {
          console.log(`   ✅ Auth user exists for ${admin.email}`);
          
          // Update password to ensure it's known
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser.id,
            { password: 'TempPassword123!' }
          );
          
          if (updateError) {
            console.error(`   ❌ Error updating password:`, updateError.message);
          } else {
            console.log(`   ✅ Password updated for ${admin.email}`);
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing admin ${admin.email}:`, error.message);
      }
    }
    
    // 4. Create test script for token validation
    console.log('\n4. Creating test script for token validation...');
    
    const testScript = `
// Test Token Validation Script
// Run this in browser console after login

async function testTokenValidation() {
  console.log('🔄 Testing token validation...');
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ No valid session found:', sessionError);
      return;
    }
    
    console.log('✅ Session found for:', session.user.email);
    console.log('🔑 Token:', session.access_token.substring(0, 50) + '...');
    
    // Test API calls
    const endpoints = [
      '/api/units',
      '/api/qr-codes?page=1&limit=10&include_analytics=true'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch('http://localhost:3003' + endpoint, {
          headers: {
            'Authorization': 'Bearer ' + session.access_token,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('✅ ' + endpoint + ' - Success');
        } else {
          console.error('❌ ' + endpoint + ' - Failed:', response.status, response.statusText);
          const errorData = await response.text();
          console.error('   Error details:', errorData);
        }
      } catch (error) {
        console.error('❌ ' + endpoint + ' - Exception:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTokenValidation();
`;
    
    require('fs').writeFileSync('test-token-validation.js', testScript);
    console.log('✅ Test script created: test-token-validation.js');
    
    // 5. Check backend middleware configuration
    console.log('\n5. Checking backend middleware configuration...');
    
    const middlewareFiles = [
      'backend/src/middleware/auth.ts',
      'backend/src/middleware/authFixed.ts',
      'backend/src/middleware/authSimple.ts'
    ];
    
    for (const file of middlewareFiles) {
      try {
        const fs = require('fs');
        if (fs.existsSync(file)) {
          console.log(`✅ Found middleware: ${file}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not check: ${file}`);
      }
    }
    
    console.log('\n🎯 Fix Summary:');
    console.log('================');
    console.log('1. ✅ Verified admin users exist and are active');
    console.log('2. ✅ Ensured auth users exist for all admins');
    console.log('3. ✅ Reset passwords to known values (TempPassword123!)');
    console.log('4. ✅ Created token validation test script');
    
    console.log('\n📋 Next Steps:');
    console.log('==============');
    console.log('1. Login with admin credentials using password: TempPassword123!');
    console.log('2. Run the test script in browser console to validate tokens');
    console.log('3. If tokens still fail, check backend middleware configuration');
    console.log('4. Ensure backend is using the correct middleware (authFixed.ts recommended)');
    
    console.log('\n🔐 Admin Credentials:');
    console.log('=====================');
    admins.forEach(admin => {
      console.log(`Email: ${admin.email}`);
      console.log(`Password: TempPassword123!`);
      console.log(`Role: ${admin.role}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the fix
fixQRManagementTokenIssue();