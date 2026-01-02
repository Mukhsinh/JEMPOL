// Test script untuk memverifikasi environment variables
console.log('Testing environment variables...');

// Simulasi import.meta.env untuk testing
const mockEnv = {
  VITE_SUPABASE_URL: 'https://jxxzbdivafzzwqhagwrf.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg'
};

const supabaseUrl = mockEnv.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = mockEnv.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

if (supabaseUrl.includes('your-project')) {
  console.error('❌ ERROR: Masih menggunakan placeholder URL!');
} else {
  console.log('✅ SUCCESS: URL Supabase sudah benar');
}

if (supabaseAnonKey === 'your-anon-key') {
  console.error('❌ ERROR: Masih menggunakan placeholder key!');
} else {
  console.log('✅ SUCCESS: Supabase key sudah benar');
}