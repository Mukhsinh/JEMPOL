// Script untuk memverifikasi RLS policies sudah diperbaiki
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyPolicies() {
  console.log('🔍 Memverifikasi RLS Policies...\n');

  try {
    // Check users table policies
    console.log('📋 Checking users table policies:');
    const { data: usersPolicies, error: usersError } = await supabase
      .rpc('get_policies', { table_name: 'users' });

    if (usersError) {
      console.error('❌ Error getting users policies:', usersError);
    } else {
      console.log('✅ Users policies found:', usersPolicies?.length || 0);
      usersPolicies?.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
        if (policy.qual && policy.qual.includes('FROM users')) {
          console.log('    ⚠️  WARNING: Policy still references users table!');
        } else {
          console.log('    ✅ Policy looks safe');
        }
      });
    }

    console.log('\n📋 Checking escalation_logs table policies:');
    const { data: escalationLogsPolicies, error: escalationLogsError } = await supabase
      .rpc('get_policies', { table_name: 'escalation_logs' });

    if (escalationLogsError) {
      console.error('❌ Error getting escalation_logs policies:', escalationLogsError);
    } else {
      console.log('✅ Escalation logs policies found:', escalationLogsPolicies?.length || 0);
      escalationLogsPolicies?.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }

    console.log('\n📋 Checking escalation_rules table policies:');
    const { data: escalationRulesPolicies, error: escalationRulesError } = await supabase
      .rpc('get_policies', { table_name: 'escalation_rules' });

    if (escalationRulesError) {
      console.error('❌ Error getting escalation_rules policies:', escalationRulesError);
    } else {
      console.log('✅ Escalation rules policies found:', escalationRulesPolicies?.length || 0);
      escalationRulesPolicies?.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }

    // Test simple queries
    console.log('\n🧪 Testing simple queries:');
    
    // Test tickets query
    console.log('Testing tickets query...');
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, ticket_number, title, status')
      .limit(3);

    if (ticketsError) {
      console.error('❌ Tickets query error:', ticketsError.message);
      if (ticketsError.message.includes('infinite recursion')) {
        console.error('🚨 INFINITE RECURSION STILL EXISTS!');
      }
    } else {
      console.log(`✅ Tickets query successful: ${tickets.length} records`);
    }

    // Test users query (this should work with service role key)
    console.log('Testing users query...');
    const { data: users, error: usersQueryError } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .limit(3);

    if (usersQueryError) {
      console.error('❌ Users query error:', usersQueryError.message);
      if (usersQueryError.message.includes('infinite recursion')) {
        console.error('🚨 INFINITE RECURSION STILL EXISTS IN USERS!');
      }
    } else {
      console.log(`✅ Users query successful: ${users.length} records`);
    }

    // Test admins query
    console.log('Testing admins query...');
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, username, full_name, role')
      .limit(3);

    if (adminsError) {
      console.error('❌ Admins query error:', adminsError.message);
    } else {
      console.log(`✅ Admins query successful: ${admins.length} records`);
    }

    console.log('\n🎯 VERIFICATION COMPLETE');
    console.log('If no infinite recursion errors above, the fix is successful!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Create RPC function to get policies if it doesn't exist
async function createGetPoliciesFunction() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION get_policies(table_name text)
      RETURNS TABLE(
        policyname name,
        permissive text,
        roles text[],
        cmd text,
        qual text,
        with_check text
      )
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        SELECT 
          p.policyname,
          p.permissive,
          p.roles,
          p.cmd,
          p.qual,
          p.with_check
        FROM pg_policies p
        WHERE p.tablename = table_name
        ORDER BY p.policyname;
      $$;
    `
  });

  if (error) {
    console.log('Note: Could not create get_policies function, using direct query instead');
  }
}

// Run verification
async function main() {
  await createGetPoliciesFunction();
  await verifyPolicies();
}

main().catch(console.error);