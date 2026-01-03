// Test script untuk mendapatkan service role key yang benar
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Ini adalah service role key yang seharusnya benar berdasarkan pattern
// Ganti 'anon' dengan 'service_role' dan signature akan berbeda
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.YourActualServiceRoleKeyHere';

async function testKeys() {
    console.log('🔍 Testing Supabase keys...\n');
    
    // Test anon key
    console.log('1. Testing anon key...');
    const anonClient = createClient(supabaseUrl, anonKey);
    
    try {
        const { data, error } = await anonClient
            .from('patient_types')
            .select('count(*)')
            .single();
        
        if (error) {
            console.log('❌ Anon key error:', error.message);
        } else {
            console.log('✅ Anon key works');
        }
    } catch (err) {
        console.log('❌ Anon key error:', err.message);
    }
    
    // Test service role key (jika ada)
    console.log('\n2. Testing service role key...');
    
    // Decode JWT untuk melihat payload
    try {
        const payload = JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64').toString());
        console.log('Anon key payload:', {
            iss: payload.iss,
            ref: payload.ref,
            role: payload.role,
            iat: new Date(payload.iat * 1000).toISOString(),
            exp: new Date(payload.exp * 1000).toISOString()
        });
        
        // Generate service role key pattern
        const servicePayload = {
            ...payload,
            role: 'service_role'
        };
        
        console.log('\nService role payload should be:', {
            iss: servicePayload.iss,
            ref: servicePayload.ref,
            role: servicePayload.role,
            iat: new Date(servicePayload.iat * 1000).toISOString(),
            exp: new Date(servicePayload.exp * 1000).toISOString()
        });
        
        console.log('\n📝 Service role key pattern:');
        console.log('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                   Buffer.from(JSON.stringify(servicePayload)).toString('base64') + 
                   '.SIGNATURE_WILL_BE_DIFFERENT');
        
    } catch (err) {
        console.log('❌ Error decoding JWT:', err.message);
    }
    
    console.log('\n💡 Untuk mendapatkan service role key yang benar:');
    console.log('1. Buka Supabase Dashboard');
    console.log('2. Pilih project jxxzbdivafzzwqhagwrf');
    console.log('3. Pergi ke Settings > API');
    console.log('4. Copy "service_role" key');
    console.log('5. Update backend/.env dengan key tersebut');
}

testKeys().catch(console.error);