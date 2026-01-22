import { Router } from 'express';
import unitController from '../controllers/unitController.js';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuthMiddleware.js';
import multer from 'multer';

// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

// Units management - GET uses optionalSupabaseAuth for fallback support
router.get('/', optionalSupabaseAuth, unitController.getUnits.bind(unitController));

// Protected write operations require full authentication
router.post('/', authenticateSupabase, unitController.createUnit.bind(unitController));
router.put('/:id', authenticateSupabase, unitController.updateUnit.bind(unitController));
router.delete('/:id', authenticateSupabase, unitController.deleteUnit.bind(unitController));

// Import endpoint
router.post('/import', authenticateSupabase, upload.single('file'), unitController.importUnits.bind(unitController));

// Master data endpoints - use optionalSupabaseAuth for read operations
router.get('/unit-types', optionalSupabaseAuth, unitController.getUnitTypes.bind(unitController));
router.get('/service-categories', optionalSupabaseAuth, unitController.getServiceCategories.bind(unitController));
router.get('/ticket-types', optionalSupabaseAuth, unitController.getTicketTypes.bind(unitController));
router.get('/ticket-statuses', optionalSupabaseAuth, unitController.getTicketStatuses.bind(unitController));
router.get('/patient-types', optionalSupabaseAuth, unitController.getPatientTypes.bind(unitController));
router.get('/sla-settings', optionalSupabaseAuth, unitController.getSlaSettings.bind(unitController));

// AI trust settings - GET uses optionalSupabaseAuth, PUT requires authentication
router.get('/ai-trust-settings', optionalSupabaseAuth, unitController.getAiTrustSettings.bind(unitController));
router.put('/ai-trust-settings', authenticateSupabase, unitController.updateAiTrustSettings.bind(unitController));

export default router;