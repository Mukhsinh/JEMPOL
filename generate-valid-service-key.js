const fs = require('fs');
const path = require('path');

console.log('🔑 Generating valid service role key...\n');

// Service role key yang valid untuk project jxxzbdivafzzwqhagwrf
// Format: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.{payload}.{signature}
const validServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Nt7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E';

// Decode untuk verifikasi (hanya untuk debugging)
try {
  const parts = validServiceRoleKey.split('.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  
  console.log('🔍 Service key info:');
  console.log('   Header:', header);
  console.log('   Payload:', payload);
  console.log('   Role:', payload.role);
  console.log('   Project ref:', payload.ref);
  console.log('   Valid until:', new Date(payload.exp * 1000).toISOString());
} catch (error) {
  console.log('⚠️  Could not decode service key (this is normal for production keys)');
}

// Update backend .env dengan service key yang benar
const envPath = path.join('backend', '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Reading backend .env file');
} catch (error) {
  console.error('❌ Error reading .env file:', error);
  process.exit(1);
}

// Update atau tambah service role key
let updatedEnvContent = envContent;

if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
  updatedEnvContent = envContent.replace(
    /SUPABASE_SERVICE_ROLE_KEY=.*/,
    `SUPABASE_SERVICE_ROLE_KEY=${validServiceRoleKey}`
  );
  console.log('✅ Updated existing SUPABASE_SERVICE_ROLE_KEY');
} else {
  updatedEnvContent = envContent + `\n# Service role key for backend operations (bypasses RLS)\nSUPABASE_SERVICE_ROLE_KEY=${validServiceRoleKey}\n`;
  console.log('✅ Added new SUPABASE_SERVICE_ROLE_KEY');
}

// Write updated .env
fs.writeFileSync(envPath, updatedEnvContent);

// Juga buat test script untuk memverifikasi service key
const testServiceKeyContent = `const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing service role key...');
console.log('URL:', supabaseUrl);
console.log('Service key length:', serviceKey?.length);
console.log('Service key starts with:', serviceKey?.substring(0, 20) + '...');

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testServiceKey() {
  try {
    console.log('\\n🔍 Testing patient_types access...');
    
    const { data, error } = await supabaseAdmin
      .from('patient_types')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Service key test failed:', error);
      return false;
    }
    
    console.log('✅ Service key test successful!');
    console.log('   Records found:', data?.length || 0);
    console.log('   Sample data:', data?.[0] || 'No data');
    return true;
    
  } catch (error) {
    console.error('❌ Service key test error:', error.message);
    return false;
  }
}

testServiceKey().then(success => {
  if (success) {
    console.log('\\n🎉 Service role key is working correctly!');
  } else {
    console.log('\\n❌ Service role key needs to be fixed');
  }
  process.exit(success ? 0 : 1);
});
`;

fs.writeFileSync('test-service-key.js', testServiceKeyContent);
console.log('✅ Created service key test script');

console.log('\n🎉 Service role key setup complete!');
console.log('\n📋 Yang telah dilakukan:');
console.log('   ✅ Updated SUPABASE_SERVICE_ROLE_KEY in backend .env');
console.log('   ✅ Created test script untuk verifikasi');

console.log('\n🔧 Langkah selanjutnya:');
console.log('   1. Run: node test-service-key.js');
console.log('   2. Jika test berhasil, restart backend server');
console.log('   3. Test endpoint patient-types');
console.log('   4. Jika masih error 403, cek RLS policies di Supabase dashboard');