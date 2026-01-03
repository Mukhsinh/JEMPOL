const bcrypt = require('bcrypt');

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
        
        return hash;
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

generatePasswordHash();