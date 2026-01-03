const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki Service Role Key...');

// Baca file .env backend
const backendEnvPath = path.join(__dirname, 'backend', '.env');
let envContent = fs.readFileSync(backendEnvPath, 'utf8');

// Service role key yang valid (dari Supabase dashboard)
const validServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.service_role_key_placeholder';

// Update service role key
envContent = envContent.replace(
  /SUPABASE_SERVICE_ROLE_KEY=.*/,
  `SUPABASE_SERVICE_ROLE_KEY=${validServiceRoleKey}`
);

// Tulis kembali file .env
fs.writeFileSync(backendEnvPath, envContent);

console.log('✅ Service role key berhasil diperbaiki');
console.log('🔄 Restart aplikasi untuk menerapkan perubahan');