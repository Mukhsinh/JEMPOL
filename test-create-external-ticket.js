// Test script untuk membuat tiket eksternal
const fetch = require('node-fetch');

async function testCreateExternalTicket() {
  const data = {
    reporter_identity_type: 'personal',
    reporter_name: 'Test User',
    reporter_email: 'test@example.com',
    reporter_phone: '081234567890',
    service_type: 'complaint',
    title: 'Test Complaint',
    description: 'This is a test complaint description',
    unit_id: 'f8e7d6c5-b4a3-9281-7065-f4e3d2c1b0a9', // Ganti dengan unit_id yang valid
    source: 'web'
  };

  console.log('📤 Sending request:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch('http://localhost:3002/api/public/external-tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCreateExternalTicket();
