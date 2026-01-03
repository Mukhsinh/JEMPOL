/**
 * Script untuk memperbaiki RLS policies dan memastikan akses database
 * Mengatasi error 403 Forbidden dengan menambahkan policy yang tepat
 */

const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSPolicies() {
  console.log('🔒 Memperbaiki RLS policies untuk integrasi frontend-backend...');

  const policies = [
    // Units table policies
    {
      table: 'units',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to units" ON public.units;`,
        `CREATE POLICY "Allow authenticated full access to units" 
         ON public.units FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to units" ON public.units;`,
        `CREATE POLICY "Allow public read access to units" 
         ON public.units FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // Unit types table policies
    {
      table: 'unit_types',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to unit_types" ON public.unit_types;`,
        `CREATE POLICY "Allow authenticated full access to unit_types" 
         ON public.unit_types FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to unit_types" ON public.unit_types;`,
        `CREATE POLICY "Allow public read access to unit_types" 
         ON public.unit_types FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // Service categories table policies
    {
      table: 'service_categories',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to service_categories" ON public.service_categories;`,
        `CREATE POLICY "Allow authenticated full access to service_categories" 
         ON public.service_categories FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to service_categories" ON public.service_categories;`,
        `CREATE POLICY "Allow public read access to service_categories" 
         ON public.service_categories FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // Ticket types table policies
    {
      table: 'ticket_types',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to ticket_types" ON public.ticket_types;`,
        `CREATE POLICY "Allow authenticated full access to ticket_types" 
         ON public.ticket_types FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to ticket_types" ON public.ticket_types;`,
        `CREATE POLICY "Allow public read access to ticket_types" 
         ON public.ticket_types FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // Ticket statuses table policies
    {
      table: 'ticket_statuses',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to ticket_statuses" ON public.ticket_statuses;`,
        `CREATE POLICY "Allow authenticated full access to ticket_statuses" 
         ON public.ticket_statuses FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to ticket_statuses" ON public.ticket_statuses;`,
        `CREATE POLICY "Allow public read access to ticket_statuses" 
         ON public.ticket_statuses FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // Patient types table policies
    {
      table: 'patient_types',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to patient_types" ON public.patient_types;`,
        `CREATE POLICY "Allow authenticated full access to patient_types" 
         ON public.patient_types FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to patient_types" ON public.patient_types;`,
        `CREATE POLICY "Allow public read access to patient_types" 
         ON public.patient_types FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // Roles table policies
    {
      table: 'roles',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to roles" ON public.roles;`,
        `CREATE POLICY "Allow authenticated full access to roles" 
         ON public.roles FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to roles" ON public.roles;`,
        `CREATE POLICY "Allow public read access to roles" 
         ON public.roles FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // SLA settings table policies
    {
      table: 'sla_settings',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to sla_settings" ON public.sla_settings;`,
        `CREATE POLICY "Allow authenticated full access to sla_settings" 
         ON public.sla_settings FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to sla_settings" ON public.sla_settings;`,
        `CREATE POLICY "Allow public read access to sla_settings" 
         ON public.sla_settings FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // Response templates table policies
    {
      table: 'response_templates',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to response_templates" ON public.response_templates;`,
        `CREATE POLICY "Allow authenticated full access to response_templates" 
         ON public.response_templates FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to response_templates" ON public.response_templates;`,
        `CREATE POLICY "Allow public read access to response_templates" 
         ON public.response_templates FOR SELECT 
         TO public 
         USING (true);`
      ]
    },

    // AI trust settings table policies
    {
      table: 'ai_trust_settings',
      policies: [
        `DROP POLICY IF EXISTS "Allow authenticated full access to ai_trust_settings" ON public.ai_trust_settings;`,
        `CREATE POLICY "Allow authenticated full access to ai_trust_settings" 
         ON public.ai_trust_settings FOR ALL 
         TO authenticated 
         USING (true) 
         WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Allow public read access to ai_trust_settings" ON public.ai_trust_settings;`,
        `CREATE POLICY "Allow public read access to ai_trust_settings" 
         ON public.ai_trust_settings FOR SELECT 
         TO public 
         USING (true);`
      ]
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const { table, policies: tablePolicies } of policies) {
    console.log(`\n📋 Processing table: ${table}`);
    
    for (const policy of tablePolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        
        if (error) {
          console.warn(`⚠️ Warning for ${table}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Policy applied successfully for ${table}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error for ${table}:`, err.message);
        errorCount++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successful policies: ${successCount}`);
  console.log(`❌ Failed policies: ${errorCount}`);
  console.log(`📈 Success rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

  // Test database access after policy changes
  await testDatabaseAccess();
}

async function testDatabaseAccess() {
  console.log('\n🧪 Testing database access after policy changes...');

  const tests = [
    { table: 'units', description: 'Units table' },
    { table: 'unit_types', description: 'Unit types table' },
    { table: 'service_categories', description: 'Service categories table' },
    { table: 'roles', description: 'Roles table' },
    { table: 'sla_settings', description: 'SLA settings table' }
  ];

  for (const test of tests) {
    try {
      const { data, error } = await supabase
        .from(test.table)
        .select('id')
        .limit(1);

      if (error) {
        console.error(`❌ ${test.description}: ${error.message}`);
      } else {
        console.log(`✅ ${test.description}: Access OK (${data?.length || 0} records)`);
      }
    } catch (error) {
      console.error(`❌ ${test.description}: ${error.message}`);
    }
  }
}

// Create RPC function for public SLA settings access
async function createPublicRPCFunctions() {
  console.log('\n🔧 Creating public RPC functions...');

  const rpcFunctions = [
    {
      name: 'get_sla_settings_public',
      sql: `
        CREATE OR REPLACE FUNCTION get_sla_settings_public()
        RETURNS TABLE (
          id uuid,
          name varchar,
          unit_type_id uuid,
          service_category_id uuid,
          patient_type_id uuid,
          priority_level varchar,
          response_time_hours integer,
          resolution_time_hours integer,
          escalation_time_hours integer,
          business_hours_only boolean,
          is_active boolean,
          created_at timestamptz,
          updated_at timestamptz
        )
        LANGUAGE sql
        SECURITY DEFINER
        AS $$
          SELECT 
            s.id, s.name, s.unit_type_id, s.service_category_id, s.patient_type_id,
            s.priority_level, s.response_time_hours, s.resolution_time_hours,
            s.escalation_time_hours, s.business_hours_only, s.is_active,
            s.created_at, s.updated_at
          FROM sla_settings s
          WHERE s.is_active = true
          ORDER BY s.name;
        $$;
      `
    },
    {
      name: 'get_units_public',
      sql: `
        CREATE OR REPLACE FUNCTION get_units_public()
        RETURNS TABLE (
          id uuid,
          name varchar,
          code varchar,
          description text,
          contact_email varchar,
          contact_phone varchar,
          sla_hours integer,
          is_active boolean,
          parent_unit_id uuid,
          unit_type_id uuid,
          created_at timestamptz,
          updated_at timestamptz
        )
        LANGUAGE sql
        SECURITY DEFINER
        AS $$
          SELECT 
            u.id, u.name, u.code, u.description, u.contact_email, u.contact_phone,
            u.sla_hours, u.is_active, u.parent_unit_id, u.unit_type_id,
            u.created_at, u.updated_at
          FROM units u
          WHERE u.is_active = true
          ORDER BY u.name;
        $$;
      `
    }
  ];

  for (const func of rpcFunctions) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: func.sql });
      
      if (error) {
        console.warn(`⚠️ Warning creating ${func.name}:`, error.message);
      } else {
        console.log(`✅ RPC function ${func.name} created successfully`);
      }
    } catch (err) {
      console.error(`❌ Error creating ${func.name}:`, err.message);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting RLS policies fix...');
    
    await fixRLSPolicies();
    await createPublicRPCFunctions();
    
    console.log('\n🎉 RLS policies fix completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Test the frontend pages');
    console.log('3. Check browser console for any remaining errors');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixRLSPolicies, testDatabaseAccess };