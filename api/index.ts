import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import semua handlers dari folder lib/public
import appSettingsHandler from './lib/public/app-settings';
import escalationHandler from './lib/public/escalation';
import externalTicketsHandler from './lib/public/external-tickets';
import internalTicketsHandler from './lib/public/internal-tickets';
import qrCodesHandler from './lib/public/qr-codes';
import responseTemplatesHandler from './lib/public/response-templates';
import rolesHandler from './lib/public/roles';
import surveyStatsHandler from './lib/public/survey-stats';
import surveysHandler from './lib/public/surveys';
import ticketsHandler from './lib/public/tickets';
import trackTicketHandler from './lib/public/track-ticket';
import usersHandler from './lib/public/users';
import userByIdHandler from './lib/public/users/[id]';
import surveyAddressStatsHandler from './lib/public/surveys/address-stats';
import surveyIkmByUnitHandler from './lib/public/surveys/ikm-by-unit';
import surveyResponsesHandler from './lib/public/surveys/responses';
import surveyStatsDetailHandler from './lib/public/surveys/stats';

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
    // Parse URL path
    const path = req.url?.replace(/^\/api/, '') || '';
    console.log(`🎯 ${req.method} ${path}`);

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
    console.error('❌ Unified handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error.message
    });
  }
}
