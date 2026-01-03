const bcrypt = require('bcryptjs');

async function testPassword() {
    const password = 'admin123';
    const existingHash = '$2b$10$RewNloAVR.F6s6pycUiW/Ox9MT0chrgZChU6fWjq/KrqowQTr1vUO';
    
    console.log('Testing password:', password);
    console.log('Against hash:', existingHash);
    
    try {
        // Test with existing hash
        const isValid1 = await bcrypt.compare(password, existingHash);
        console.log('bcryptjs compare result:', isValid1);
        
        // Generate new hash with bcryptjs
        const newHash = await bcrypt.hash(password, 10);
        console.log('New bcryptjs hash:', newHash);
        
        // Test new hash
        const isValid2 = await bcrypt.compare(password, newHash);
        console.log('New hash validation:', isValid2);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testPassword();