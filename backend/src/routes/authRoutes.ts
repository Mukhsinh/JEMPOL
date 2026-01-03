import express from 'express';
import { login, logout } from '../controllers/authController.js';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';


const router = express.Router();

// POST /api/auth/login - Admin login
router.post('/login', login);

// GET /api/auth/verify - Verify token
router.get('/verify', authenticateSupabase, (req: any, res: any) => {
    res.json({
        success: true,
        user: req.user || req.admin
    });
});

// POST /api/auth/logout - Logout
router.post('/logout', logout);

export default router;
