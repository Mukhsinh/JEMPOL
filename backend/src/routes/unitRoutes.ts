import { Router } from 'express';
import unitController from '../controllers/unitController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Units management
router.get('/', unitController.getUnits.bind(unitController));
router.post('/', unitController.createUnit.bind(unitController));
router.put('/:id', unitController.updateUnit.bind(unitController));
router.delete('/:id', unitController.deleteUnit.bind(unitController));

// Master data endpoints
router.get('/unit-types', unitController.getUnitTypes.bind(unitController));
router.get('/service-categories', unitController.getServiceCategories.bind(unitController));
router.get('/ticket-types', unitController.getTicketTypes.bind(unitController));
router.get('/ticket-statuses', unitController.getTicketStatuses.bind(unitController));
router.get('/patient-types', unitController.getPatientTypes.bind(unitController));
router.get('/sla-settings', unitController.getSlaSettings.bind(unitController));

// AI trust settings
router.get('/ai-trust-settings', unitController.getAiTrustSettings.bind(unitController));
router.put('/ai-trust-settings', unitController.updateAiTrustSettings.bind(unitController));

export default router;