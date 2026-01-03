import { Router } from 'express';
import userController from '../controllers/userController.js';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';

const router = Router();

// Test routes without auth (for development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/test', userController.getUsers.bind(userController));
  router.get('/test/units', userController.getUnits.bind(userController));
  router.post('/test', userController.createUser.bind(userController));
  router.put('/test/:id', userController.updateUser.bind(userController));
  router.delete('/test/:id', userController.deleteUser.bind(userController));
}

// Apply authentication middleware to all protected routes
router.use(authenticateSupabase);

// Get all users
router.get('/', userController.getUsers.bind(userController));

// Get all units for dropdown
router.get('/units', userController.getUnits.bind(userController));

// Get user by ID
router.get('/:id', userController.getUserById.bind(userController));

// Create new user
router.post('/', userController.createUser.bind(userController));

// Update user
router.put('/:id', userController.updateUser.bind(userController));

// Delete user (soft delete)
router.delete('/:id', userController.deleteUser.bind(userController));

export default router;