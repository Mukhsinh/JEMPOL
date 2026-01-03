const bcrypt = require('bcrypt');

// Test password untuk admin yang ada
const testPasswords = [
    'admin123',
    'password123', 
    'admin',
    'jempol123',
    'jempol',
    '123456'
];

const adminHashes = [
    {
        username: 'admin_jempol',
        hash: '$2b$06$ixuDiWweXqcI7thO3XvMZui/VaoGMNezzsC33MXYplC2rWvSAlmk6'
    },
    {
        username: 'admin', 
        hash: '$2a$06$uCzlcSk98kZXkzWBVb8x6evRyssFF1fZcus2P5icEQnJciZn7gR1e'
    }
];

console.log('🔍 Testing password combinations...\n');

adminHashes.forEach(admin => {
    console.log(`Testing for user: ${admin.username}`);
    testPasswords.forEach(password => {
        const isMatch = bcrypt.compareSync(password, admin.hash);
        if (isMatch) {
            console.log(`✅ MATCH FOUND! Username: ${admin.username}, Password: ${password}`);
        }
    });
    console.log('');
});

// Generate new password hash untuk admin_jempol
const newPassword = 'admin123';
const newHash = bcrypt.hashSync(newPassword, 6);
console.log(`\n🔑 New hash for password '${newPassword}': ${newHash}`);

console.log('\n📋 Summary:');
console.log('- Test dengan username: admin_jempol');
console.log('- Test dengan password: admin123');
console.log('- Jika masih error, gunakan hash baru di atas');