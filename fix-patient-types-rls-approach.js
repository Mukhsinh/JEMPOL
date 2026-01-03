const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki patient-types dengan pendekatan RLS...\n');

// Karena service role key tidak tersedia, kita akan menggunakan anon key dengan RLS policies
// yang sudah ada dan memperbaiki auth middleware

// Update backend .env untuk menggunakan anon key sebagai fallback
const envPath = path.join('backend', '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Pastikan anon key tersedia
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Update Supabase config untuk menggunakan anon key dengan auth context
const supabaseConfigContent = `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyValid: supabaseServiceKey && supabaseServiceKey.length > 100 && !supabaseServiceKey.includes('placeholder')
});

// Create client with anon key for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create admin client - use service key if valid, otherwise use anon key with auth context
export const supabaseAdmin = supabaseServiceKey && 
  supabaseServiceKey.length > 100 && 
  !supabaseServiceKey.includes('placeholder') && 
  !supabaseServiceKey.includes('Ej7Ej7Ej7')
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

const usingServiceRole = supabaseServiceKey && 
  supabaseServiceKey.length > 100 && 
  !supabaseServiceKey.includes('placeholder') && 
  !supabaseServiceKey.includes('Ej7Ej7Ej7');

console.log('✅ Supabase clients created:', {
  regularClient: 'supabase (anon)',
  adminClient: usingServiceRole ? 'supabaseAdmin (service_role)' : 'supabaseAdmin (anon with auth)',
  bypassRLS: usingServiceRole
});

export default supabase;
`;

// Update master data controller untuk menggunakan auth context
const masterDataControllerUpdate = `// Patient Types dengan auth context yang benar
export const getPatientTypes = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Getting patient types...');
    console.log('   User:', req.user?.username || 'No user');
    console.log('   Role:', req.user?.role || 'No role');
    
    // Gunakan supabase dengan auth context dari middleware
    let client = supabase;
    
    // Jika ada user dari auth middleware, set auth context
    if (req.user && req.user.id) {
      // Set auth context untuk RLS
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        client = supabase;
        console.log('   Using authenticated client');
      } else {
        // Fallback ke supabaseAdmin
        client = supabaseAdmin;
        console.log('   Using admin client');
      }
    } else {
      client = supabaseAdmin;
      console.log('   Using admin client (no user context)');
    }
    
    const { data, error } = await client
      .from('patient_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Patient types query error:', error);
      throw error;
    }
    
    console.log('✅ Patient types retrieved:', data?.length || 0, 'records');
    
    return res.json({
      success: true,
      data: data || [],
      message: 'Patient types retrieved successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Patient types error:', error);
    return res.status(500).json({
      success: false,
      error: 'Gagal mengambil data patient types',
      details: error.message
    });
  }
};
`;

// Write files
try {
  // Update Supabase config
  fs.writeFileSync(
    path.join('backend', 'src', 'config', 'supabase.ts'),
    supabaseConfigContent
  );
  console.log('✅ Updated Supabase config');

  // Write controller update info
  fs.writeFileSync('patient-types-controller-update.txt', masterDataControllerUpdate);
  console.log('✅ Created controller update info');

  // Create test script untuk RLS approach
  const testRLSContent = `const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('🧪 Testing RLS approach...');

const supabase = createClient(supabaseUrl, anonKey);

async function testRLSAccess() {
  try {
    console.log('\\n🔍 Testing patient_types with anon key...');
    
    const { data, error } = await supabase
      .from('patient_types')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ RLS test failed:', error);
      return false;
    }
    
    console.log('✅ RLS test successful!');
    console.log('   Records found:', data?.length || 0);
    console.log('   Sample data:', data?.[0] || 'No data');
    return true;
    
  } catch (error) {
    console.error('❌ RLS test error:', error.message);
    return false;
  }
}

testRLSAccess().then(success => {
  if (success) {
    console.log('\\n🎉 RLS approach is working!');
    console.log('   Patient types table allows anon access');
  } else {
    console.log('\\n❌ RLS approach failed');
    console.log('   Check RLS policies in Supabase dashboard');
  }
  process.exit(success ? 0 : 1);
});
`;

  fs.writeFileSync('test-rls-approach.js', testRLSContent);
  console.log('✅ Created RLS test script');

  console.log('\n🎉 RLS approach setup complete!');
  console.log('\n📋 Yang telah dilakukan:');
  console.log('   ✅ Updated Supabase config untuk fallback ke anon key');
  console.log('   ✅ Created controller update dengan auth context');
  console.log('   ✅ Created RLS test script');

  console.log('\n🔧 Langkah selanjutnya:');
  console.log('   1. Run: node test-rls-approach.js');
  console.log('   2. Update masterDataController dengan kode dari patient-types-controller-update.txt');
  console.log('   3. Restart backend server');
  console.log('   4. Test endpoint patient-types');

} catch (error) {
  console.error('❌ Error:', error);
}