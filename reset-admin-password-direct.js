const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  try {
    const password = 'admin123';
    const saltRounds = 6; // Sesuai dengan yang ada di database
    
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash valid:', isValid);
    
    return hash;
  } catch (error) {
    console.error('Error:', error);
  }
}

generatePasswordHash();