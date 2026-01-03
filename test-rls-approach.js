const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('🧪 Testing RLS approach...');

const supabase = createClient(supabaseUrl, anonKey);

async function testRLSAccess() {
  try {
    console.log('\n🔍 Testing patient_types with anon key...');
    
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
    console.log('\n🎉 RLS approach is working!');
    console.log('   Patient types table allows anon access');
  } else {
    console.log('\n❌ RLS approach failed');
    console.log('   Check RLS policies in Supabase dashboard');
  }
  process.exit(success ? 0 : 1);
});
