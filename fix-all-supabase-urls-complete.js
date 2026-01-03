const fs = require('fs');
const path = require('path');

console.log('🔧 MEMPERBAIKI SEMUA URL SUPABASE YANG SALAH');
console.log('='.repeat(50));

// URL dan key yang benar
const CORRECT_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const CORRECT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// URL dan key yang salah
const WRONG_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const WRONG_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

function findAndReplaceInFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace wrong URL
    if (content.includes(WRONG_URL)) {
      content = content.replace(new RegExp(WRONG_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), CORRECT_URL);
      modified = true;
      console.log(`✅ Fixed URL in: ${filePath}`);
    }
    
    // Replace wrong key
    if (content.includes(WRONG_KEY)) {
      content = content.replace(new RegExp(WRONG_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), CORRECT_KEY);
      modified = true;
      console.log(`✅ Fixed key in: ${filePath}`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir, extensions = ['.js', '.ts', '.tsx', '.html', '.md']) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (item !== 'node_modules' && item !== '.git' && !item.startsWith('.')) {
          files.push(...scanDirectory(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Cannot scan directory ${dir}:`, error.message);
  }
  
  return files;
}

async function main() {
  console.log('\n1️⃣ Scanning for files with wrong Supabase URLs...');
  
  const allFiles = scanDirectory(__dirname);
  let fixedFiles = 0;
  
  console.log(`📁 Found ${allFiles.length} files to check`);
  
  for (const file of allFiles) {
    if (findAndReplaceInFile(file)) {
      fixedFiles++;
    }
  }
  
  console.log(`\n2️⃣ Checking specific important files...`);
  
  // Check specific important files
  const importantFiles = [
    'frontend/src/utils/supabaseClient.ts',
    'frontend/src/utils/supabaseClientFixed.ts',
    'frontend/.env',
    'backend/.env',
    'backend/src/config/supabase.ts'
  ];
  
  for (const file of importantFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes(CORRECT_URL)) {
        console.log(`✅ ${file} - URL sudah benar`);
      } else if (content.includes(WRONG_URL)) {
        console.log(`❌ ${file} - masih menggunakan URL yang salah`);
        findAndReplaceInFile(file);
      } else {
        console.log(`ℹ️ ${file} - tidak mengandung URL Supabase`);
      }
    } else {
      console.log(`⚠️ ${file} - file tidak ditemukan`);
    }
  }
  
  console.log(`\n3️⃣ Summary:`);
  console.log(`📝 Total files checked: ${allFiles.length}`);
  console.log(`🔧 Files fixed: ${fixedFiles}`);
  console.log(`✅ Correct URL: ${CORRECT_URL}`);
  
  if (fixedFiles > 0) {
    console.log(`\n🎉 ${fixedFiles} files have been fixed!`);
    console.log('📋 Next steps:');
    console.log('1. Restart frontend and backend servers');
    console.log('2. Clear browser cache');
    console.log('3. Try login again');
  } else {
    console.log('\n✅ No files needed fixing - all URLs are correct!');
  }
}

main().catch(console.error);