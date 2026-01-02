const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDFs() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const ebooks = [
    {
      htmlFile: 'frontend/public/ebooks/KISS_Gambaran_Umum.html',
      pdfFile: 'frontend/public/pdfs/ebook-gambaran-umum-kiss.pdf',
      title: 'E-Book Gambaran Umum Aplikasi KISS'
    },
    {
      htmlFile: 'frontend/public/ebooks/KISS_Alur_Teknis.html',
      pdfFile: 'frontend/public/pdfs/ebook-alur-teknis-kiss.pdf',
      title: 'E-Book Alur Teknis Aplikasi KISS'
    },
    {
      htmlFile: 'frontend/public/ebooks/KISS_Petunjuk_Teknis.html',
      pdfFile: 'frontend/public/pdfs/ebook-petunjuk-teknis-kiss.pdf',
      title: 'E-Book Petunjuk Teknis Aplikasi KISS'
    }
  ];

  for (const ebook of ebooks) {
    try {
      console.log(`Generating PDF for: ${ebook.title}`);
      
      // Check if HTML file exists
      if (!fs.existsSync(ebook.htmlFile)) {
        console.log(`HTML file not found: ${ebook.htmlFile}, skipping...`);
        continue;
      }

      const page = await browser.newPage();
      
      // Read HTML content
      const htmlContent = fs.readFileSync(ebook.htmlFile, 'utf8');
      
      // Set content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      await page.pdf({
        path: ebook.pdfFile,
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

      await page.close();
      console.log(`✓ PDF generated: ${ebook.pdfFile}`);
      
    } catch (error) {
      console.error(`Error generating PDF for ${ebook.title}:`, error);
    }
  }

  await browser.close();
  console.log('All PDFs generated successfully!');
}

// Run the script
if (require.main === module) {
  generatePDFs().catch(console.error);
}

module.exports = { generatePDFs };