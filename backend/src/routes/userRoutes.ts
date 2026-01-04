import { Router } from 'express';
import userController from '../controllers/userController.js';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuthMiddleware.js';

const router = Router();

// Public routes (no auth required)
router.get('/public', userController.getUsers.bind(userController));
router.get('/public/units', userController.getUnits.bind(userController));
router.get('/public/roles', userController.getRoles.bind(userController));

// Semi-protected GET routes (optional auth - works with or without valid token)
router.get('/', optionalSupabaseAuth, userController.getUsers.bind(userController));
router.get('/units', optionalSupabaseAuth, userController.getUnits.bind(userController));
router.get('/roles', optionalSupabaseAuth, userController.getRoles.bind(userController));
router.get('/:id', optionalSupabaseAuth, userController.getUserById.bind(userController));

// Protected write routes (require authentication)
router.post('/', authenticateSupabase, userController.createUser.bind(userController));
router.put('/:id', authenticateSupabase, userController.updateUser.bind(userController));
router.delete('/:id', authenticateSupabase, userController.deleteUser.bind(userController));

export default router;
