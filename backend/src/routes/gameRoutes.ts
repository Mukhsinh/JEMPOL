import express from 'express';
import { submitScore, getLeaderboard } from '../controllers/gameController.js';

const router = express.Router();

// POST /api/game/score - Submit game score
router.post('/score', submitScore);

// GET /api/game/leaderboard - Get leaderboard
router.get('/leaderboard', getLeaderboard);

export default router;
