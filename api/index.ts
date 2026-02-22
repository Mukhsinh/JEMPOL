import type { VercelRequest, VercelResponse } from '@vercel/node';

import appSettingsHandler from './lib/handlers/app-settings';
import escalationHandler from './lib/handlers/escalation';
import externalTicketsHandler from './lib/handlers/external-tickets';
import internalTicketsHandler from './lib/handlers/internal-tickets';
import qrCodesHandler from './lib/handlers/qr-codes';
import responseTemplatesHandler from './lib/handlers/response-templates';
import rolesHandler from './lib/handlers/roles';
import surveyStatsHandler from './lib/handlers/survey-stats';
import surveysHandler from './lib/handlers/surveys';
import ticketActionsHandler from './lib/handlers/ticket-actions';
import ticketsHandler from './lib/handlers/tickets';
import trackTicketHandler from './lib/handlers/track-ticket';
import unitsHandler from './lib/handlers/units';
import usersHandler from './lib/handlers/users';
import userByIdHandler from './lib/handlers/users/[id]';
import surveyAddressStatsHandler from './lib/handlers/surveys/address-stats';
import surveyIkmByUnitHandler from './lib/handlers/surveys/ikm-by-unit';
import surveyResponsesHandler from './lib/handlers/surveys/responses';
import surveyStatsDetailHandler from './lib/handlers/surveys/stats';

const isProd = process.env.NODE_ENV === 'production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    let path = req.url?.split('?')[0] || '';
    
    if (path.startsWith('/api')) {
      path = path.substring(4);
    }
    
    if (!isProd) {
      console.log(`🎯 ${req.method} ${path}`);
    }

    if (path.startsWith('/public/app-settings')) return appSettingsHandler(req, res);
    if (path.startsWith('/public/escalation')) return escalationHandler(req, res);
    if (path.startsWith('/public/external-tickets')) return externalTicketsHandler(req, res);
    if (path.startsWith('/public/internal-tickets')) return internalTicketsHandler(req, res);
    if (path.startsWith('/public/qr-codes')) return qrCodesHandler(req, res);
    if (path.startsWith('/public/response-templates')) return responseTemplatesHandler(req, res);
    if (path.startsWith('/public/roles')) return rolesHandler(req, res);
    if (path.startsWith('/public/survey-stats')) return surveyStatsHandler(req, res);
    if (path.startsWith('/public/surveys/address-stats')) return surveyAddressStatsHandler(req, res);
    if (path.startsWith('/public/surveys/ikm-by-unit')) return surveyIkmByUnitHandler(req, res);
    if (path.startsWith('/public/surveys/responses')) return surveyResponsesHandler(req, res);
    if (path.startsWith('/public/surveys/stats')) return surveyStatsDetailHandler(req, res);
    if (path.startsWith('/public/surveys')) return surveysHandler(req, res);
    if (path.startsWith('/public/ticket-actions')) return ticketActionsHandler(req, res);
    if (path.startsWith('/public/tickets')) return ticketsHandler(req, res);
    if (path.startsWith('/public/track-ticket')) return trackTicketHandler(req, res);
    if (path.startsWith('/public/units')) return unitsHandler(req, res);
    
    const userIdMatch = path.match(/^\/public\/users\/([a-f0-9-]{36})$/i);
    if (userIdMatch) {
      req.query.id = userIdMatch[1];
      return userByIdHandler(req, res);
    }
    
    if (path.startsWith('/public/users')) return usersHandler(req, res);

    return res.status(404).json({
      success: false,
      error: 'API endpoint tidak ditemukan',
      path: path
    });

  } catch (error: any) {
    console.error('❌ API error:', error.message);
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: isProd ? undefined : error.message
    });
  }
}
