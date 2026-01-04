import { Router } from 'express';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';
import {
  getEscalationRules,
  getEscalationRule,
  createEscalationRule,
  updateEscalationRule,
  toggleEscalationRuleStatus,
  deleteEscalationRule,
  getEscalationLogs,
  executeEscalationRule,
  getEscalationStats
} from '../controllers/escalationController.js';

const router = Router();

// Public endpoints (no auth required) for basic data
router.get('/public/rules', getEscalationRules);
router.get('/public/stats', getEscalationStats);

// Endpoint untuk kompatibilitas frontend
router.get('/', getEscalationRules); // untuk /api/escalation-rules
router.get('/stats', getEscalationStats); // untuk /api/escalation-stats (tanpa auth untuk sementara)

// Apply authentication middleware to protected routes
router.use(authenticateSupabase);

router.get('/rules', getEscalationRules);
router.get('/rules/:id', getEscalationRule);
router.post('/rules', createEscalationRule);
router.put('/rules/:id', updateEscalationRule);
router.patch('/rules/:id/toggle', toggleEscalationRuleStatus);
router.delete('/rules/:id', deleteEscalationRule);
router.get('/logs', getEscalationLogs);
router.get('/stats', getEscalationStats);
router.post('/rules/:id/execute', executeEscalationRule);

export default router;