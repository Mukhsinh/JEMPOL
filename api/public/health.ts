import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple health check endpoint untuk test API routing
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_ANON_KEY || !!process.env.VITE_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
