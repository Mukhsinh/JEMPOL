const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

const generateQRCode = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

async function createSampleQRCodes() {
  console.log('🚀 Creating sample QR codes...\n');

  try {
    // Get units first
    console.log('📦 Fetching units...');
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('id, name, code')
      .eq('is_active', true)
      .limit(5);

    if (unitsError) {
      console.error('❌ Error fetching units:', unitsError);
      return;
    }

    if (!units || units.length === 0) {
      console.log('⚠️ No active units found. Please create units first.');
      return;
    }

    console.log(`✅ Found ${units.length} units\n`);

    // Check existing QR codes
    const { data: existingQR } = await supabase
      .from('qr_codes')
      .select('id')
      .limit(1);

    if (existingQR && existingQR.length > 0) {
      console.log('ℹ️ QR codes already exist. Skipping creation.');
      console.log('   If you want to create more, delete existing ones first.\n');
      return;
    }

    // Create QR codes for each unit
    const qrCodes = [];
    const redirectTypes = ['selection', 'internal_ticket', 'external_ticket', 'survey'];

    for (let i = 0; i < Math.min(units.length, 3); i++) {
      const unit = units[i];
      const redirectType = redirectTypes[i % redirectTypes.length];
      
      const qrCode = {
        unit_id: unit.id,
        code: generateQRCode(),
        token: generateToken(),
        name: `QR ${unit.name}`,
        description: `QR Code untuk ${unit.name} - ${redirectType}`,
        is_active: true,
        usage_count: 0,
        redirect_type: redirectType,
        auto_fill_unit: true,
        show_options: ['internal_ticket', 'external_ticket', 'survey']
      };

      qrCodes.push(qrCode);
      console.log(`📱 Creating QR for ${unit.name} (${redirectType})...`);
    }

    // Insert QR codes
    const { data: insertedQR, error: insertError } = await supabase
      .from('qr_codes')
      .insert(qrCodes)
      .select();

    if (insertError) {
      console.error('❌ Error creating QR codes:', insertError);
      return;
    }

    console.log(`\n✅ Successfully created ${insertedQR.length} QR codes!\n`);

    // Display created QR codes
    insertedQR.forEach((qr, index) => {
      console.log(`${index + 1}. ${qr.name}`);
      console.log(`   Code: ${qr.code}`);
      console.log(`   Type: ${qr.redirect_type}`);
      console.log(`   URL: http://localhost:3003/m/${qr.code}\n`);
    });

    // Initialize analytics for each QR code
    const today = new Date().toISOString().split('T')[0];
    const analytics = insertedQR.map(qr => ({
      qr_code_id: qr.id,
      scan_date: today,
      scan_count: 0,
      ticket_count: 0,
      unique_visitors: 0
    }));

    await supabase
      .from('qr_code_analytics')
      .insert(analytics);

    console.log('✅ Analytics initialized\n');
    console.log('🎉 Sample QR codes created successfully!');
    console.log('   Open http://localhost:3003/settings/qr-link to view them.\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

createSampleQRCodes();
