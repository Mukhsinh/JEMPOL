import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check environment variables (tanpa expose nilai sebenarnya)
  const envCheck = {
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    SUPABASE_URL_length: process.env.SUPABASE_URL?.length || 0,
    SUPABASE_ANON_KEY_length: process.env.SUPABASE_ANON_KEY?.length || 0,
    NODE_ENV: process.env.NODE_ENV
  };
  
  return res.status(200).json({
    success: true,
    message: 'Environment check',
    env: envCheck,
    timestamp: new Date().toISOString()
  });
}
