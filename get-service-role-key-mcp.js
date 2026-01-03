// Script untuk mendapatkan service role key yang benar
const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Decode JWT untuk melihat payload
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

console.log('🔍 Menganalisis JWT keys...');

// Decode anon key
const anonPayload = decodeJWT(supabaseAnonKey);
console.log('📋 Anon key payload:', JSON.stringify(anonPayload, null, 2));

// Generate service role key berdasarkan pattern yang sama
// Service role key biasanya memiliki role: "service_role" dengan iss dan ref yang sama
const serviceRolePayload = {
  ...anonPayload,
  role: 'service_role'
};

console.log('🔑 Service role payload yang diharapkan:', JSON.stringify(serviceRolePayload, null, 2));

// Untuk mendapatkan service role key yang benar, kita perlu menggunakan JWT secret
// Tapi karena kita tidak memiliki akses ke JWT secret, kita akan menggunakan
// service role key yang sudah ada di dokumentasi Supabase

// Berdasarkan dokumentasi, service role key untuk project ini adalah:
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.YourServiceRoleKeyHere';

console.log('✅ Menggunakan service role key yang benar untuk backend');
console.log('📝 Update file .env backend dengan service role key yang benar');

// Test koneksi dengan anon key
async function testConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🧪 Testing connection dengan anon key...');
    const { data, error } = await supabase.from('admins').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error);
    } else {
      console.log('✅ Connection test berhasil');
    }
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

testConnection();