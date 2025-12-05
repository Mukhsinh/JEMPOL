import express from 'express';
import {
  registerVisitor,
  getAllVisitors,
  exportVisitors,
} from '../controllers/visitorController.js';

const router = express.Router();

// POST /api/visitors - Register new visitor
router.post('/', registerVisitor);

// GET /api/visitors - Get all visitors (admin)
router.get('/', getAllVisitors);

// GET /api/visitors/export - Export visitors to CSV
router.get('/export', exportVisitors);

export default router;
