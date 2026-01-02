const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF(htmlFile, outputFile) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Read HTML file
  const htmlPath = path.join(__dirname, '..', 'frontend', 'public', 'ebooks', htmlFile);
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Set content
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  const outputPath = path.join(__dirname, '..', 'frontend', 'public', 'ebooks', outputFile);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '2cm',
      right: '2cm',
      bottom: '2cm',
      left: '2cm'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
        aplikasiKISS@2024.Mukhsin Hadi. Hak Cipta dilindungi oleh Undang-Undang - Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span>
      </div>
    `
  });
  
  await browser.close();
  console.log(`✅ Generated: ${outputFile}`);
}

async function generateAllPDFs() {
  console.log('🚀 Generating PDF e-books...');
  
  try {
    // Generate all three e-books
    await generatePDF('KISS_Gambaran_Umum.html', 'KISS_Gambaran_Umum.pdf');
    await generatePDF('KISS_Alur_Teknis.html', 'KISS_Alur_Teknis.pdf');
    await generatePDF('KISS_Petunjuk_Teknis.html', 'KISS_Petunjuk_Teknis.pdf');
    
    console.log('✅ All PDF e-books generated successfully!');
  } catch (error) {
    console.error('❌ Error generating PDFs:', error);
  }
}

// Run if called directly
if (require.main === module) {
  generateAllPDFs();
}

module.exports = { generatePDF, generateAllPDFs };