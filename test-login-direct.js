const API_BASE = 'http://localhost:3002';

async function testLogin() {
    console.log('Testing login endpoint...');
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@jempol.com',
                password: 'admin123'
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.text();
        console.log('Response body:', data);

        if (response.ok) {
            const jsonData = JSON.parse(data);
            console.log('✓ Login successful');
            console.log('Token:', jsonData.token ? 'Present' : 'Missing');
        } else {
            console.log('✗ Login failed');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();