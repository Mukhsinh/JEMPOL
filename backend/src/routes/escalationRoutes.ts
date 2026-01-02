import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getEscalationRules,
  getEscalationRule,
  createEscalationRule,
  updateEscalationRule,
  toggleEscalationRuleStatus,
  deleteEscalationRule,
  getEscalationLogs,
  executeEscalationRule
} from '../controllers/escalationController.js';

const router = Router();

router.use(authenticateToken);

router.get('/rules', getEscalationRules);
router.get('/rules/:id', getEscalationRule);
router.post('/rules', createEscalationRule);
router.put('/rules/:id', updateEscalationRule);
router.patch('/rules/:id/toggle', toggleEscalationRuleStatus);
router.delete('/rules/:id', deleteEscalationRule);
router.get('/logs', getEscalationLogs);
router.post('/rules/:id/execute', executeEscalationRule);

export default router;