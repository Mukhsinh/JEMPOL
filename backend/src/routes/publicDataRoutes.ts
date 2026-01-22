import { Router } from 'express';
import * as masterDataController from '../controllers/masterDataController.js';
import unitController from '../controllers/unitController.js';
import supabase from '../config/supabase.js';

const router = Router();

// Public endpoints untuk data yang bisa diakses tanpa autentikasi
// Ini adalah fallback ketika endpoint utama gagal karena masalah token

// Master data public endpoints
router.get('/unit-types', masterDataController.getUnitTypes);
router.get('/service-categories', masterDataController.getServiceCategories);
router.get('/ticket-types', masterDataController.getTicketTypes);
router.get('/ticket-classifications', masterDataController.getTicketClassifications);
router.get('/ticket-statuses', masterDataController.getTicketStatuses);
router.get('/patient-types', masterDataController.getPatientTypes);
router.get('/roles', masterDataController.getRoles);
router.get('/sla-settings', masterDataController.getSLASettings);

// Units public endpoints - simplified untuk form publik
router.get('/units', async (req, res) => {
  try {
    // Set response header untuk memastikan JSON response
    res.setHeader('Content-Type', 'application/json');
    
    console.log('🔄 GET /api/public/units dipanggil (publicDataRoutes)');
    
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, code, description')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching public units:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data unit',
        data: []
      });
    }

    console.log('✅ Fetched units:', units?.length || 0);

    // Return dengan format yang konsisten
    return res.status(200).json({
      success: true,
      data: units || []
    });
  } catch (error: any) {
    console.error('❌ Error in get public units:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: []
    });
  }
});

// QR codes public endpoints (read-only)
router.get('/qr-codes', async (req, res) => {
  try {
    const { page = 1, limit = 10, unit_id, is_active, search, include_analytics } = req.query;
    
    let query = supabase
      .from('qr_codes')
      .select(`
        id, code, token, name, description, is_active, usage_count, 
        created_at, updated_at, unit_id,
        units:unit_id(id, name, code, description)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (unit_id) {
      query = query.eq('unit_id', unit_id);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    query = query.range(offset, offset + limitNum - 1);

    const { data: qrCodes, error, count } = await query;

    if (error) {
      console.error('Error fetching public QR codes:', error);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data QR codes'
      });
    }

    // Add mock analytics if requested
    const qrCodesWithAnalytics = (qrCodes || []).map((qr: any) => ({
      ...qr,
      analytics: include_analytics === 'true' ? {
        scans_30d: qr.usage_count || 0,
        tickets_30d: Math.floor((qr.usage_count || 0) * 0.7),
        trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10))
      } : undefined
    }));

    const totalPages = Math.ceil((count || qrCodes?.length || 0) / limitNum);

    res.json({
      qr_codes: qrCodesWithAnalytics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || qrCodes?.length || 0,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in get public QR codes:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// Response templates (read-only)
router.get('/response-templates', masterDataController.getResponseTemplates);

// AI trust settings (read-only)
router.get('/ai-trust-settings', masterDataController.getAITrustSettings);

export default router;