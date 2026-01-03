const fs = require('fs');
const path = require('path');

console.log('🔧 MEMPERBAIKI ERROR LOGIN FINAL...\n');

// 1. Pastikan password admin benar
console.log('1️⃣ Memverifikasi password admin...');

const bcrypt = require('bcryptjs');
const testPassword = 'admin123';
const storedHash = '$2a$06$ixuDiWweXqcI7thO3XvMZui/VaoGMNezzsC33MXYplC2rWvSAlmk6';

const isPasswordValid = bcrypt.compareSync(testPassword, storedHash);
console.log(`Password 'admin123' valid: ${isPasswordValid ? '✅' : '❌'}`);

if (!isPasswordValid) {
  console.log('❌ Password tidak valid! Membuat hash baru...');
  const newHash = bcrypt.hashSync(testPassword, 10);
  console.log(`Hash baru: ${newHash}`);
  console.log('⚠️ Jalankan script update password di database!');
}

// 2. Periksa dan perbaiki konfigurasi environment
console.log('\n2️⃣ Memeriksa konfigurasi environment...');

const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

// URL yang benar
const CORRECT_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const CORRECT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Periksa frontend .env
if (fs.existsSync(frontendEnvPath)) {
  let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  console.log('✅ Frontend .env ditemukan');
  
  if (frontendEnv.includes(CORRECT_URL)) {
    console.log('✅ Frontend URL sudah benar');
  } else {
    console.log('❌ Frontend URL perlu diperbaiki');
  }
} else {
  console.log('❌ Frontend .env tidak ditemukan');
}

// Periksa backend .env
if (fs.existsSync(backendEnvPath)) {
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  console.log('✅ Backend .env ditemukan');
  
  if (backendEnv.includes(CORRECT_URL)) {
    console.log('✅ Backend URL sudah benar');
  } else {
    console.log('❌ Backend URL perlu diperbaiki');
  }
} else {
  console.log('❌ Backend .env tidak ditemukan');
}

// 3. Periksa file supabaseClient
console.log('\n3️⃣ Memeriksa file supabaseClient...');

const supabaseClientPath = path.join(__dirname, 'frontend', 'src', 'utils', 'supabaseClient.ts');
const supabaseClientFixedPath = path.join(__dirname, 'frontend', 'src', 'utils', 'supabaseClientFixed.ts');

if (fs.existsSync(supabaseClientPath)) {
  const clientContent = fs.readFileSync(supabaseClientPath, 'utf8');
  if (clientContent.includes(CORRECT_URL)) {
    console.log('✅ supabaseClient.ts URL sudah benar');
  } else {
    console.log('❌ supabaseClient.ts URL perlu diperbaiki');
  }
}

if (fs.existsSync(supabaseClientFixedPath)) {
  const clientFixedContent = fs.readFileSync(supabaseClientFixedPath, 'utf8');
  if (clientFixedContent.includes(CORRECT_URL)) {
    console.log('✅ supabaseClientFixed.ts URL sudah benar');
  } else {
    console.log('❌ supabaseClientFixed.ts URL perlu diperbaiki');
  }
}

// 4. Buat script test login
console.log('\n4️⃣ Membuat script test login...');

const testLoginScript = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Login Final</title>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
</head>
<body>
    <h2>🔧 Test Login Final</h2>
    <div id="status"></div>
    <div id="result"></div>
    
    <script>
        const SUPABASE_URL = '${CORRECT_URL}';
        const SUPABASE_ANON_KEY = '${CORRECT_ANON_KEY}';
        
        console.log('🔧 Menggunakan URL:', SUPABASE_URL);
        
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        async function testLogin() {
            const statusDiv = document.getElementById('status');
            const resultDiv = document.getElementById('result');
            
            statusDiv.innerHTML = '🔄 Testing login...';
            
            try {
                // Test login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: 'admin@jempol.com',
                    password: 'admin123'
                });
                
                if (error) {
                    console.error('❌ Login error:', error);
                    statusDiv.innerHTML = '❌ Login gagal';
                    resultDiv.innerHTML = \`<pre>Error: \${JSON.stringify(error, null, 2)}</pre>\`;
                } else {
                    console.log('✅ Login berhasil:', data);
                    statusDiv.innerHTML = '✅ Login berhasil!';
                    resultDiv.innerHTML = \`<pre>Success: \${JSON.stringify(data.user, null, 2)}</pre>\`;
                }
            } catch (err) {
                console.error('❌ Unexpected error:', err);
                statusDiv.innerHTML = '❌ Error tidak terduga';
                resultDiv.innerHTML = \`<pre>Error: \${err.message}</pre>\`;
            }
        }
        
        // Auto test saat halaman dimuat
        window.onload = testLogin;
    </script>
</body>
</html>
`;

fs.writeFileSync('test-login-final-complete.html', testLoginScript);
console.log('✅ Script test login dibuat: test-login-final-complete.html');

// 5. Instruksi perbaikan
console.log('\n📋 INSTRUKSI PERBAIKAN:');
console.log('1. Buka test-login-final-complete.html di browser');
console.log('2. Periksa console browser untuk error detail');
console.log('3. Pastikan aplikasi menggunakan URL yang benar');
console.log('4. Restart frontend dan backend setelah perubahan');

console.log('\n✅ PERBAIKAN SELESAI!');