import express, { Request, Response, NextFunction } from 'express';
import {
  getAllInnovations,
  uploadInnovation,
  deleteInnovation,
  incrementView,
} from '../controllers/innovationController.js';
import { upload } from '../config/multer.js';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';

const router = express.Router();

// GET /api/innovations - Get all innovations
router.get('/', getAllInnovations);

// POST /api/innovations/bulk-photos - Upload multiple photos (must be before /:id routes)
router.post('/bulk-photos', authenticateSupabase, (req: Request, res: Response, next: NextFunction) => {
  upload.array('files', 10)(req, res, (err: any) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Ukuran file terlalu besar. Maksimal 50MB per foto.',
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Terjadi kesalahan saat mengupload file',
      });
    }
    next();
  });
}, uploadInnovation);

// POST /api/innovations - Upload new innovation
router.post('/', authenticateSupabase, (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Ukuran file terlalu besar. Maksimal 50MB.',
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Terjadi kesalahan saat mengupload file',
      });
    }
    next();
  });
}, uploadInnovation);

// DELETE /api/innovations/:id - Delete innovation
router.delete('/:id', authenticateSupabase, deleteInnovation);

// POST /api/innovations/:id/view - Increment view count
router.post('/:id/view', incrementView);

export default router;
