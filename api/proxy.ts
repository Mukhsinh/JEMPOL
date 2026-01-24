import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// CORS headers
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

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

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(response);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    // Extract path from URL
    const url = new URL(request.url || '', `https://${request.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Remove 'api' and 'proxy' from path
    const routePath = pathParts.slice(2).join('/');
    
    console.log(`[${request.method}] /api/proxy/${routePath}`);

    // Route ke endpoint yang sesuai
    // Untuk sekarang, return placeholder
    // Nanti akan diintegrasikan dengan Supabase queries
    
    return response.status(200).json({
      success: true,
      message: `API proxy endpoint reached: ${routePath}`,
      method: request.method,
      note: 'This will be integrated with Supabase queries'
    });

  } catch (error: any) {
    console.error('Proxy error:', error);
    return response.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
