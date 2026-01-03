import fs from 'fs';
console.log('Script started');
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from backend root
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

console.log('Supabase initialized');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndPrintMigration(tableName, sqlFile) {
    console.log(`Checking table: ${tableName}...`);
    try {
        const { error } = await supabase.from(tableName).select('id').limit(1);

        if (error && (error.code === '42P01' || error.message.includes('Could not find the table'))) {
            console.log(`❌ Table '${tableName}' does not exist.`);
            console.log(`\n═══════════════════════════════════════════════════════`);
            console.log(`  PLEASE RUN THIS SQL IN SUPABASE DASHBOARD`);
            console.log(`  File: backend/sql/${path.basename(sqlFile)}`);
            console.log(`═══════════════════════════════════════════════════════\n`);

            if (fs.existsSync(sqlFile)) {
                const sql = fs.readFileSync(sqlFile, 'utf8');
                console.log(sql);
            } else {
                console.log(`SQL file not found: ${sqlFile}`);
            }
            console.log(`\n═══════════════════════════════════════════════════════\n`);
        } else if (error) {
            console.error(`Error checking table '${tableName}':`, error.message);
        } else {
            console.log(`✅ Table '${tableName}' already exists.`);
        }
    } catch (err) {
        console.error(`Exception checking table ${tableName}:`, err);
    }
}

async function main() {
    console.log('Main started');
    const sqlDir = path.join(__dirname, 'sql');
    console.log('SQL Dir:', sqlDir);

    await checkAndPrintMigration('ebook_sections', path.join(sqlDir, '06_ebook_and_notification_settings.sql'));
    await checkAndPrintMigration('notification_settings', path.join(sqlDir, '06_ebook_and_notification_settings.sql'));
    await checkAndPrintMigration('game_scores', path.join(sqlDir, '07_game_scores.sql'));

    console.log(`Checking columns in 'tiket'...`);
    try {
        const { error: colError } = await supabase.from('tiket').select('category_id').limit(1);
        if (colError) {
            console.log(`❌ Column 'category_id' missing in 'tiket' (or table missing).`);
            console.log(`\n═══════════════════════════════════════════════════════`);
            console.log(`  PLEASE RUN THIS SQL IN SUPABASE DASHBOARD`);
            console.log(`  File: backend/sql/08_fix_ticket_schema.sql`);
            console.log(`═══════════════════════════════════════════════════════\n`);
            if (fs.existsSync(path.join(sqlDir, '08_fix_ticket_schema.sql'))) {
                const sql = fs.readFileSync(path.join(sqlDir, '08_fix_ticket_schema.sql'), 'utf8');
                console.log(sql);
            }
            console.log(`\n═══════════════════════════════════════════════════════\n`);
        } else {
            console.log(`✅ Column 'category_id' exists in 'tiket'.`);
        }
    } catch (e) {
        console.error("Error checking tiket columns:", e);
    }

    console.log('Main finished');
}

main().catch(err => console.error('Main error:', err));
