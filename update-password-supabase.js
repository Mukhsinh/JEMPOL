import bcrypt from 'bcryptjs';

const password = 'Admin123!@#';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nJalankan SQL ini di Supabase:');
console.log(`
UPDATE auth.users 
SET encrypted_password = '${hash}',
    updated_at = NOW()
WHERE email = 'admin@jempol.com';
`);
