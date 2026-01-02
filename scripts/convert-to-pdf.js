const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to convert markdown to PDF using pandoc (if available)
function convertToPDF(markdownFile, outputFile) {
  try {
    // Check if pandoc is available
    execSync('pandoc --version', { stdio: 'ignore' });
    
    // Convert using pandoc
    const command = `pandoc "${markdownFile}" -o "${outputFile}" --pdf-engine=wkhtmltopdf --css=styles/ebook.css`;
    execSync(command);
    
    console.log(`✅ Successfully converted ${markdownFile} to ${outputFile}`);
    return true;
  } catch (error) {
    console.log(`❌ Pandoc not available or conversion failed for ${markdownFile}`);
    return false;
  }
}

// Alternative: Create HTML version that can be printed to PDF
function convertToHTML(markdownFile, outputFile) {
  try {
    const markdown = fs.readFileSync(markdownFile, 'utf8');
    
    // Simple markdown to HTML conversion (basic)
    let html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Wrap in HTML structure
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Book KISS</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        h2 {
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
            margin-top: 25px;
        }
        h3 {
            color: #1e3a8a;
            margin-top: 20px;
        }
        h4 {
            color: #1e40af;
            margin-top: 15px;
        }
        code {
            background: #f3f4f6;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            margin: 15px 0;
        }
        pre code {
            background: none;
            padding: 0;
        }
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
        blockquote {
            border-left: 4px solid #2563eb;
            margin: 15px 0;
            padding: 10px 20px;
            background: #f8fafc;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background: #f3f4f6;
            font-weight: 600;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            h1 { page-break-before: always; }
            h1:first-child { page-break-before: avoid; }
        }
    </style>
</head>
<body>
    <p>${html}</p>
    <div class="footer">
        <p><strong>© 2024 MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC</strong></p>
        <p>aplikasiKISS@2024.Mukhsin Hadi. Hak Cipta dilindungi oleh Undang-Undang</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(outputFile, htmlContent);
    console.log(`✅ Successfully converted ${markdownFile} to ${outputFile}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to convert ${markdownFile} to HTML:`, error.message);
    return false;
  }
}

// Main conversion function
function convertEbooks() {
  const ebooks = [
    {
      input: 'ebook-gambaran-umum-kiss.md',
      outputPdf: 'frontend/public/ebook-gambaran-umum-kiss.pdf',
      outputHtml: 'frontend/public/ebook-gambaran-umum-kiss.html'
    },
    {
      input: 'ebook-alur-teknis-kiss.md',
      outputPdf: 'frontend/public/ebook-alur-teknis-kiss.pdf',
      outputHtml: 'frontend/public/ebook-alur-teknis-kiss.html'
    },
    {
      input: 'ebook-petunjuk-teknis-kiss.md',
      outputPdf: 'frontend/public/ebook-petunjuk-teknis-kiss.pdf',
      outputHtml: 'frontend/public/ebook-petunjuk-teknis-kiss.html'
    }
  ];

  console.log('🚀 Starting e-book conversion...\n');

  ebooks.forEach(ebook => {
    console.log(`Converting ${ebook.input}...`);
    
    // Try PDF conversion first
    const pdfSuccess = convertToPDF(ebook.input, ebook.outputPdf);
    
    // Always create HTML version
    const htmlSuccess = convertToHTML(ebook.input, ebook.outputHtml);
    
    if (!pdfSuccess && htmlSuccess) {
      console.log(`💡 PDF conversion failed, but HTML version created. You can print the HTML to PDF manually.`);
    }
    
    console.log('');
  });

  console.log('✨ E-book conversion completed!');
  console.log('\n📖 Available formats:');
  console.log('- Markdown (.md) - Original source files');
  console.log('- HTML (.html) - Web viewable, can be printed to PDF');
  console.log('- PDF (.pdf) - If pandoc conversion succeeded');
  
  console.log('\n💡 To print HTML to PDF:');
  console.log('1. Open the HTML file in your browser');
  console.log('2. Press Ctrl+P (or Cmd+P on Mac)');
  console.log('3. Select "Save as PDF" as destination');
  console.log('4. Adjust print settings as needed');
}

// Run the conversion
if (require.main === module) {
  convertEbooks();
}

module.exports = { convertEbooks, convertToPDF, convertToHTML };