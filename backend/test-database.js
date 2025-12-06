import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testDatabase() {
  console.log('========================================');
  console.log('TESTING DATABASE OPERATIONS');
  console.log('========================================\n');

  try {
    // Test 1: Visitor Registration
    console.log('[1/4] Testing Visitor Registration...');
    const testVisitor = {
      nama: 'Test User ' + Date.now(),
      instansi: 'Test Company',
      jabatan: 'Tester',
      no_handphone: '081234567890',
      ip_address: '127.0.0.1',
    };

    const { data: visitor, error: visitorError } = await supabase
      .from('visitors')
      .insert(testVisitor)
      .select()
      .single();

    if (visitorError) {
      console.error('❌ Visitor registration failed:', visitorError.message);
      throw visitorError;
    }
    console.log('✅ Visitor registered successfully:', visitor.id);

    // Test 2: Game Score Submission
    console.log('\n[2/4] Testing Game Score Submission...');
    const testScore = {
      player_name: 'Test Player ' + Date.now(),
      score: 100,
      mode: 'single',
      level: 1,
      duration: 60,
      device_type: 'desktop',
    };

    const { data: score, error: scoreError } = await supabase
      .from('game_scores')
      .insert(testScore)
      .select()
      .single();

    if (scoreError) {
      console.error('❌ Game score submission failed:', scoreError.message);
      throw scoreError;
    }
    console.log('✅ Game score saved successfully:', score.id);

    // Test 3: Fetch Innovations
    console.log('\n[3/4] Testing Fetch Innovations...');
    const { data: innovations, error: innovationsError } = await supabase
      .from('innovations')
      .select('*')
      .limit(5);

    if (innovationsError) {
      console.error('❌ Fetch innovations failed:', innovationsError.message);
      throw innovationsError;
    }
    console.log('✅ Innovations fetched successfully:', innovations.length, 'items');

    // Test 4: Fetch Leaderboard
    console.log('\n[4/4] Testing Fetch Leaderboard...');
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('game_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (leaderboardError) {
      console.error('❌ Fetch leaderboard failed:', leaderboardError.message);
      throw leaderboardError;
    }
    console.log('✅ Leaderboard fetched successfully:', leaderboard.length, 'entries');

    // Cleanup test data
    console.log('\n[Cleanup] Removing test data...');
    await supabase.from('visitors').delete().eq('id', visitor.id);
    await supabase.from('game_scores').delete().eq('id', score.id);
    console.log('✅ Test data cleaned up');

    console.log('\n========================================');
    console.log('✅ ALL DATABASE TESTS PASSED!');
    console.log('========================================');
    process.exit(0);
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ DATABASE TEST FAILED!');
    console.error('========================================');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDatabase();
