// Script untuk memperbaiki integrasi backend dengan konfigurasi timeout yang benar
const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki integrasi backend...');

// Update backend supabase config
const supabaseConfigPath = path.join(__dirname, 'backend', 'src', 'config', 'supabase.ts');

if (fs.existsSync(supabaseConfigPath)) {
    let supabaseConfig = fs.readFileSync(supabaseConfigPath, 'utf8');
    
    // Pastikan konfigurasi menggunakan timeout yang benar
    const newConfig = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

// Supabase client untuk backend dengan service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      // Timeout yang lebih panjang untuk backend (45 detik)
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(45000)
      });
    }
  }
});

// Test koneksi saat startup
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing Supabase connection...');
    const { error } = await supabase.from('admins').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

export default supabase;
`;

    fs.writeFileSync(supabaseConfigPath, newConfig);
    console.log('✅ Backend supabase config updated');
} else {
    console.log('⚠️ Backend supabase config tidak ditemukan, membuat yang baru...');
    
    // Buat direktori jika belum ada
    const configDir = path.dirname(supabaseConfigPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    
    const newConfig = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

// Supabase client untuk backend dengan service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      // Timeout yang lebih panjang untuk backend (45 detik)
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(45000)
      });
    }
  }
});

// Test koneksi saat startup
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing Supabase connection...');
    const { error } = await supabase.from('admins').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

export default supabase;
`;

    fs.writeFileSync(supabaseConfigPath, newConfig);
    console.log('✅ Backend supabase config created');
}

// Update server.ts untuk test koneksi saat startup
const serverPath = path.join(__dirname, 'backend', 'src', 'server.ts');
if (fs.existsSync(serverPath)) {
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Tambahkan test koneksi jika belum ada
    if (!serverContent.includes('testConnection')) {
        // Tambahkan import
        if (!serverContent.includes('import { testConnection }')) {
            serverContent = serverContent.replace(
                /import.*from.*supabase.*/,
                `import { testConnection } from './config/supabase';`
            );
        }
        
        // Tambahkan test koneksi sebelum server start
        const serverStartRegex = /app\.listen\(.*\)/;
        if (serverStartRegex.test(serverContent)) {
            serverContent = serverContent.replace(
                serverStartRegex,
                `// Test Supabase connection before starting server
testConnection().then((connected) => {
  if (!connected) {
    console.warn('⚠️ Supabase connection failed, but server will continue');
  }
});

$&`
            );
        }
        
        fs.writeFileSync(serverPath, serverContent);
        console.log('✅ Server.ts updated dengan connection test');
    }
}

console.log('🎯 Backend integration fixes completed');
console.log('📝 Perubahan yang dilakukan:');
console.log('  - Timeout diperpanjang menjadi 45 detik untuk backend');
console.log('  - Connection test ditambahkan saat startup');
console.log('  - Konfigurasi Supabase diperbaiki');
console.log('🔄 Silakan restart backend untuk menerapkan perubahan');