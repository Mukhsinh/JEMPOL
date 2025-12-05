import express from 'express';
import {
  registerVisitor,
  getAllVisitors,
  deleteVisitor,
  getVisitorStats,
} from '../controllers/visitorController.js';

const router = express.Router();

// POST /api/visitors - Register new visitor
router.post('/', registerVisitor);

// GET /api/visitors - Get all visitors (admin)
router.get('/', getAllVisitors);

// GET /api/visitors/stats - Get visitor statistics
router.get('/stats', getVisitorStats);

// DELETE /api/visitors/:id - Delete visitor
router.delete('/:id', deleteVisitor);

export default router;
