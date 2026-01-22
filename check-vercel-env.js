// Script untuk mengecek environment variables yang tersedia
// Jalankan di Vercel function untuk debug

export default async function handler(req, res) {
  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // List semua env vars yang berkaitan dengan Supabase
  const supabaseEnvVars = {};
  
  Object.keys(process.env).forEach(key => {
    if (key.includes('SUPABASE') || key.includes('VITE')) {
      // Jangan tampilkan value lengkap untuk keamanan
      supabaseEnvVars[key] = process.env[key] ? 
        `${process.env[key].substring(0, 10)}...` : 
        'undefined';
    }
  });
  
  return res.status(200).json({
    success: true,
    message: 'Environment variables check',
    supabase_vars: supabaseEnvVars,
    total_env_vars: Object.keys(process.env).length,
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV
  });
}
