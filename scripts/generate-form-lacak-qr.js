const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// URL untuk Form Lacak (sesuaikan dengan domain production Anda)
const FORM_LACAK_URLS = [
  {
    name: 'form-lacak-local',
    url: 'http://localhost:5173/form-lacak',
    description: 'Form Lacak - Local Development'
  },
  {
    name: 'form-lacak-production',
    url: 'https://your-domain.vercel.app/form-lacak',
    description: 'Form Lacak - Production'
  },
  {
    name: 'lacak-tiket-short',
    url: 'https://your-domain.vercel.app/lacak',
    description: 'Lacak Tiket - Short URL'
  }
];

// Pastikan folder output ada
const outputDir = path.join(__dirname, '..', 'public', 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate QR codes
async function generateQRCodes() {
  console.log('🔄 Generating QR Codes untuk Form Lacak...\n');

  for (const qrData of FORM_LACAK_URLS) {
    try {
      // Generate QR Code sebagai PNG
      const outputPath = path.join(outputDir, `${qrData.name}.png`);
      
      await QRCode.toFile(outputPath, qrData.url, {
        width: 500,
        margin: 2,
        color: {
          dark: '#137fec',  // Primary color
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      console.log(`✅ ${qrData.description}`);
      console.log(`   URL: ${qrData.url}`);
      console.log(`   File: ${outputPath}\n`);

      // Generate juga versi SVG
      const svgPath = path.join(outputDir, `${qrData.name}.svg`);
      const svgString = await QRCode.toString(qrData.url, {
        type: 'svg',
        width: 500,
        margin: 2,
        color: {
          dark: '#137fec',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      
      fs.writeFileSync(svgPath, svgString);
      console.log(`✅ SVG version: ${svgPath}\n`);

    } catch (error) {
      console.error(`❌ Error generating QR for ${qrData.name}:`, error);
    }
  }

  // Generate HTML preview
  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Codes - Form Lacak Tiket</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .qr-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }
    .qr-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    .qr-card:hover {
      transform: translateY(-5px);
    }
    .qr-card h2 {
      color: #137fec;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }
    .qr-card p {
      color: #666;
      margin-bottom: 20px;
      font-size: 0.95rem;
    }
    .qr-image {
      width: 100%;
      max-width: 300px;
      height: auto;
      margin: 20px auto;
      display: block;
      border: 3px solid #137fec;
      border-radius: 10px;
      padding: 10px;
      background: white;
    }
    .url-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #333;
    }
    .download-btn {
      display: inline-block;
      background: #137fec;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      margin-top: 15px;
      margin-right: 10px;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    .download-btn:hover {
      background: #0d5fb8;
    }
    .instructions {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-top: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .instructions h3 {
      color: #137fec;
      margin-bottom: 15px;
    }
    .instructions ol {
      margin-left: 20px;
      line-height: 1.8;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 QR Codes - Form Lacak Tiket</h1>
    
    <div class="qr-grid">
      ${FORM_LACAK_URLS.map(qr => `
        <div class="qr-card">
          <h2>${qr.description}</h2>
          <p>Scan QR code ini untuk mengakses Form Lacak Tiket</p>
          <img src="qr-codes/${qr.name}.png" alt="${qr.description}" class="qr-image">
          <div class="url-box">${qr.url}</div>
          <a href="qr-codes/${qr.name}.png" download class="download-btn">📥 Download PNG</a>
          <a href="qr-codes/${qr.name}.svg" download class="download-btn">📥 Download SVG</a>
        </div>
      `).join('')}
    </div>

    <div class="instructions">
      <h3>📋 Cara Penggunaan:</h3>
      <ol>
        <li>Pilih QR code yang sesuai (local untuk development, production untuk live)</li>
        <li>Download QR code dalam format PNG atau SVG</li>
        <li>Cetak QR code dan tempel di lokasi strategis (loket, ruang tunggu, dll)</li>
        <li>Pengguna dapat scan QR code untuk langsung mengakses Form Lacak Tiket</li>
        <li>Pengguna dapat memasukkan nomor tiket untuk melacak status pengaduan mereka</li>
      </ol>
    </div>
  </div>
</body>
</html>
  `;

  const htmlPath = path.join(__dirname, '..', 'public', 'qr-form-lacak.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ HTML Preview: ${htmlPath}\n`);

  console.log('✨ Selesai! QR Codes berhasil di-generate.');
  console.log(`📂 Lokasi file: ${outputDir}`);
  console.log(`🌐 Buka preview: public/qr-form-lacak.html`);
}

// Jalankan generator
generateQRCodes().catch(console.error);
