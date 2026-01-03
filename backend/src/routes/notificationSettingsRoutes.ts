import express from 'express';
import { getNotificationSettings, updateNotificationSetting, bulkUpdateNotificationSettings } from '../controllers/notificationSettingsController.js';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';

const router = express.Router();

router.use(authenticateSupabase);

router.get('/', getNotificationSettings);
router.put('/bulk', bulkUpdateNotificationSettings);
router.put('/:id', updateNotificationSetting);

export default router;
