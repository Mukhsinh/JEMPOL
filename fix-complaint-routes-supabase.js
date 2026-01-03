const fs = require('fs');
const path = require('path');

// Read the complaint routes file
const filePath = path.join(__dirname, 'backend/src/routes/complaintRoutes.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of 'supabase' with 'supabaseAdmin' except for imports and comments
content = content.replace(/(?<!import.*)(await\s+)supabase(?!\w)/g, '$1supabaseAdmin');
content = content.replace(/(?<!import.*)(const\s+.*=\s+)supabase(?!\w)/g, '$1supabaseAdmin');
content = content.replace(/(?<!import.*)(let\s+.*=\s+)supabase(?!\w)/g, '$1supabaseAdmin');

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Updated complaintRoutes.ts to use supabaseAdmin');