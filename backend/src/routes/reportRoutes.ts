import express from 'express';
import { 
  getReportData, 
  exportToPDF, 
  exportToExcel, 
  getUnits, 
  getCategories 
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticateToken);

// Get report data with filters
router.get('/', getReportData);

// Export routes
router.get('/export/pdf', exportToPDF);
router.get('/export/excel', exportToExcel);

// Get filter options
router.get('/units', getUnits);
router.get('/categories', getCategories);

export default router;