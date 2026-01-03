const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ixqhqfqxqxqxqxqx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWhxZnF4cXhxeHF4cXgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTI5NzE0LCJleHAiOjIwNTExMDU3MTR9.example';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixQRManagementAuth() {
  console.log('🔧 Fixing QR Management 403 Authentication Error...');
  
  try {
    // 1. Check current RLS policies for qr_codes table
    console.log('📋 Checking current RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'qr_codes' })
      .catch(() => ({ data: null, error: null }));
    
    if (policies) {
      console.log('Current policies:', policies);
    }

    // 2. Update RLS policies to ensure proper authentication
    console.log('🔐 Updating RLS policies for qr_codes table...');
    
    // Drop existing policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow authenticated users to read qr_codes" ON qr_codes;
        DROP POLICY IF EXISTS "Allow authenticated users to manage qr_codes" ON qr_codes;
        DROP POLICY IF EXISTS "Allow public read access to qr_codes" ON qr_codes;
      `
    }).catch(console.warn);

    // Create new comprehensive policies
    const policySQL = `
      -- Allow authenticated users (admins) full access to qr_codes
      CREATE POLICY "Admin full access to qr_codes" ON qr_codes
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.email = auth.jwt() ->> 'email' 
            AND admins.is_active = true
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.email = auth.jwt() ->> 'email' 
            AND admins.is_active = true
          )
        );

      -- Allow public read access for QR code scanning
      CREATE POLICY "Public read access for QR scanning" ON qr_codes
        FOR SELECT
        TO public
        USING (is_active = true);
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', { sql: policySQL });
    if (policyError) {
      console.error('❌ Policy creation error:', policyError);
    } else {
      console.log('✅ RLS policies updated successfully');
    }

    // 3. Verify admin users exist and are properly configured
    console.log('👤 Verifying admin users...');
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, username, email, role, is_active')
      .eq('is_active', true);

    if (adminsError) {
      console.error('❌ Error fetching admins:', adminsError);
    } else {
      console.log('✅ Active admins found:', admins.length);
      admins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.role})`);
      });
    }

    // 4. Test QR codes access with service role
    console.log('🧪 Testing QR codes access...');
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, name, code, is_active')
      .limit(3);

    if (qrError) {
      console.error('❌ Error accessing QR codes:', qrError);
    } else {
      console.log('✅ QR codes accessible:', qrCodes.length, 'records');
    }

    console.log('✅ QR Management authentication fix completed!');
    
  } catch (error) {
    console.error('❌ Error in fixQRManagementAuth:', error);
  }
}

// Run the fix
fixQRManagementAuth();
/
/ Additional function to create proper RLS policies
async function createProperRLSPolicies() {
  console.log('🔐 Creating proper RLS policies...');
  
  const policies = [
    {
      name: 'qr_codes_admin_policy',
      sql: `
        CREATE POLICY "qr_codes_admin_policy" ON qr_codes
        FOR ALL TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id::text = auth.uid()::text 
            AND admins.is_active = true
          )
          OR
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.email = auth.jwt() ->> 'email' 
            AND admins.is_active = true
          )
        );
      `
    },
    {
      name: 'qr_codes_public_read',
      sql: `
        CREATE POLICY "qr_codes_public_read" ON qr_codes
        FOR SELECT TO public
        USING (is_active = true);
      `
    }
  ];

  for (const policy of policies) {
    try {
      await supabase.rpc('exec_sql', { sql: `DROP POLICY IF EXISTS "${policy.name}" ON qr_codes;` });
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        console.error(`❌ Error creating policy ${policy.name}:`, error);
      } else {
        console.log(`✅ Policy ${policy.name} created successfully`);
      }
    } catch (err) {
      console.error(`❌ Exception creating policy ${policy.name}:`, err);
    }
  }
}

// Run additional fixes
createProperRLSPolicies();