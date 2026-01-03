import { Router } from 'express';
import {
    submitPublicSurvey,
    getPublicUnits,
    getPublicServiceCategories,
    getSurveyStats
} from '../controllers/publicSurveyController.js';

const router = Router();

// Survey endpoints
router.post('/survey/submit', submitPublicSurvey);
router.get('/surveys/stats', getSurveyStats);

// These might be handled by publicRoutes.ts if mounted first, 
// but we define them here just in case or for specific survey needs if paths differ
// router.get('/units', getPublicUnits);
// router.get('/service-categories', getPublicServiceCategories);

export default router;