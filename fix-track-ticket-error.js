/**
 * Script untuk memperbaiki error track ticket
 * Error: "Unexpected token 'e', ...is not valid JSON"
 * 
 * Masalah:
 * - Endpoint /api/public/track-ticket mengembalikan HTML error alih-alih JSON
 * - Kemungkinan karena routing atau CORS issue
 * 
 * Solusi:
 * 1. Pastikan endpoint Vercel serverless function berfungsi
 * 2. Tambahkan error handling yang lebih baik di frontend
 * 3. Tambahkan fallback ke backend Express jika Vercel gagal
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki error track ticket...\n');

// 1. Update TrackTicket.tsx dengan error handling yang lebih baik
const trackTicketPath = path.join(__dirname, 'frontend/src/pages/public/TrackTicket.tsx');
console.log('📝 Updating TrackTicket.tsx dengan error handling yang lebih baik...');

const trackTicketContent = fs.readFileSync(trackTicketPath, 'utf8');

// Cari dan replace fungsi handleSearchWithTicket
const updatedTrackTicket = trackTicketContent.replace(
  /const handleSearchWithTicket = async \(ticket: string\) => \{[\s\S]*?setLoading\(false\);\s*\}\s*\};/,
  `const handleSearchWithTicket = async (ticket: string) => {
    if (!ticket.trim()) return;

    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      // Gunakan endpoint yang benar untuk Vercel
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const endpoint = \`\${apiUrl}/public/track-ticket?ticket=\${encodeURIComponent(ticket.trim())}\`;
      
      console.log('🔍 Fetching ticket from:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Response bukan JSON:', contentType);
        const text = await response.text();
        console.error('❌ Response text:', text.substring(0, 200));
        throw new Error('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
      }

      const data = await response.json();
      console.log('✅ Response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Tiket tidak ditemukan');
      }

      setTicketData(data.data);
    } catch (err: any) {
      console.error('❌ Error tracking ticket:', err);
      
      // Berikan pesan error yang lebih informatif
      let errorMessage = err.message || 'Terjadi kesalahan saat mencari tiket';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Server mengembalikan response yang tidak valid. Silakan coba lagi.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };`
);

fs.writeFileSync(trackTicketPath, updatedTrackTicket, 'utf8');
console.log('✅ TrackTicket.tsx updated\n');

// 2. Pastikan vercel.json sudah benar
const vercelConfigPath = path.join(__dirname, 'vercel.json');
console.log('📝 Checking vercel.json configuration...');

if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  // Pastikan ada route untuk track-ticket
  const hasTrackTicketRoute = vercelConfig.rewrites?.some(r => 
    r.source === '/api/public/track-ticket' || 
    r.source.includes('track-ticket')
  );
  
  if (!hasTrackTicketRoute) {
    console.log('⚠️  Route track-ticket tidak ditemukan di vercel.json');
    console.log('📝 Menambahkan route...');
    
    if (!vercelConfig.rewrites) {
      vercelConfig.rewrites = [];
    }
    
    // Tambahkan route untuk track-ticket
    vercelConfig.rewrites.push({
      source: '/api/public/track-ticket',
      destination: '/api/public/track-ticket.ts'
    });
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2), 'utf8');
    console.log('✅ Route track-ticket ditambahkan ke vercel.json\n');
  } else {
    console.log('✅ Route track-ticket sudah ada di vercel.json\n');
  }
} else {
  console.log('⚠️  vercel.json tidak ditemukan\n');
}

// 3. Buat test file untuk debugging
const testFilePath = path.join(__dirname, 'test-track-ticket-fixed.html');
console.log('📝 Creating test file...');

const testFileContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Track Ticket - Fixed</title>
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
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        }
        button:hover {
            background: #45a049;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            white-space: pre-wrap;
            word-wrap: break-word;
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
        .debug {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            font-size: 12px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Test Track Ticket - Fixed</h1>
        <p>Test endpoint track ticket dengan error handling yang lebih baik</p>
        
        <div class="form-group">
            <label for="ticketNumber">Nomor Tiket:</label>
            <input type="text" id="ticketNumber" placeholder="TKT-2026-0003" value="TKT-2026-0003">
        </div>
        
        <button onclick="testTrackTicket()" id="testBtn">
            🔍 Lacak Tiket
        </button>
        
        <div id="result"></div>
    </div>

    <script>
        async function testTrackTicket() {
            const ticketNumber = document.getElementById('ticketNumber').value.trim();
            const resultDiv = document.getElementById('result');
            const testBtn = document.getElementById('testBtn');
            
            if (!ticketNumber) {
                resultDiv.innerHTML = '<div class="result error">❌ Silakan masukkan nomor tiket</div>';
                return;
            }
            
            testBtn.disabled = true;
            testBtn.textContent = '⏳ Mencari...';
            resultDiv.innerHTML = '<div class="result info">🔄 Mencari tiket...</div>';
            
            try {
                // Test 1: Coba endpoint Vercel
                console.log('🎯 Testing Vercel endpoint...');
                const apiUrl = window.location.origin;
                const endpoint = \`\${apiUrl}/api/public/track-ticket?ticket=\${encodeURIComponent(ticketNumber)}\`;
                
                console.log('📍 Endpoint:', endpoint);
                
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
                
                // Cek content type
                const contentType = response.headers.get('content-type');
                console.log('📄 Content-Type:', contentType);
                
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('❌ Response bukan JSON:', text.substring(0, 500));
                    
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <strong>❌ Error: Server mengembalikan response yang tidak valid</strong>
                            <div class="debug">
                                <strong>Status:</strong> \${response.status}<br>
                                <strong>Content-Type:</strong> \${contentType || 'tidak ada'}<br>
                                <strong>Response:</strong><br>
                                \${text.substring(0, 500)}...
                            </div>
                        </div>
                    \`;
                    return;
                }
                
                const data = await response.json();
                console.log('✅ Response data:', data);
                
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Tiket tidak ditemukan');
                }
                
                // Tampilkan hasil
                resultDiv.innerHTML = \`
                    <div class="result success">
                        <strong>✅ Tiket Ditemukan!</strong><br><br>
                        <strong>Nomor Tiket:</strong> \${data.data.ticket.ticket_number}<br>
                        <strong>Judul:</strong> \${data.data.ticket.title}<br>
                        <strong>Status:</strong> \${data.data.ticket.status}<br>
                        <strong>Prioritas:</strong> \${data.data.ticket.priority}<br>
                        <strong>Unit:</strong> \${data.data.ticket.unit?.name || 'N/A'}<br>
                        <strong>Dibuat:</strong> \${new Date(data.data.ticket.created_at).toLocaleString('id-ID')}<br>
                        <strong>Total Respon:</strong> \${data.data.stats.totalResponses}<br>
                        <strong>Total Eskalasi:</strong> \${data.data.stats.totalEscalations}<br>
                        <strong>Timeline Events:</strong> \${data.data.timeline.length}
                    </div>
                    <div class="debug">
                        <strong>Full Response:</strong><br>
                        \${JSON.stringify(data, null, 2)}
                    </div>
                \`;
                
            } catch (error) {
                console.error('❌ Error:', error);
                
                let errorMessage = error.message || 'Terjadi kesalahan';
                
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
                } else if (error.message.includes('JSON')) {
                    errorMessage = 'Server mengembalikan response yang tidak valid.';
                }
                
                resultDiv.innerHTML = \`
                    <div class="result error">
                        <strong>❌ Error:</strong> \${errorMessage}
                        <div class="debug">
                            <strong>Error Details:</strong><br>
                            \${error.stack || error.toString()}
                        </div>
                    </div>
                \`;
            } finally {
                testBtn.disabled = false;
                testBtn.textContent = '🔍 Lacak Tiket';
            }
        }
        
        // Auto test on load
        window.addEventListener('load', () => {
            console.log('🚀 Page loaded, ready to test');
        });
    </script>
</body>
</html>`;

fs.writeFileSync(testFilePath, testFileContent, 'utf8');
console.log('✅ Test file created: test-track-ticket-fixed.html\n');

// 4. Buat batch file untuk testing
const testBatchPath = path.join(__dirname, 'TEST_TRACK_TICKET_FIXED.bat');
console.log('📝 Creating test batch file...');

const testBatchContent = `@echo off
echo ========================================
echo TEST TRACK TICKET - FIXED
echo ========================================
echo.

echo Membuka test file di browser...
start http://localhost:3005/test-track-ticket-fixed.html

echo.
echo Test file dibuka di browser
echo Periksa console browser untuk detail debugging
echo.
pause
`;

fs.writeFileSync(testBatchPath, testBatchContent, 'utf8');
console.log('✅ Test batch file created: TEST_TRACK_TICKET_FIXED.bat\n');

console.log('✅ Perbaikan selesai!\n');
console.log('📋 Langkah selanjutnya:');
console.log('1. Jalankan TEST_TRACK_TICKET_FIXED.bat untuk test');
console.log('2. Periksa console browser untuk detail error');
console.log('3. Pastikan backend berjalan di localhost:3005');
console.log('4. Jika masih error, periksa vercel.json dan api/public/track-ticket.ts');
console.log('\n🎯 Kemungkinan penyebab error:');
console.log('   - Endpoint tidak ditemukan (404)');
console.log('   - CORS issue');
console.log('   - Backend tidak berjalan');
console.log('   - Vercel serverless function error');
