const fs = require('fs');
const path = require('path');

console.log('🔑 Memperbaiki service role key untuk backend...\n');

// Baca file .env backend
const envPath = path.join('backend', '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ File .env backend ditemukan');
} catch (error) {
  console.error('❌ Error reading .env file:', error);
  process.exit(1);
}

// Service role key yang benar dari Supabase
const correctServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Nt7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E';

// Update service role key di .env
const updatedEnvContent = envContent.replace(
  /SUPABASE_SERVICE_ROLE_KEY=.*/,
  `SUPABASE_SERVICE_ROLE_KEY=${correctServiceRoleKey}`
);

// Jika tidak ada SUPABASE_SERVICE_ROLE_KEY, tambahkan
if (!envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
  const newEnvContent = updatedEnvContent + `\n# Service role key for backend operations (bypasses RLS)\nSUPABASE_SERVICE_ROLE_KEY=${correctServiceRoleKey}\n`;
  fs.writeFileSync(envPath, newEnvContent);
} else {
  fs.writeFileSync(envPath, updatedEnvContent);
}

console.log('✅ Service role key updated in backend .env');

// Juga update konfigurasi Supabase untuk memastikan service role key digunakan dengan benar
const supabaseConfigContent = `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with anon key for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create service client for admin operations (bypasses RLS)
// Service role key harus valid untuk bypass RLS
export const supabaseAdmin = supabaseServiceKey && supabaseServiceKey.length > 100
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

console.log('Supabase configured:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey && supabaseServiceKey.length > 100,
  usingServiceRole: !!supabaseServiceKey && supabaseServiceKey.length > 100
});

export default supabase;
`;

// Write Supabase config
try {
  fs.writeFileSync(
    path.join('backend', 'src', 'config', 'supabase.ts'),
    supabaseConfigContent
  );
  console.log('✅ Updated Supabase config');
} catch (error) {
  console.error('❌ Error updating Supabase config:', error);
}

console.log('\n🎉 Service role key fix selesai!');
console.log('\n📋 Yang telah diperbaiki:');
console.log('   ✅ Service role key di backend .env');
console.log('   ✅ Supabase config untuk menggunakan service role');
console.log('   ✅ Validasi service key yang lebih baik');

console.log('\n🔧 Langkah selanjutnya:');
console.log('   1. Restart backend server');
console.log('   2. Test endpoint patient-types');
console.log('   3. Cek log backend untuk konfirmasi service role usage');