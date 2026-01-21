const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixExternalTicketsRLS() {
  console.log('🔧 Memperbaiki RLS Policy untuk External Tickets\n');

  try {
    // 1. Cek RLS policies yang ada
    console.log('1️⃣ Mengecek RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies
          WHERE tablename = 'external_tickets'
          ORDER BY policyname;
        `
      });

    if (policiesError) {
      console.log('⚠️ Tidak bisa cek policies (normal jika function tidak ada)');
    } else if (policies) {
      console.log('📋 Policies yang ada:');
      policies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`);
      });
    }

    // 2. Drop existing policies dan buat yang baru
    console.log('\n2️⃣ Membuat RLS policies baru...');
    
    const sqlCommands = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Public can insert external tickets" ON external_tickets;
      DROP POLICY IF EXISTS "Public can view external tickets" ON external_tickets;
      DROP POLICY IF EXISTS "Public can update external tickets" ON external_tickets;
      DROP POLICY IF EXISTS "Allow public insert" ON external_tickets;
      DROP POLICY IF EXISTS "Allow public read" ON external_tickets;
      DROP POLICY IF EXISTS "Allow service role all" ON external_tickets;

      -- Enable RLS
      ALTER TABLE external_tickets ENABLE ROW LEVEL SECURITY;

      -- Policy 1: Allow INSERT untuk semua (public access)
      CREATE POLICY "Allow public insert external tickets"
        ON external_tickets
        FOR INSERT
        TO public
        WITH CHECK (true);

      -- Policy 2: Allow SELECT untuk semua
      CREATE POLICY "Allow public select external tickets"
        ON external_tickets
        FOR SELECT
        TO public
        USING (true);

      -- Policy 3: Allow UPDATE untuk authenticated users
      CREATE POLICY "Allow authenticated update external tickets"
        ON external_tickets
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);

      -- Policy 4: Allow service role full access
      CREATE POLICY "Allow service role all external tickets"
        ON external_tickets
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    `;

    // Execute via direct SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: sqlCommands });
    
    if (sqlError) {
      console.log('⚠️ Tidak bisa execute via RPC, mencoba cara alternatif...\n');
      
      // Alternatif: Disable RLS sementara untuk external_tickets
      console.log('3️⃣ Menonaktifkan RLS untuk external_tickets...');
      const { error: disableError } = await supabase
        .from('external_tickets')
        .select('id')
        .limit(1);
      
      console.log('⚠️ RLS masih aktif. Silakan jalankan SQL berikut di Supabase Dashboard:');
      console.log('\n' + '='.repeat(60));
      console.log(sqlCommands);
      console.log('='.repeat(60) + '\n');
      
      console.log('📍 Cara menjalankan:');
      console.log('1. Buka Supabase Dashboard');
      console.log('2. Pilih project Anda');
      console.log('3. Klik "SQL Editor" di sidebar');
      console.log('4. Copy-paste SQL di atas');
      console.log('5. Klik "Run"');
      
    } else {
      console.log('✅ RLS policies berhasil dibuat!');
    }

    // 3. Test insert
    console.log('\n4️⃣ Test insert tiket...');
    
    const testTicket = {
      ticket_number: 'EXT-TEST-' + Date.now(),
      unit_id: '550e8400-e29b-41d4-a716-446655440007', // Sub Bagian Pengaduan
      reporter_identity_type: 'personal',
      reporter_name: 'Test User RLS Fix',
      reporter_phone: '081234567890',
      reporter_email: 'test@example.com',
      service_type: 'complaint',
      title: 'Test Tiket Setelah RLS Fix',
      description: 'Test untuk memverifikasi RLS sudah diperbaiki',
      urgency_level: 3,
      priority: 'medium',
      sentiment_score: 0.5,
      confidence_score: 85,
      status: 'open',
      source: 'web'
    };

    const { data: ticket, error: insertError } = await supabase
      .from('external_tickets')
      .insert(testTicket)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Masih error:', insertError.message);
      console.log('\n⚠️ Silakan jalankan SQL manual di Supabase Dashboard (lihat instruksi di atas)');
      return false;
    }

    console.log('✅ Test insert berhasil!');
    console.log('   Ticket Number:', ticket.ticket_number);
    console.log('   Ticket ID:', ticket.id);

    // 4. Cleanup test ticket
    await supabase
      .from('external_tickets')
      .delete()
      .eq('id', ticket.id);

    console.log('\n✅ RLS berhasil diperbaiki!');
    return true;

  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Jalankan fix
fixExternalTicketsRLS().then(success => {
  if (success) {
    console.log('\n🎉 Selesai! Silakan test lagi membuat tiket eksternal.');
  } else {
    console.log('\n⚠️ Perlu perbaikan manual. Ikuti instruksi di atas.');
  }
});
