// Quick test script for bulk photo upload
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testBulkUpload() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Check if we can connect
  const { data: testData, error: testError } = await supabase
    .from('innovations')
    .select('count')
    .limit(1);
    
  if (testError) {
    console.error('Connection error:', testError);
    return;
  }
  
  console.log('✓ Connection successful');
  
  // Test 2: Try to insert a test photo
  console.log('\nTesting photo insert...');
  const testPhoto = {
    title: 'Test Photo - Foto 1',
    description: 'Test description',
    type: 'photo',
    category: 'photo',
    file_url: '/uploads/test.jpg',
    file_name: 'test.jpg',
    file_size: 1024,
    mime_type: 'image/jpeg',
    uploaded_by: 'admin',
  };
  
  console.log('Insert data:', testPhoto);
  
  const { data, error } = await supabase
    .from('innovations')
    .insert(testPhoto)
    .select()
    .single();
    
  if (error) {
    console.error('✗ Insert error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✓ Insert successful:', data.id);
    
    // Clean up - delete test record
    await supabase.from('innovations').delete().eq('id', data.id);
    console.log('✓ Test record cleaned up');
  }
}

testBulkUpload().catch(console.error);
