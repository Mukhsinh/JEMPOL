import express from 'express';
import { AppSettingsController } from '../controllers/appSettingsController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT } from '../middleware/jwtAuth';

const router = express.Router();
const appSettingsController = new AppSettingsController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Protected routes (require authentication)
router.get('/', authenticateJWT, appSettingsController.getSettings.bind(appSettingsController));
router.post('/', authenticateJWT, appSettingsController.updateSettings.bind(appSettingsController));
router.put('/', authenticateJWT, appSettingsController.updateSettings.bind(appSettingsController));
router.put('/:key', authenticateJWT, appSettingsController.updateSetting.bind(appSettingsController));
router.post('/upload-logo', authenticateJWT, upload.single('logo'), appSettingsController.uploadLogo.bind(appSettingsController));

// Public routes
router.get('/public', appSettingsController.getPublicSettings.bind(appSettingsController));

export default router;