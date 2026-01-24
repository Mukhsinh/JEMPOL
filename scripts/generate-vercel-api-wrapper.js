/**
 * Script untuk Generate Vercel API Wrapper
 * Mengkonversi semua backend routes menjadi Vercel serverless functions
 */

const fs = require('fs');
const path = require('path');

// Daftar semua routes yang perlu di-wrap
const routes = [
  { name: 'auth', path: 'authRoutes', protected: false },
  { name: 'auth-verify', path: 'authVerifyRoutes', protected: true },
  { name: 'complaints', path: 'complaintRoutes', protected: true },
  { name: 'units', path: 'unitRoutes', protected: true },
  { name: 'master-data', path: 'masterDataRoutes', protected: true },
  { name: 'reports', path: 'reportRoutes', protected: true },
  { name: 'users', path: 'userRoutes', protected: true },
  { name: 'roles', path: 'rolesRoutes', protected: true },
  { name: 'response-templates', path: 'responseTemplatesRoutes', protected: true },
  { name: 'escalation', path: 'escalationRoutes', protected: true },
  { name: 'ai-escalation', path: 'aiEscalationRoutes', protected: true },
  { name: 'ai-trust', path: 'aiTrustRoutes', protected: true },
  { name: 'ticket-actions', path: 'ticketActionRoutes', protected: true },
  { name: 'qr-codes', path: 'qrCodeRoutes', protected: true },
  { name: 'notification-settings', path: 'notificationSettingsRoutes', protected: true },
  { name: 'ebooks', path: 'ebookRoutes', protected: false },
  { name: 'games', path: 'gameRoutes', protected: false },
  { name: 'innovations', path: 'innovationRoutes', protected: false },
  { name: 'visitors', path: 'visitorRoutes', protected: false },
  { name: 'external-tickets', path: 'externalTicketRoutes', protected: false },
  { name: 'public-data', path: 'publicDataRoutes', protected: false },
  { name: 'public-survey', path: 'publicSurveyRoutes', protected: false },
  { name: 'public-tracking', path: 'publicTrackingRoutes', protected: false },
  { name: 'app-settings', path: 'appSettingsRoutes', protected: false }
];

// Template untuk API wrapper
const generateWrapperTemplate = (routeName, routePath, isProtected) => {
  return `import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

${isProtected ? `
// Verify JWT token
async function verifyToken(request: VercelRequest): Promise<any> {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
` : ''}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .end();
  }

  try {
    ${isProtected ? `
    // Verify authentication for protected routes
    const user = await verifyToken(request);
    
    if (!user) {
      return response.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid or missing token'
      });
    }
    ` : ''}

    // Extract path parameters
    const pathParts = request.url?.split('/').filter(Boolean) || [];
    const routeIndex = pathParts.indexOf('${routeName}');
    const subPath = pathParts.slice(routeIndex + 1).join('/');

    // Log request for debugging
    console.log(\`[\${request.method}] /api/${routeName}/\${subPath}\`);

    // TODO: Implement actual route logic here
    // This is a placeholder that needs to be replaced with actual backend logic
    
    // For now, return a placeholder response
    return response.status(200).json({
      success: true,
      message: 'API endpoint /${routeName} reached',
      method: request.method,
      path: \`/api/${routeName}/\${subPath}\`,
      note: 'This endpoint needs implementation. Connect to Supabase or implement business logic here.',
      ${isProtected ? 'user: user.id,' : ''}
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
`;
};

// Generate API wrapper files
function generateAPIWrappers() {
  const apiDir = path.join(__dirname, '..', 'api');
  
  // Create api directory if not exists
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  let generatedCount = 0;
  let skippedCount = 0;

  routes.forEach(route => {
    const fileName = `${route.name}.ts`;
    const filePath = path.join(apiDir, fileName);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skipped: ${fileName} (already exists)`);
      skippedCount++;
      return;
    }

    // Generate wrapper content
    const content = generateWrapperTemplate(route.name, route.path, route.protected);
    
    // Write file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Generated: ${fileName}`);
    generatedCount++;
  });

  console.log('\n📊 Summary:');
  console.log(`✅ Generated: ${generatedCount} files`);
  console.log(`⏭️  Skipped: ${skippedCount} files`);
  console.log(`📁 Total routes: ${routes.length}`);
  console.log(`\n📂 Location: ${apiDir}`);
}

// Run the generator
console.log('🚀 Generating Vercel API Wrappers...\n');
generateAPIWrappers();
console.log('\n✨ Done!');
