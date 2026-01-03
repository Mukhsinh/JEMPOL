import { Router } from 'express';
import { authenticateToken } from '../middleware/authRobust.js';

const router = Router();

// Endpoint untuk verifikasi token
router.get('/verify', authenticateToken, (req: any, res) => {
  try {
    console.log('✅ Token verification successful for:', req.admin?.email);
    
    res.json({
      success: true,
      message: 'Token valid',
      data: {
        user: req.user,
        admin: req.admin
      }
    });
  } catch (error: any) {
    console.error('❌ Token verification endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat verifikasi token'
    });
  }
});

// Endpoint untuk refresh token
router.post('/refresh', authenticateToken, (req: any, res) => {
  try {
    console.log('✅ Token refresh successful for:', req.admin?.email);
    
    res.json({
      success: true,
      message: 'Token masih valid',
      data: {
        user: req.user,
        admin: req.admin
      }
    });
  } catch (error: any) {
    console.error('❌ Token refresh endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat refresh token'
    });
  }
});

export default router;