import express from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRCodeByCode,
  updateQRCode,
  deleteQRCode,
  getQRCodeAnalyticsById,
  getQRCodeStats
} from '../controllers/qrCodeController.js';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuthMiddleware.js';

const router = express.Router();

// Public routes (for QR code scanning)
router.get('/scan/:code', getQRCodeByCode);

// Protected routes (authentication required for write operations)
router.post('/', authenticateSupabase, createQRCode);

// GET routes use optionalAuth - allows fallback to work when token is invalid
// But the controller should check for auth if needed
router.get('/', optionalSupabaseAuth, getQRCodes);
router.get('/stats', optionalSupabaseAuth, getQRCodeStats);
router.get('/:id', optionalSupabaseAuth, getQRCodeByCode);
router.get('/:id/analytics', optionalSupabaseAuth, getQRCodeAnalyticsById);

// Write operations require full authentication
router.patch('/:id', authenticateSupabase, updateQRCode);
router.delete('/:id', authenticateSupabase, deleteQRCode);

export default router;