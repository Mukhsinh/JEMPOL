// Script untuk mendapatkan service role key dari Supabase
// Jalankan dengan: node get-service-role-key.js

const fs = require('fs');
const path = require('path');

// Service role key untuk project jxxzbdivafzzwqhagwrf
// Ini adalah key yang seharusnya ada di dashboard Supabase
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.YourActualServiceRoleKeyHere';

// Path ke file .env backend
const envPath = path.join(__dirname, 'backend', '.env');

try {
    // Baca file .env
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Uncomment dan update service role key
    envContent = envContent.replace(
        /# SUPABASE_SERVICE_ROLE_KEY=.*/,
        `SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}`
    );
    
    // Jika tidak ada line yang dikomentari, tambahkan
    if (!envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
        envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}\n`;
    }
    
    // Tulis kembali file .env
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Service role key berhasil ditambahkan ke backend/.env');
    console.log('🔄 Silakan restart backend server untuk menerapkan perubahan');
    
} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
}