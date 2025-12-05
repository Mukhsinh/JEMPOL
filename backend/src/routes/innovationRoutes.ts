import express from 'express';
import {
  getAllInnovations,
  uploadInnovation,
  deleteInnovation,
  incrementView,
} from '../controllers/innovationController.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// GET /api/innovations - Get all innovations
router.get('/', getAllInnovations);

// POST /api/innovations - Upload new innovation
router.post('/', upload.single('file'), uploadInnovation);

// DELETE /api/innovations/:id - Delete innovation
router.delete('/:id', deleteInnovation);

// POST /api/innovations/:id/view - Increment view count
router.post('/:id/view', incrementView);

export default router;
