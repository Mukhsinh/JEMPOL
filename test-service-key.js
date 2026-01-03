const { createClient } = require('@supabase/supabase-js');
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
    console.log('\n🔍 Testing patient_types access...');
    
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
    console.log('\n🎉 Service role key is working correctly!');
  } else {
    console.log('\n❌ Service role key needs to be fixed');
  }
  process.exit(success ? 0 : 1);
});
