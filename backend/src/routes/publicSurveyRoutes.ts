import { Router } from 'express';
import {
    submitPublicSurvey,
    getPublicUnits,
    getPublicServiceCategories,
    getSurveyStats,
    getSurveyResponses,
    getIKMByUnit
} from '../controllers/publicSurveyController.js';

const router = Router();

// Survey endpoints - support multiple paths for compatibility
router.post('/survey/submit', submitPublicSurvey);
router.post('/surveys', submitPublicSurvey); // Alias untuk SurveyForm.tsx
router.get('/surveys/stats', getSurveyStats);
router.get('/surveys/responses', getSurveyResponses);
router.get('/surveys/ikm-by-unit', getIKMByUnit);

// Public data endpoints
router.get('/units', getPublicUnits);
router.get('/service-categories', getPublicServiceCategories);

export default router;