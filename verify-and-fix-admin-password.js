// Script untuk memverifikasi dan memperbaiki password admin
console.log('🔧 VERIFIKASI DAN PERBAIKAN PASSWORD ADMIN\n');

// Simulasi bcrypt untuk testing
const bcrypt = require('bcryptjs');

// Password yang diharapkan
const expectedPassword = 'admin123';

// Hash yang ada di database saat ini
const currentHash = '$2a$06$ixuDiWweXqcI7thO3XvMZui/VaoGMNezzsC33MXYplC2rWvSAlmk6';

console.log('1️⃣ Testing password saat ini...');
console.log(`Password: ${expectedPassword}`);
console.log(`Hash: ${currentHash}`);

// Test password
const isValid = bcrypt.compareSync(expectedPassword, currentHash);
console.log(`Password valid: ${isValid ? '✅' : '❌'}`);

if (!isValid) {
    console.log('\n❌ Password tidak valid! Membuat hash baru...');
    
    // Generate hash baru dengan bcrypt
    const newHash = bcrypt.hashSync(expectedPassword, 10);
    console.log(`Hash baru: ${newHash}`);
    
    // Test hash baru
    const newHashValid = bcrypt.compareSync(expectedPassword, newHash);
    console.log(`Hash baru valid: ${newHashValid ? '✅' : '❌'}`);
    
    console.log('\n📋 SQL untuk update password:');
    console.log(`UPDATE auth.users SET encrypted_password = '${newHash}' WHERE email = 'admin@jempol.com';`);
} else {
    console.log('\n✅ Password sudah benar!');
}

// Generate beberapa hash alternatif untuk testing
console.log('\n🔧 Hash alternatif untuk testing:');
for (let rounds = 6; rounds <= 12; rounds += 2) {
    const altHash = bcrypt.hashSync(expectedPassword, rounds);
    const altValid = bcrypt.compareSync(expectedPassword, altHash);
    console.log(`Rounds ${rounds}: ${altValid ? '✅' : '❌'} ${altHash}`);
}

console.log('\n✅ VERIFIKASI SELESAI!');