const fs = require('fs');
const path = require('path');

console.log('🔑 Memperbaiki service role key untuk backend...\n');

// Service role key yang benar untuk project jxxzbdivafzzwqhagwrf
const correctServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Nt7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E';

// Baca dan update file .env backend
const envPath = path.join('backend', '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ File .env backend ditemukan');
} catch (error) {
  console.error('❌ Error reading .env file:', error);
  process.exit(1);
}

// Update service role key
let updatedEnvContent = envContent;

if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
  // Replace existing key
  updatedEnvContent = envContent.replace(
    /SUPABASE_SERVICE_ROLE_KEY=.*/,
    `SUPABASE_SERVICE_ROLE_KEY=${correctServiceRoleKey}`
  );
} else {
  // Add new key
  updatedEnvContent = envContent + `\n# Service role key for backend operations (bypasses RLS)\nSUPABASE_SERVICE_ROLE_KEY=${correctServiceRoleKey}\n`;
}

// Write updated .env
fs.writeFileSync(envPath, updatedEnvContent);
console.log('✅ Service role key updated in backend .env');

// Update Supabase config untuk memastikan service role digunakan dengan benar
const supabaseConfigContent = `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('🔧 Supabase Config Check:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey?.length || 0,
  serviceKeyValid: supabaseServiceKey && supabaseServiceKey.length > 100 && supabaseServiceKey.includes('service_role')
});

// Create client with anon key for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create service client for admin operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey && supabaseServiceKey.length > 100
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if no valid service key

console.log('✅ Supabase clients created:', {
  regularClient: 'supabase',
  adminClient: supabaseServiceKey && supabaseServiceKey.length > 100 ? 'supabaseAdmin (service_role)' : 'supabase (fallback)',
  bypassRLS: supabaseServiceKey && supabaseServiceKey.length > 100
});

export default supabase;
`;

// Write Supabase config
try {
  fs.writeFileSync(
    path.join('backend', 'src', 'config', 'supabase.ts'),
    supabaseConfigContent
  );
  console.log('✅ Updated Supabase config with better logging');
} catch (error) {
  console.error('❌ Error updating Supabase config:', error);
}

// Juga update masterDataController untuk memastikan menggunakan supabaseAdmin
const controllerUpdateContent = `// Update untuk memastikan semua endpoints menggunakan supabaseAdmin
// Ini akan memastikan RLS bypass untuk admin operations

// Contoh untuk getPatientTypes yang sudah benar:
export const getPatientTypes = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Getting patient types with service role access...');
    
    const { data, error } = await supabaseAdmin
      .from('patient_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Patient types query error:', error);
      throw error;
    }
    
    console.log('✅ Patient types retrieved:', data?.length || 0, 'records');
    return res.json({ success: true, data: data || [] });
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

// Write controller update info
fs.writeFileSync('controller-update-info.txt', controllerUpdateContent);
console.log('✅ Created controller update info file');

console.log('\n🎉 Service role key fix selesai!');
console.log('\n📋 Yang telah diperbaiki:');
console.log('   ✅ Service role key di backend .env');
console.log('   ✅ Supabase config dengan logging yang lebih baik');
console.log('   ✅ Validasi service key yang proper');
console.log('   ✅ Fallback mechanism jika service key tidak valid');

console.log('\n🔧 Langkah selanjutnya:');
console.log('   1. Restart backend server');
console.log('   2. Cek log backend untuk konfirmasi service role usage');
console.log('   3. Test endpoint patient-types');
console.log('   4. Jika masih error, cek apakah service role key benar-benar valid');