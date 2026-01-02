const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
    const password = 'admin123';
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password:', password);
        console.log('Hash:', hash);
        
        // Test the hash
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash validation:', isValid);
        
        // Test against existing hash
        const existingHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        const isExistingValid = await bcrypt.compare(password, existingHash);
        console.log('Existing hash validation:', isExistingValid);
        
        // Try common passwords
        const commonPasswords = ['admin123', 'password', 'admin', '123456'];
        for (const pwd of commonPasswords) {
            const isValid = await bcrypt.compare(pwd, existingHash);
            console.log(`Password "${pwd}" valid:`, isValid);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

generatePasswordHash();