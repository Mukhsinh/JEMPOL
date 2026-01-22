// Script untuk test endpoint submit tiket dan survey
const API_URL = 'http://localhost:3004';

async function testExternalTicketSubmit() {
  console.log('\n🧪 Testing External Ticket Submit...');
  
  try {
    const testData = {
      reporter_identity_type: 'personal',
      reporter_name: 'Test User',
      reporter_email: 'test@example.com',
      reporter_phone: '081234567890',
      service_type: 'complaint',
      title: 'Test Complaint',
      description: 'This is a test complaint',
      unit_id: '00000000-0000-0000-0000-000000000001', // Ganti dengan unit_id yang valid
      source: 'web'
    };

    console.log('📤 Sending data:', testData);

    const response = await fetch(`${API_URL}/api/public/external-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers.get('content-type'));

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      return;
    }

    const result = await response.json();
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ External ticket submitted successfully!');
      console.log('📋 Ticket number:', result.ticket_number);
    } else {
      console.error('❌ Failed to submit external ticket:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing external ticket:', error.message);
  }
}

async function testSurveySubmit() {
  console.log('\n🧪 Testing Survey Submit...');
  
  try {
    const testData = {
      unit_id: '00000000-0000-0000-0000-000000000001', // Ganti dengan unit_id yang valid
      visitor_phone: '081234567890',
      is_anonymous: false,
      visitor_name: 'Test User',
      service_type: 'complaint',
      q1_score: 4,
      q2_score: 4,
      q3_score: 4,
      q4_score: 4,
      q5_score: 4,
      q6_score: 4,
      q7_score: 4,
      q8_score: 4,
      overall_score: 4,
      comments: 'Test survey submission',
      source: 'public_survey'
    };

    console.log('📤 Sending data:', testData);

    const response = await fetch(`${API_URL}/api/public/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers.get('content-type'));

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      return;
    }

    const result = await response.json();
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ Survey submitted successfully!');
    } else {
      console.error('❌ Failed to submit survey:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing survey:', error.message);
  }
}

async function getValidUnitId() {
  console.log('\n🔍 Getting valid unit ID...');
  
  try {
    const response = await fetch(`${API_URL}/api/public/units`);
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      const unitId = result.data[0].id;
      console.log('✅ Found unit ID:', unitId);
      console.log('📋 Unit name:', result.data[0].name);
      return unitId;
    } else if (Array.isArray(result) && result.length > 0) {
      const unitId = result[0].id;
      console.log('✅ Found unit ID:', unitId);
      console.log('📋 Unit name:', result[0].name);
      return unitId;
    }
    
    console.error('❌ No units found');
    return null;
  } catch (error) {
    console.error('❌ Error getting unit ID:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting endpoint tests...');
  console.log('🌐 API URL:', API_URL);
  
  // Get valid unit ID first
  const unitId = await getValidUnitId();
  
  if (!unitId) {
    console.error('❌ Cannot run tests without valid unit ID');
    return;
  }
  
  // Update test data with valid unit ID
  console.log('\n📝 Using unit ID:', unitId);
  
  // Run tests
  await testExternalTicketSubmit();
  await testSurveySubmit();
  
  console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);
