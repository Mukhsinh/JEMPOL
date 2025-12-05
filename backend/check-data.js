import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  try {
    console.log('Checking innovations data...\n');
    
    const { data, error } = await supabase
      .from('innovations')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    console.log(`Total innovations: ${data?.length || 0}\n`);

    if (data && data.length > 0) {
      data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Type: ${item.type}`);
        console.log(`   File: ${item.file_name}`);
        console.log(`   URL: ${item.file_url}`);
        console.log(`   Uploaded: ${item.uploaded_at}`);
        console.log('');
      });
    } else {
      console.log('No data found. Database is empty.');
    }

    // Check by type
    console.log('\n--- By Type ---');
    const types = ['powerpoint', 'pdf', 'video', 'photo'];
    for (const type of types) {
      const { data: typeData } = await supabase
        .from('innovations')
        .select('id')
        .eq('type', type);
      console.log(`${type}: ${typeData?.length || 0}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();
