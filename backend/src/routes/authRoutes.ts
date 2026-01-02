import express from 'express';
import { login, verifyToken, logout } from '../controllers/authControllerSimple.js';

const router = express.Router();

// POST /api/auth/login - Admin login
router.post('/login', login);

// GET /api/auth/verify - Verify token
router.get('/verify', verifyToken);

// POST /api/auth/logout - Logout
router.post('/logout', logout);

export default router;
