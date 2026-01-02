const API_BASE = 'http://localhost:3001';

async function testDifferentPasswords() {
    const passwords = [
        'admin123',
        'password',
        'admin',
        '123456',
        'admin@jempol.com',
        'jempol123'
    ];

    console.log('Testing different passwords for admin@jempol.com...');

    for (const password of passwords) {
        try {
            console.log(`\nTrying password: "${password}"`);
            
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@jempol.com',
                    password: password
                })
            });

            const data = await response.text();
            
            if (response.ok) {
                console.log('✓ SUCCESS! Password found:', password);
                const jsonData = JSON.parse(data);
                console.log('Response:', jsonData);
                break;
            } else {
                console.log(`✗ Failed (${response.status}):`, data.substring(0, 100));
            }

        } catch (error) {
            console.log('✗ Error:', error.message);
        }
    }
}

testDifferentPasswords();