import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import semua handlers dari folder lib/handlers (bukan public untuk menghindari Vercel auto-detect)
import appSettingsHandler from './lib/handlers/app-settings';
import escalationHandler from './lib/handlers/escalation';
import externalTicketsHandler from './lib/handlers/external-tickets';
import internalTicketsHandler from './lib/handlers/internal-tickets';
import qrCodesHandler from './lib/handlers/qr-codes';
import responseTemplatesHandler from './lib/handlers/response-templates';
import rolesHandler from './lib/handlers/roles';
import surveyStatsHandler from './lib/handlers/survey-stats';
import surveysHandler from './lib/handlers/surveys';
import ticketsHandler from './lib/handlers/tickets';
import trackTicketHandler from './lib/handlers/track-ticket';
import usersHandler from './lib/handlers/users';
import userByIdHandler from './lib/handlers/users/[id]';
import surveyAddressStatsHandler from './lib/handlers/surveys/address-stats';
import surveyIkmByUnitHandler from './lib/handlers/surveys/ikm-by-unit';
import surveyResponsesHandler from './lib/handlers/surveys/responses';
import surveyStatsDetailHandler from './lib/handlers/surveys/stats';

/**
 * Unified API Handler untuk Vercel
 * Menggabungkan semua endpoints menjadi satu function untuk menghindari limit 12 functions di Hobby plan
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    // Parse URL path - handle both /api/public/... dan /public/...
    let path = req.url?.split('?')[0] || ''; // Remove query string
    
    // Normalize path - remove /api prefix if exists
    if (path.startsWith('/api')) {
      path = path.substring(4);
    }
    
    console.log(`🎯 ${req.method} ${path} (original: ${req.url})`);
    console.log(`📋 Query params:`, req.query);
    console.log(`🔍 Checking track-ticket route: path="${path}", startsWith="/public/track-ticket"=${path.startsWith('/public/track-ticket')}`);

    // Route ke handler yang sesuai berdasarkan path
    if (path.startsWith('/public/app-settings')) {
      return appSettingsHandler(req, res);
    }
    
    if (path.startsWith('/public/escalation')) {
      return escalationHandler(req, res);
    }
    
    if (path.startsWith('/public/external-tickets')) {
      return externalTicketsHandler(req, res);
    }
    
    if (path.startsWith('/public/internal-tickets')) {
      return internalTicketsHandler(req, res);
    }
    
    if (path.startsWith('/public/qr-codes')) {
      return qrCodesHandler(req, res);
    }
    
    if (path.startsWith('/public/response-templates')) {
      return responseTemplatesHandler(req, res);
    }
    
    if (path.startsWith('/public/roles')) {
      return rolesHandler(req, res);
    }
    
    if (path.startsWith('/public/survey-stats')) {
      return surveyStatsHandler(req, res);
    }
    
    if (path.startsWith('/public/surveys/address-stats')) {
      return surveyAddressStatsHandler(req, res);
    }
    
    if (path.startsWith('/public/surveys/ikm-by-unit')) {
      return surveyIkmByUnitHandler(req, res);
    }
    
    if (path.startsWith('/public/surveys/responses')) {
      return surveyResponsesHandler(req, res);
    }
    
    if (path.startsWith('/public/surveys/stats')) {
      return surveyStatsDetailHandler(req, res);
    }
    
    if (path.startsWith('/public/surveys')) {
      return surveysHandler(req, res);
    }
    
    if (path.startsWith('/public/tickets')) {
      return ticketsHandler(req, res);
    }
    
    if (path.startsWith('/public/track-ticket')) {
      console.log('✅ Routing to track-ticket handler');
      return trackTicketHandler(req, res);
    }
    
    // Handle /public/users/[id] - harus sebelum /public/users
    if (path.match(/^\/public\/users\/[^/]+$/)) {
      // Extract ID dari path dan masukkan ke query
      const id = path.split('/').pop();
      if (id) {
        req.query.id = id;
      }
      return userByIdHandler(req, res);
    }
    
    if (path.startsWith('/public/users')) {
      return usersHandler(req, res);
    }

    // Route tidak ditemukan
    return res.status(404).json({
      success: false,
      error: 'API endpoint tidak ditemukan',
      path: path
    });

  } catch (error: any) {
    console.error('❌ Unified handler error:', {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      url: req.url,
      method: req.method
    });
    
    // Pastikan response selalu JSON
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message,
      debug: {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      }
    });
  }
}
