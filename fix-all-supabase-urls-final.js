const fs = require('fs');
const path = require('path');

// URL yang benar
const CORRECT_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const CORRECT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// URL yang salah
const WRONG_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const WRONG_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// File-file yang perlu diperbaiki
const filesToFix = [
    'test-loading-fix.html',
    'test-supabase-connection-fix.html',
    'diagnose-loading-issue.js',
    'create-admin-loading-fix.js'
];

function fixFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ File tidak ditemukan: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Replace URL
        if (content.includes(WRONG_URL)) {
            content = content.replace(new RegExp(WRONG_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), CORRECT_URL);
            changed = true;
            console.log(`✅ URL diperbaiki di: ${filePath}`);
        }

        // Replace key
        if (content.includes(WRONG_KEY)) {
            content = content.replace(new RegExp(WRONG_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), CORRECT_KEY);
            changed = true;
            console.log(`✅ Key diperbaiki di: ${filePath}`);
        }

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`💾 File disimpan: ${filePath}`);
            return true;
        } else {
            console.log(`ℹ️ Tidak ada perubahan di: ${filePath}`);
            return false;
        }

    } catch (error) {
        console.error(`❌ Error memperbaiki ${filePath}:`, error.message);
        return false;
    }
}

async function fixAllFiles() {
    console.log('🔧 Memperbaiki semua referensi URL Supabase...');
    console.log(`📋 URL yang benar: ${CORRECT_URL}`);
    console.log(`❌ URL yang salah: ${WRONG_URL}`);
    console.log('');

    let totalFixed = 0;

    for (const file of filesToFix) {
        if (fixFile(file)) {
            totalFixed++;
        }
    }

    console.log('');
    console.log(`✅ Selesai! ${totalFixed} file berhasil diperbaiki`);
    
    // Buat file test login baru dengan konfigurasi yang benar
    console.log('🔧 Membuat file test login dengan konfigurasi yang benar...');
    
    const testLoginContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Login - Konfigurasi Fixed</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        button { background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background-color: #0056b3; }
        input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ced4da; border-radius: 4px; box-sizing: border-box; }
        #output { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 Test Login - Konfigurasi Fixed</h1>
        
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>✅ Konfigurasi yang Benar:</h3>
            <p><strong>URL:</strong> ${CORRECT_URL}</p>
            <p><strong>Email:</strong> admin@jempol.com</p>
            <p><strong>Password:</strong> admin123</p>
        </div>

        <div>
            <input type="email" id="email" placeholder="Email" value="admin@jempol.com">
            <input type="password" id="password" placeholder="Password" value="admin123">
            <button onclick="testLogin()">🔑 Test Login</button>
            <button onclick="clearCache()">🧹 Clear Cache</button>
        </div>

        <div style="margin-top: 20px;">
            <h3>📊 Output:</h3>
            <div id="output"></div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
        const output = document.getElementById('output');
        
        function log(message) {
            const timestamp = new Date().toLocaleTimeString();
            output.textContent += \`[\${timestamp}] \${message}\\n\`;
            output.scrollTop = output.scrollHeight;
            console.log(message);
        }

        function clearCache() {
            localStorage.clear();
            sessionStorage.clear();
            log('✅ Cache dibersihkan');
        }

        async function testLogin() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            log('🔑 Mencoba login dengan: ' + email);
            log('🌐 URL yang digunakan: ${CORRECT_URL}');
            
            try {
                const supabase = window.supabase.createClient('${CORRECT_URL}', '${CORRECT_KEY}');
                
                // Clear session
                await supabase.auth.signOut();
                log('🧹 Session lama dibersihkan');
                
                // Test login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) {
                    log('❌ Login gagal: ' + error.message);
                    log('🔍 Error details: ' + JSON.stringify(error, null, 2));
                } else {
                    log('✅ Login berhasil!');
                    log('👤 User: ' + data.user?.email);
                    log('🔑 Session: ' + (data.session ? 'Ada' : 'Tidak ada'));
                    
                    // Test admin profile
                    const { data: adminData, error: adminError } = await supabase
                        .from('admins')
                        .select('*')
                        .eq('email', email)
                        .single();
                    
                    if (adminError) {
                        log('⚠️ Error mengambil profil admin: ' + adminError.message);
                    } else {
                        log('✅ Profil admin ditemukan: ' + adminData.username);
                        log('👑 Role: ' + adminData.role);
                    }
                    
                    await supabase.auth.signOut();
                    log('👋 Signed out setelah test');
                }
                
            } catch (error) {
                log('❌ Error: ' + error.message);
            }
        }

        log('🚀 Test login siap - konfigurasi sudah diperbaiki');
    </script>
</body>
</html>`;

    fs.writeFileSync('test-login-fixed-final.html', testLoginContent, 'utf8');
    console.log('✅ File test-login-fixed-final.html berhasil dibuat');

    console.log('');
    console.log('📋 LANGKAH SELANJUTNYA:');
    console.log('1. Buka test-login-fixed-final.html di browser');
    console.log('2. Klik "Clear Cache" untuk membersihkan cache browser');
    console.log('3. Klik "Test Login" untuk test login');
    console.log('4. Jika berhasil, restart aplikasi dengan RESTART_LOGIN_FIXED_FINAL.bat');
}

fixAllFiles();