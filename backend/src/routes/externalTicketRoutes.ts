import express from 'express';
import {
  createExternalTicket,
  getExternalTickets,
  getExternalTicketById,
  updateExternalTicketStatus,
  getExternalTicketStats,
  uploadMiddleware
} from '../controllers/externalTicketController.js';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/', uploadMiddleware, createExternalTicket);

// Protected routes (authentication required)
router.get('/', authenticateSupabase, getExternalTickets);
router.get('/stats', authenticateSupabase, getExternalTicketStats);
router.get('/:id', authenticateSupabase, getExternalTicketById);
router.patch('/:id/status', authenticateSupabase, updateExternalTicketStatus);

export default router;