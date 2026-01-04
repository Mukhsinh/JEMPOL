import express from 'express';
import {
  getReportData,
  exportToPDF,
  exportToExcel,
  getUnits,
  getCategories,
  getSurveyReports,
  getSurveyStats,
  exportSurveyReport
} from '../controllers/reportController.js';
import { authenticateSupabase } from '../middleware/supabaseAuthMiddleware.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticateSupabase);

// Get report data with filters
router.get('/', getReportData);

// Survey routes
router.get('/surveys', getSurveyReports);
router.get('/surveys/stats', getSurveyStats);
router.get('/surveys/export', exportSurveyReport);

// Export routes
router.get('/export/pdf', exportToPDF);
router.get('/export/excel', exportToExcel);

// Get filter options
router.get('/units', getUnits);
router.get('/categories', getCategories);

export default router;