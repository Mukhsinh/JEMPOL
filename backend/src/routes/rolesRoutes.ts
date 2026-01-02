import { Router } from 'express';
import { rolesController } from '../controllers/rolesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/roles - Get all roles
router.get('/', rolesController.getAllRoles);

// GET /api/roles/:id/users - Get users with specific role (must be before /:id)
router.get('/:id/users', rolesController.getUsersByRole);

// GET /api/roles/:id - Get role by ID
router.get('/:id', rolesController.getRoleById);

// POST /api/roles - Create new role
router.post('/', rolesController.createRole);

// PUT /api/roles/:id - Update role
router.put('/:id', rolesController.updateRole);

// DELETE /api/roles/:id - Delete role
router.delete('/:id', rolesController.deleteRole);

export default router;