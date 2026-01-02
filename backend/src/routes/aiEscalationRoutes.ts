import express from 'express';
import {
  createEscalationRule,
  getEscalationRules,
  getEscalationRuleById,
  updateEscalationRule,
  deleteEscalationRule,
  executeEscalationRule,
  getEscalationStats,
  getEscalationLogs,
  checkAutoEscalation
} from '../controllers/aiEscalationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Escalation rules CRUD
router.post('/rules', createEscalationRule);
router.get('/rules', getEscalationRules);
router.get('/rules/:id', getEscalationRuleById);
router.patch('/rules/:id', updateEscalationRule);
router.delete('/rules/:id', deleteEscalationRule);

// Escalation execution
router.post('/execute', executeEscalationRule);
router.post('/check-auto', checkAutoEscalation);

// Statistics and logs
router.get('/stats', getEscalationStats);
router.get('/logs', getEscalationLogs);

export default router;