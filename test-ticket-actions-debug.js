const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test data
const testTicketId = '10812938-559d-4d4b-8fa1-01b04e94e549'; // Ganti dengan ID tiket yang valid
const testUnitId = 'f003'; // Ganti dengan unit ID yang valid

async function testEscalation() {
  console.log('\n=== TEST ESKALASI TIKET ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/ticket-actions/tickets/${testTicketId}/escalate`,
      {
        to_unit_id: testUnitId,
        cc_unit_ids: [],
        reason: 'Test eskalasi dari debug script',
        notes: 'Catatan tambahan test',
        priority: 'high'
      },
      {
        headers: {
          'Authorization': 'Bearer test-token', // Ganti dengan token yang valid
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Eskalasi berhasil:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Eskalasi gagal:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testResponse() {
  console.log('\n=== TEST RESPON TIKET ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/ticket-actions/tickets/${testTicketId}/respond`,
      {
        message: 'Test respon dari debug script',
        is_internal: false,
        mark_resolved: false
      },
      {
        headers: {
          'Authorization': 'Bearer test-token', // Ganti dengan token yang valid
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Respon berhasil:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Respon gagal:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function checkTicketExists() {
  console.log('\n=== CEK TIKET ===\n');
  
  try {
    const response = await axios.get(
      `${API_URL}/complaints/${testTicketId}`,
      {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }
    );
    
    console.log('✅ Tiket ditemukan:');
    console.log('ID:', response.data.data.id);
    console.log('Number:', response.data.data.ticket_number);
    console.log('Status:', response.data.data.status);
    console.log('Unit ID:', response.data.data.unit_id);
  } catch (error) {
    console.error('❌ Tiket tidak ditemukan:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function main() {
  console.log('🔍 Debug Ticket Actions API\n');
  console.log('Ticket ID:', testTicketId);
  console.log('Unit ID:', testUnitId);
  
  await checkTicketExists();
  await testResponse();
  await testEscalation();
  
  console.log('\n✅ Debug selesai\n');
}

main();
