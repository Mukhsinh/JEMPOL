/**
 * PERBAIKAN KOMPREHENSIF ERROR SUBMIT TIKET DI VERCEL
 * 
 * Masalah yang ditemukan:
 * 1. Error 405 (Method Not Allowed) pada endpoint /api/public/internal-tickets
 * 2. Server mengembalikan HTML instead of JSON (non-JSON response)
 * 3. Error loading app settings - response tidak valid
 * 
 * Penyebab:
 * - Vercel serverless function tidak ter-deploy dengan benar
 * - Environment variables mungkin tidak ter-set
 * - CORS headers tidak lengkap
 * - Error handling tidak mengembalikan JSON yang valid
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 MEMULAI PERBAIKAN ERROR SUBMIT TIKET VERCEL...\n');

// 1. Verifikasi struktur folder API
console.log('📁 Step 1: Verifikasi struktur folder API...');
const apiFolder = path.join(__dirname, 'api', 'public');
if (!fs.existsSync(apiFolder)) {
  console.error('❌ Folder api/public tidak ditemukan!');
  process.exit(1);
}

const requiredFiles = [
  'internal-tickets.ts',
  'external-tickets.ts',
  'app-settings.ts',
  'units.ts',
  'surveys.ts'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(apiFolder, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    console.error(`❌ File ${file} tidak ditemukan!`);
  } else {
    console.log(`✅ File ${file} ditemukan`);
  }
});

if (missingFiles.length > 0) {
  console.error('\n❌ Ada file yang hilang. Deploy mungkin gagal.');
} else {
  console.log('✅ Semua file API tersedia\n');
}

// 2. Verifikasi vercel.json
console.log('📄 Step 2: Verifikasi vercel.json...');
const vercelJsonPath = path.join(__dirname, 'vercel.json');
if (!fs.existsSync(vercelJsonPath)) {
  console.error('❌ vercel.json tidak ditemukan!');
  process.exit(1);
}

const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
console.log('✅ vercel.json ditemukan');
console.log('   - Build command:', vercelJson.buildCommand);
console.log('   - Output directory:', vercelJson.outputDirectory);
console.log('   - Install command:', vercelJson.installCommand);

// 3. Cek environment variables yang diperlukan
console.log('\n🔐 Step 3: Environment variables yang diperlukan:');
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_ROLE_KEY'
];

console.log('\nPastikan environment variables berikut sudah di-set di Vercel Dashboard:');
requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}`);
});

// 4. Buat file test untuk verifikasi endpoint
console.log('\n🧪 Step 4: Membuat file test endpoint...');
const testEndpointContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Submit Tiket Vercel</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 30px;
    }
    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    button {
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      margin-right: 10px;
    }
    button:hover {
      background: #45a049;
    }
    button.secondary {
      background: #2196F3;
    }
    button.secondary:hover {
      background: #0b7dda;
    }
    .result {
      margin-top: 20px;
      padding: 15px;
      border-radius: 5px;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 12px;
    }
    .success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
    .error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
    .info {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Test Submit Tiket Vercel</h1>
    
    <div class="test-section">
      <h3>1. Test Endpoint Internal Tickets</h3>
      <button onclick="testInternalTickets()">Test POST Internal Ticket</button>
      <button class="secondary" onclick="testOptionsInternal()">Test OPTIONS</button>
      <div id="result-internal" class="result" style="display:none;"></div>
    </div>

    <div class="test-section">
      <h3>2. Test Endpoint External Tickets</h3>
      <button onclick="testExternalTickets()">Test POST External Ticket</button>
      <button class="secondary" onclick="testOptionsExternal()">Test OPTIONS</button>
      <div id="result-external" class="result" style="display:none;"></div>
    </div>

    <div class="test-section">
      <h3>3. Test Endpoint App Settings</h3>
      <button onclick="testAppSettings()">Test GET App Settings</button>
      <div id="result-settings" class="result" style="display:none;"></div>
    </div>

    <div class="test-section">
      <h3>4. Test Endpoint Units</h3>
      <button onclick="testUnits()">Test GET Units</button>
      <div id="result-units" class="result" style="display:none;"></div>
    </div>
  </div>

  <script>
    const API_BASE = window.location.origin + '/api';
    
    function showResult(elementId, data, isError = false) {
      const element = document.getElementById(elementId);
      element.style.display = 'block';
      element.className = 'result ' + (isError ? 'error' : 'success');
      element.textContent = JSON.stringify(data, null, 2);
    }

    async function testOptionsInternal() {
      const resultId = 'result-internal';
      try {
        const response = await fetch(API_BASE + '/public/internal-tickets', {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        showResult(resultId, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: data
        });
      } catch (error) {
        showResult(resultId, {
          error: error.message,
          stack: error.stack
        }, true);
      }
    }

    async function testInternalTickets() {
      const resultId = 'result-internal';
      try {
        const testData = {
          reporter_name: 'Test User',
          reporter_email: 'test@example.com',
          reporter_phone: '081234567890',
          reporter_department: 'IT',
          reporter_position: 'Staff',
          category: 'it_support',
          priority: 'medium',
          title: 'Test Tiket Internal dari Vercel',
          description: 'Ini adalah test tiket untuk verifikasi endpoint berfungsi',
          unit_id: 'UNIT_ID_DISINI', // Ganti dengan unit_id yang valid
          source: 'web'
        };

        console.log('📤 Sending request to:', API_BASE + '/public/internal-tickets');
        console.log('📤 Data:', testData);

        const response = await fetch(API_BASE + '/public/internal-tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error('Response bukan JSON: ' + text.substring(0, 200));
        }

        const data = await response.json();
        console.log('📥 Response data:', data);

        showResult(resultId, {
          status: response.status,
          statusText: response.statusText,
          data: data
        }, !response.ok);
      } catch (error) {
        console.error('❌ Error:', error);
        showResult(resultId, {
          error: error.message,
          stack: error.stack
        }, true);
      }
    }

    async function testOptionsExternal() {
      const resultId = 'result-external';
      try {
        const response = await fetch(API_BASE + '/public/external-tickets', {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        showResult(resultId, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: data
        });
      } catch (error) {
        showResult(resultId, {
          error: error.message,
          stack: error.stack
        }, true);
      }
    }

    async function testExternalTickets() {
      const resultId = 'result-external';
      try {
        const testData = {
          reporter_identity_type: 'named',
          reporter_name: 'Test User External',
          reporter_email: 'external@example.com',
          reporter_phone: '081234567890',
          reporter_address: 'Jl. Test No. 123',
          service_type: 'complaint',
          title: 'Test Tiket External dari Vercel',
          description: 'Ini adalah test tiket external untuk verifikasi endpoint berfungsi',
          unit_id: 'UNIT_ID_DISINI', // Ganti dengan unit_id yang valid
          source: 'web'
        };

        const response = await fetch(API_BASE + '/public/external-tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testData)
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error('Response bukan JSON: ' + text.substring(0, 200));
        }

        const data = await response.json();
        showResult(resultId, {
          status: response.status,
          statusText: response.statusText,
          data: data
        }, !response.ok);
      } catch (error) {
        showResult(resultId, {
          error: error.message,
          stack: error.stack
        }, true);
      }
    }

    async function testAppSettings() {
      const resultId = 'result-settings';
      try {
        const response = await fetch(API_BASE + '/public/app-settings', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error('Response bukan JSON: ' + text.substring(0, 200));
        }

        const data = await response.json();
        showResult(resultId, {
          status: response.status,
          statusText: response.statusText,
          data: data
        }, !response.ok);
      } catch (error) {
        showResult(resultId, {
          error: error.message,
          stack: error.stack
        }, true);
      }
    }

    async function testUnits() {
      const resultId = 'result-units';
      try {
        const response = await fetch(API_BASE + '/public/units', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error('Response bukan JSON: ' + text.substring(0, 200));
        }

        const data = await response.json();
        showResult(resultId, {
          status: response.status,
          statusText: response.statusText,
          data: data
        }, !response.ok);
      } catch (error) {
        showResult(resultId, {
          error: error.message,
          stack: error.stack
        }, true);
      }
    }
  </script>
</body>
</html>`;

fs.writeFileSync('test-vercel-submit-endpoints.html', testEndpointContent);
console.log('✅ File test-vercel-submit-endpoints.html dibuat');

// 5. Buat panduan deploy
console.log('\n📋 Step 5: Membuat panduan deploy...');
const deployGuideContent = `# PANDUAN DEPLOY DAN PERBAIKAN ERROR SUBMIT TIKET VERCEL

## Masalah yang Ditemukan

1. **Error 405 (Method Not Allowed)** pada endpoint /api/public/internal-tickets
2. **Server mengembalikan HTML instead of JSON** (non-JSON response)
3. **Error loading app settings** - response tidak valid

## Penyebab

- Vercel serverless function tidak ter-deploy dengan benar
- Environment variables tidak ter-set di Vercel
- CORS headers tidak lengkap
- Error handling tidak mengembalikan JSON yang valid

## Solusi yang Diterapkan

### 1. Perbaikan File API

✅ **api/public/internal-tickets.ts**
- Menambahkan logging yang lebih detail
- Memperbaiki CORS headers
- Menambahkan Cache-Control header
- Memperbaiki OPTIONS handler
- Menambahkan validasi environment variables yang lebih baik

✅ **api/public/app-settings.ts**
- Sudah diperbaiki sebelumnya
- Mengembalikan default settings jika error

### 2. Environment Variables yang Diperlukan

Pastikan environment variables berikut sudah di-set di **Vercel Dashboard**:

\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

**Cara set environment variables di Vercel:**

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik tab **Settings**
4. Klik **Environment Variables**
5. Tambahkan ketiga variable di atas
6. Pilih environment: **Production**, **Preview**, dan **Development**
7. Klik **Save**

### 3. Cara Deploy

\`\`\`bash
# 1. Commit perubahan
git add .
git commit -m "fix: perbaikan error submit tiket di Vercel"

# 2. Push ke GitHub
git push origin main

# 3. Vercel akan otomatis deploy
# Atau deploy manual:
vercel --prod
\`\`\`

### 4. Cara Test Setelah Deploy

1. **Buka file test di browser:**
   \`\`\`
   https://your-domain.vercel.app/test-vercel-submit-endpoints.html
   \`\`\`

2. **Test setiap endpoint:**
   - Test OPTIONS request (untuk CORS)
   - Test POST internal ticket
   - Test POST external ticket
   - Test GET app settings
   - Test GET units

3. **Periksa Vercel Logs:**
   - Buka Vercel Dashboard
   - Klik project Anda
   - Klik tab **Deployments**
   - Klik deployment terbaru
   - Klik **Functions** untuk melihat logs

### 5. Troubleshooting

#### Jika masih error 405:

1. **Cek routing di vercel.json:**
   \`\`\`json
   {
     "rewrites": [
       {
         "source": "/((?!api/).*)",
         "destination": "/index.html"
       }
     ]
   }
   \`\`\`

2. **Cek file ada di folder api/public/:**
   - internal-tickets.ts
   - external-tickets.ts
   - app-settings.ts
   - units.ts
   - surveys.ts

3. **Cek Vercel Function Logs:**
   - Buka Vercel Dashboard > Deployments > Functions
   - Lihat error message yang muncul

#### Jika response bukan JSON:

1. **Cek Content-Type header:**
   - Harus: \`application/json; charset=utf-8\`

2. **Cek error handling:**
   - Semua error harus return JSON
   - Tidak boleh return HTML

3. **Cek environment variables:**
   - Pastikan semua variable sudah ter-set
   - Restart deployment jika baru set variable

#### Jika environment variables tidak terbaca:

1. **Redeploy setelah set variables:**
   \`\`\`bash
   vercel --prod --force
   \`\`\`

2. **Cek di Vercel Dashboard:**
   - Settings > Environment Variables
   - Pastikan sudah ter-set untuk Production

3. **Cek di Function Logs:**
   - Lihat apakah ada log "MISSING" untuk env vars

### 6. Checklist Deploy

- [ ] Semua file API ada di folder api/public/
- [ ] vercel.json sudah benar
- [ ] Environment variables sudah di-set di Vercel
- [ ] Code sudah di-commit dan push
- [ ] Deployment berhasil (cek Vercel Dashboard)
- [ ] Test endpoint dengan file test HTML
- [ ] Cek Vercel Function Logs tidak ada error
- [ ] Test submit tiket dari aplikasi

### 7. Monitoring

Setelah deploy, monitor:

1. **Vercel Function Logs:**
   - Cek apakah ada error
   - Cek apakah request masuk

2. **Browser Console:**
   - Cek apakah ada error CORS
   - Cek apakah response valid JSON

3. **Network Tab:**
   - Cek status code (harus 200/201)
   - Cek response headers
   - Cek response body

## Kontak

Jika masih ada masalah, cek:
1. Vercel Function Logs
2. Browser Console
3. Network Tab di DevTools
`;

fs.writeFileSync('PANDUAN_DEPLOY_FIX_SUBMIT_VERCEL.md', deployGuideContent);
console.log('✅ File PANDUAN_DEPLOY_FIX_SUBMIT_VERCEL.md dibuat');

// 6. Summary
console.log('\n' + '='.repeat(60));
console.log('✅ PERBAIKAN SELESAI!');
console.log('='.repeat(60));
console.log('\nFile yang dibuat:');
console.log('1. test-vercel-submit-endpoints.html - File test endpoint');
console.log('2. PANDUAN_DEPLOY_FIX_SUBMIT_VERCEL.md - Panduan lengkap');
console.log('\nFile yang diperbaiki:');
console.log('1. api/public/internal-tickets.ts - Perbaikan CORS dan error handling');
console.log('\nLangkah selanjutnya:');
console.log('1. Set environment variables di Vercel Dashboard');
console.log('2. Commit dan push perubahan');
console.log('3. Deploy ke Vercel');
console.log('4. Test dengan file test-vercel-submit-endpoints.html');
console.log('5. Cek Vercel Function Logs jika ada error');
console.log('\nBaca PANDUAN_DEPLOY_FIX_SUBMIT_VERCEL.md untuk detail lengkap.');
console.log('='.repeat(60));
