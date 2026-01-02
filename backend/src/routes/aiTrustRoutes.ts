import { Router } from 'express';
import { aiTrustController } from '../controllers/aiTrustController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/ai-trust - Get all AI trust settings
router.get('/', aiTrustController.getAllSettings);

// GET /api/ai-trust/default - Get default settings
router.get('/default', aiTrustController.getDefaultSettings);

// GET /api/ai-trust/:id - Get setting by ID
router.get('/:id', aiTrustController.getSettingById);

// POST /api/ai-trust - Create new settings
router.post('/', aiTrustController.createSettings);

// PUT /api/ai-trust/default - Update default settings
router.put('/default', aiTrustController.updateDefaultSettings);

// PUT /api/ai-trust/:id - Update settings
router.put('/:id', aiTrustController.updateSettings);

export default router;