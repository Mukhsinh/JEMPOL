import { Router } from 'express';
import { responseTemplatesController } from '../controllers/responseTemplatesController.js';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateSupabase);

// GET /api/response-templates - Get all templates
router.get('/', responseTemplatesController.getAllTemplates);

// GET /api/response-templates/:id - Get template by ID
router.get('/:id', responseTemplatesController.getTemplateById);

// POST /api/response-templates - Create new template
router.post('/', responseTemplatesController.createTemplate);

// PUT /api/response-templates/:id - Update template
router.put('/:id', responseTemplatesController.updateTemplate);

// DELETE /api/response-templates/:id - Delete template
router.delete('/:id', responseTemplatesController.deleteTemplate);

export default router;