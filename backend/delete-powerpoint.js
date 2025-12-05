import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deletePowerPointFiles() {
  try {
    console.log('Fetching PowerPoint files from database...');
    
    // Get all PowerPoint files
    const { data: powerpoints, error } = await supabase
      .from('innovations')
      .select('*')
      .eq('type', 'powerpoint');

    if (error) {
      console.error('Error fetching PowerPoint files:', error);
      return;
    }

    console.log(`Found ${powerpoints?.length || 0} PowerPoint files`);

    if (!powerpoints || powerpoints.length === 0) {
      console.log('No PowerPoint files to delete');
      return;
    }

    // Delete each PowerPoint file
    for (const ppt of powerpoints) {
      console.log(`\nDeleting: ${ppt.title}`);
      console.log(`  ID: ${ppt.id}`);
      console.log(`  File: ${ppt.file_name}`);
      console.log(`  URL: ${ppt.file_url}`);

      // Delete file from disk
      const filePath = path.join(__dirname, '..', ppt.file_url);
      try {
        await fs.unlink(filePath);
        console.log(`  ✓ File deleted from disk`);
      } catch (fileError) {
        console.log(`  ⚠ File not found on disk (may already be deleted)`);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('innovations')
        .delete()
        .eq('id', ppt.id);

      if (deleteError) {
        console.error(`  ✗ Error deleting from database:`, deleteError);
      } else {
        console.log(`  ✓ Deleted from database`);
      }
    }

    console.log('\n✅ All PowerPoint files have been deleted');
  } catch (error) {
    console.error('Error:', error);
  }
}

deletePowerPointFiles();
