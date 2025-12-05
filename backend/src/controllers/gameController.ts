import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

/**
 * Submit game score
 * POST /api/game/scores
 */
export const submitScore = async (req: Request, res: Response) => {
  try {
    const { player_name, score, mode, level, duration, device_type } = req.body;

    // Validation
    if (!player_name || score === undefined || !mode || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Data tidak lengkap',
      });
    }

    if (score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Skor tidak valid',
      });
    }

    if (!['single', 'multiplayer'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Mode tidak valid',
      });
    }

    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        player_name: player_name.trim(),
        score,
        mode,
        level: level || 1,
        duration,
        device_type: device_type || 'desktop',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Skor berhasil disimpan',
    });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat menyimpan skor',
    });
  }
};

/**
 * Get leaderboard
 * GET /api/game/leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { mode, limit = '10' } = req.query;

    let query = supabase
      .from('game_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(parseInt(limit as string));

    if (mode && ['single', 'multiplayer'].includes(mode as string)) {
      query = query.eq('mode', mode);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil leaderboard',
    });
  }
};

/**
 * Get game statistics
 * GET /api/game/stats
 */
export const getGameStats = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('game_scores')
      .select('*');

    if (error) {
      throw error;
    }

    const stats = {
      totalGames: data?.length || 0,
      totalPlayers: new Set(data?.map((s: any) => s.player_name)).size || 0,
      averageScore: data?.length
        ? Math.round(data.reduce((sum: number, s: any) => sum + s.score, 0) / data.length)
        : 0,
      highestScore: data?.length
        ? Math.max(...data.map((s: any) => s.score))
        : 0,
      singlePlayerGames: data?.filter((s: any) => s.mode === 'single').length || 0,
      multiplayerGames: data?.filter((s: any) => s.mode === 'multiplayer').length || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil statistik',
    });
  }
};

/**
 * Delete game score
 * DELETE /api/game/scores/:id
 */
export const deleteScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('game_scores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      success: true,
      message: 'Skor berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting score:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat menghapus skor',
    });
  }
};
