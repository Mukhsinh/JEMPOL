const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Supabase URL mismatch...\n');

// URL yang benar dari MCP
const CORRECT_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const CORRECT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Wrong URL yang muncul di error
const WRONG_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';

const filesToCheck = [
    'frontend/.env',
    'backend/.env',
    'frontend/src/utils/supabaseClient.ts',
    'frontend/src/utils/supabaseClientFixed.ts'
];

console.log('📁 Files to check and fix:');
filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - exists`);
        
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Replace wrong URL with correct URL
        if (content.includes(WRONG_URL)) {
            content = content.replace(new RegExp(WRONG_URL, 'g'), CORRECT_URL);
            modified = true;
            console.log(`   🔄 Fixed wrong URL in ${file}`);
        }
        
        // Ensure correct URL is present
        if (content.includes('SUPABASE_URL') || content.includes('supabaseUrl')) {
            if (!content.includes(CORRECT_URL)) {
                console.log(`   ⚠️  ${file} might have incorrect URL`);
            } else {
                console.log(`   ✅ ${file} has correct URL`);
            }
        }
        
        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`   💾 Updated ${file}`);
        }
    } else {
        console.log(`❌ ${file} - not found`);
    }
});

// Clear browser cache instructions
console.log('\n🧹 Clear browser cache:');
console.log('1. Open browser DevTools (F12)');
console.log('2. Right-click refresh button');
console.log('3. Select "Empty Cache and Hard Reload"');
console.log('4. Or use Ctrl+Shift+R');

// Clear localStorage
console.log('\n🗑️  Clear localStorage:');
console.log('1. Open DevTools > Application > Storage');
console.log('2. Clear all localStorage entries');
console.log('3. Or run: localStorage.clear()');

console.log('\n✅ URL mismatch fix completed!');
console.log(`Correct URL: ${CORRECT_URL}`);
console.log('Please restart frontend and backend servers.');