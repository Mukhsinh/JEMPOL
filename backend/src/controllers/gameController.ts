import { Request, Response } from 'express';
import GameScore from '../models/GameScore.js';

/**
 * Submit game score
 * POST /api/game/score
 */
export const submitScore = async (req: Request, res: Response) => {
  try {
    const { playerName, score, mode, level, duration, deviceType } = req.body;

    if (!playerName || score === undefined || !mode || !duration || !deviceType) {
      return res.status(400).json({
        success: false,
        error: 'Data tidak lengkap',
      });
    }

    const gameScore = new GameScore({
      playerName: playerName.trim(),
      score,
      mode,
      level: level || 1,
      duration,
      deviceType,
    });

    await gameScore.save();

    res.status(201).json({
      success: true,
      data: gameScore,
      message: 'Skor berhasil disimpan',
    });
  } catch (error: any) {
    console.error('Error submitting score:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

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
    const { mode, limit = 50 } = req.query;

    const query: any = {};
    if (mode && (mode === 'single' || mode === 'multiplayer')) {
      query.mode = mode;
    }

    const leaderboard = await GameScore.find(query)
      .sort({ score: -1, playedAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil leaderboard',
    });
  }
};
