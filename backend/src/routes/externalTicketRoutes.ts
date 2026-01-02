import express from 'express';
import {
  createExternalTicket,
  getExternalTickets,
  getExternalTicketById,
  updateExternalTicketStatus,
  getExternalTicketStats,
  uploadMiddleware
} from '../controllers/externalTicketController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.post('/', uploadMiddleware, createExternalTicket);

// Protected routes (authentication required)
router.get('/', authenticateToken, getExternalTickets);
router.get('/stats', authenticateToken, getExternalTicketStats);
router.get('/:id', authenticateToken, getExternalTicketById);
router.patch('/:id/status', authenticateToken, updateExternalTicketStatus);

export default router;