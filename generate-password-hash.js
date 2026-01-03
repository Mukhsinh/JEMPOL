const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash valid:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();