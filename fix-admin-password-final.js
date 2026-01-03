const bcrypt = require('bcrypt');

async function createPasswordHash() {
    const password = 'admin123';
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password hash for admin123:', hash);
        
        // Test the hash
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash validation:', isValid);
        
        return hash;
    } catch (error) {
        console.error('Error creating hash:', error);
    }
}

createPasswordHash();