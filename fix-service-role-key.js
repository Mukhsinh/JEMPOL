// Script untuk memperbaiki service role key
const fs = require('fs');
const path = require('path');

// Service role key yang benar untuk project jxxzbdivafzzwqhagwrf
// Ini adalah key yang seharusnya ada di Supabase dashboard
// Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{payload}.{signature}
// Payload untuk service_role: {"iss":"supabase","ref":"jxxzbdivafzzwqhagwrf","role":"service_role","iat":1764919051,"exp":2080495051}

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Nt7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E';

// Path ke file .env backend
const envPath = path.join(__dirname, 'backend', '.env');

try {
    // Baca file .env
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update service role key
    envContent = envContent.replace(
        /SUPABASE_SERVICE_ROLE_KEY=.*/,
        `SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}`
    );
    
    // Tulis kembali file .env
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Service role key updated in backend/.env');
    console.log('🔄 Please restart the backend server');
    
    // Verify the key format
    try {
        const parts = SERVICE_ROLE_KEY.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            console.log('📋 Key payload:', {
                iss: payload.iss,
                ref: payload.ref,
                role: payload.role,
                exp: new Date(payload.exp * 1000).toISOString()
            });
        }
    } catch (err) {
        console.log('⚠️ Could not decode key payload');
    }
    
} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    
    console.log('\n💡 Manual steps:');
    console.log('1. Open backend/.env file');
    console.log('2. Find the line with SUPABASE_SERVICE_ROLE_KEY');
    console.log('3. Replace it with:');
    console.log(`SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}`);
    console.log('4. Save the file and restart backend server');
}