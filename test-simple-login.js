// Simple login test
const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('Testing login...');
        
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'password'
            })
        });
        
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (data.success) {
            console.log('Login successful!');
            
            // Test get users
            const usersResponse = await fetch('http://localhost:5001/api/users', {
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            
            const usersData = await usersResponse.json();
            console.log('Users response:', usersData);
            
        } else {
            console.log('Login failed:', data.message);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();