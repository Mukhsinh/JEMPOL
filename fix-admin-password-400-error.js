const bcrypt = require('bcrypt');

async function fixAdminPassword() {
    console.log('🔧 Fixing admin password for 400 error...\n');

    // Password yang akan digunakan
    const newPassword = 'admin123';
    const saltRounds = 10;

    try {
        // Generate hash baru dengan salt rounds yang lebih tinggi
        const newHash = await bcrypt.hash(newPassword, saltRounds);
        
        console.log('✅ Password hash generated successfully!');
        console.log(`Password: ${newPassword}`);
        console.log(`Hash: ${newHash}\n`);

        // Test hash
        const isValid = await bcrypt.compare(newPassword, newHash);
        console.log(`Hash validation: ${isValid ? '✅ Valid' : '❌ Invalid'}\n`);

        // SQL untuk update password
        const updateSQL = `
UPDATE admins 
SET password_hash = '${newHash}', updated_at = NOW() 
WHERE username IN ('admin', 'admin_jempol');`;

        console.log('📝 SQL untuk update password:');
        console.log(updateSQL);

        console.log('\n🔍 Untuk test manual:');
        console.log('1. Username: admin_jempol');
        console.log('2. Password: admin123');
        console.log('3. Atau Username: admin');
        console.log('4. Password: admin123');

        return {
            password: newPassword,
            hash: newHash,
            sql: updateSQL
        };

    } catch (error) {
        console.error('❌ Error generating password hash:', error);
        throw error;
    }
}

// Run the fix
fixAdminPassword().then(result => {
    console.log('\n✅ Password fix completed!');
}).catch(error => {
    console.error('❌ Password fix failed:', error);
});