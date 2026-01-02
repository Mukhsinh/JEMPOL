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
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for QR code scanning)
router.get('/scan/:code', getQRCodeByCode);

// Protected routes (authentication required)
router.post('/', authenticateToken, createQRCode);
router.get('/', authenticateToken, getQRCodes);
router.get('/stats', authenticateToken, getQRCodeStats);
router.get('/:id', authenticateToken, getQRCodeByCode);
router.patch('/:id', authenticateToken, updateQRCode);
router.delete('/:id', authenticateToken, deleteQRCode);
router.get('/:id/analytics', authenticateToken, getQRCodeAnalyticsById);

export default router;