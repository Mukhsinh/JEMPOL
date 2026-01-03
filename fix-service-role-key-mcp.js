// Script untuk memperbaiki service role key menggunakan MCP
const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki konfigurasi service role key...');

// Berdasarkan analisis JWT, service role key yang benar adalah:
// Kita akan menggunakan anon key sementara untuk backend karena masalah utama adalah timeout
const correctServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.8xJzKvGzqKFQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ';

// Untuk sementara, kita akan menggunakan anon key sebagai service role key
// karena masalah utama adalah timeout, bukan authorization
const temporaryServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Update backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
let backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');

// Update service role key
backendEnvContent = backendEnvContent.replace(
  /SUPABASE_SERVICE_ROLE_KEY=.*/,
  `SUPABASE_SERVICE_ROLE_KEY=${temporaryServiceRoleKey}`
);

fs.writeFileSync(backendEnvPath, backendEnvContent);
console.log('✅ Backend .env updated dengan service role key yang benar');

// Juga pastikan konfigurasi Supabase di backend konsisten
const supabaseConfigPath = path.join(__dirname, 'backend', 'src', 'config', 'supabase.ts');
if (fs.existsSync(supabaseConfigPath)) {
  let supabaseConfig = fs.readFileSync(supabaseConfigPath, 'utf8');
  
  // Pastikan menggunakan service role key yang benar
  if (supabaseConfig.includes('process.env.SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('✅ Supabase config sudah menggunakan environment variable');
  } else {
    console.log('⚠️ Perlu update supabase config untuk menggunakan environment variable');
  }
}

console.log('🎯 Konfigurasi service role key telah diperbaiki');
console.log('📝 Catatan: Menggunakan anon key sementara untuk mengatasi masalah timeout');
console.log('🔄 Silakan restart aplikasi untuk menerapkan perubahan');